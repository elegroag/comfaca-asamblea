import { SesionStorage, BoxStorage } from './useStorage';

// Interfaces para tipado fuerte
interface CacheEntry<T> {
    data: T;
    timestamp: number;
    ttl?: number; // Time to live en milisegundos
    version: number;
}

interface CacheConfig {
    ttl?: number; // Time to live default
    persistent?: boolean; // Si persiste en localStorage o solo en memoria
    maxSize?: number; // Máximo de items en cache
}

// Tipos para Backbone
type BackboneCollection = any; // Backbone.Collection
type BackboneModel = any; // Backbone.Model

class GlobalCacheManager {
    private static instance: GlobalCacheManager | null = null;
    private memoryCache: Map<string, CacheEntry<any>>;
    private persistentCache: Map<string, BoxStorage<CacheEntry<any>>>;
    private defaultConfig: CacheConfig;

    private constructor() {
        this.memoryCache = new Map();
        this.persistentCache = new Map();
        this.defaultConfig = {
            ttl: 30 * 60 * 1000, // 30 minutos default
            persistent: false,
            maxSize: 100
        };
        this.loadPersistentCache();
    }

    static getInstance(): GlobalCacheManager {
        if (!GlobalCacheManager.instance) {
            GlobalCacheManager.instance = new GlobalCacheManager();
        }
        return GlobalCacheManager.instance;
    }

    /**
     * Carga cache persistente desde localStorage
     */
    private loadPersistentCache(): void {
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (!key || !key.startsWith('cache_')) continue;

            const raw = localStorage.getItem(key);
            if (!raw) continue;

            try {
                const entry = JSON.parse(raw) as CacheEntry<any>;
                if (this.isValidEntry(entry)) {
                    const storage = new BoxStorage(key, entry);
                    this.persistentCache.set(key, storage);
                } else {
                    localStorage.removeItem(key); // Limpiar entradas expiradas
                }
            } catch (error) {
                console.warn('Error loading cache entry:', key, error);
                localStorage.removeItem(key);
            }
        }
    }

    /**
     * Verifica si una entrada de cache es válida
     */
    private isValidEntry<T>(entry: CacheEntry<T>): boolean {
        if (!entry.timestamp) return false;
        if (entry.ttl && Date.now() - entry.timestamp > entry.ttl) return false;
        return true;
    }

    /**
     * Genera key para cache
     */
    private generateKey(type: 'collection' | 'model', name: string, id?: string): string {
        const baseKey = `cache_${type}_${name}`;
        return id ? `${baseKey}_${id}` : baseKey;
    }

    /**
     * Guarda una Collection en cache
     */
    setCollection(name: string, collection: BackboneCollection, config: CacheConfig = {}): void {
        const key = this.generateKey('collection', name);
        const finalConfig = { ...this.defaultConfig, ...config };

        // Serializar collection para cache
        const serializedData = this.serializeCollection(collection);

        const entry: CacheEntry<any> = {
            data: serializedData,
            timestamp: Date.now(),
            ttl: finalConfig.ttl,
            version: 1
        };

        if (finalConfig.persistent) {
            const storage = this.persistentCache.get(key) || new BoxStorage(key);
            storage.update(entry);
            this.persistentCache.set(key, storage);
        } else {
            this.memoryCache.set(key, entry);
            this.enforceMaxSize();
        }
    }

    /**
     * Guarda un Model en cache
     */
    setModel(name: string, model: BackboneModel, config: CacheConfig = {}): void {
        const id = model.id || model.get('id');
        const key = this.generateKey('model', name, String(id));
        const finalConfig = { ...this.defaultConfig, ...config };

        // Serializar model para cache
        const serializedData = this.serializeModel(model);

        const entry: CacheEntry<any> = {
            data: serializedData,
            timestamp: Date.now(),
            ttl: finalConfig.ttl,
            version: 1
        };

        if (finalConfig.persistent) {
            const storage = this.persistentCache.get(key) || new BoxStorage(key);
            storage.update(entry);
            this.persistentCache.set(key, storage);
        } else {
            this.memoryCache.set(key, entry);
            this.enforceMaxSize();
        }
    }

    /**
     * Obtiene una Collection del cache
     */
    getCollection(name: string, CollectionClass: any): BackboneCollection | null {
        const key = this.generateKey('collection', name);

        // Intentar memoria primero
        let entry = this.memoryCache.get(key);

        // Si no está en memoria, intentar persistente
        if (!entry) {
            const storage = this.persistentCache.get(key);
            if (storage && storage.value) {
                entry = storage.value;
                // Mover a memoria para acceso rápido
                this.memoryCache.set(key, entry);
            }
        }

        if (!entry || !this.isValidEntry(entry)) {
            this.remove(key);
            return null;
        }

        // Deserializar y restaurar collection
        return this.deserializeCollection(entry.data, CollectionClass);
    }

    /**
     * Obtiene un Model del cache
     */
    getModel(name: string, id: string, ModelClass: any): BackboneModel | null {
        const key = this.generateKey('model', name, id);

        // Intentar memoria primero
        let entry = this.memoryCache.get(key);

        // Si no está en memoria, intentar persistente
        if (!entry) {
            const storage = this.persistentCache.get(key);
            if (storage && storage.value) {
                entry = storage.value;
                // Mover a memoria para acceso rápido
                this.memoryCache.set(key, entry);
            }
        }

        if (!entry || !this.isValidEntry(entry)) {
            this.remove(key);
            return null;
        }

        // Deserializar y restaurar model
        return this.deserializeModel(entry.data, ModelClass);
    }

    /**
     * Serializa una Collection para cache
     */
    private serializeCollection(collection: BackboneCollection): any {
        return {
            models: collection.map((model: any) => model.toJSON()),
            length: collection.length,
            // Otros atributos relevantes de la collection
            state: collection.state || null,
            metadata: collection.metadata || null
        };
    }

    /**
     * Serializa un Model para cache
     */
    private serializeModel(model: BackboneModel): any {
        return {
            attributes: model.toJSON(),
            id: model.id,
            cid: model.cid
        };
    }

    /**
     * Deserializa y restaura una Collection
     */
    private deserializeCollection(data: any, CollectionClass: any): BackboneCollection {
        const collection = new CollectionClass();

        // Restaurar modelos
        if (data.models && Array.isArray(data.models)) {
            collection.set(data.models);
        }

        // Restaurar otros atributos
        if (data.state) collection.state = data.state;
        if (data.metadata) collection.metadata = data.metadata;

        return collection;
    }

    /**
     * Deserializa y restaura un Model
     */
    private deserializeModel(data: any, ModelClass: any): BackboneModel {
        const model = new ModelClass(data.attributes);

        // Restaurar ID y CID si existen
        if (data.id) model.set('id', data.id);
        if (data.cid) model.cid = data.cid;

        return model;
    }

    /**
     * Elimina una entrada del cache
     */
    private remove(key: string): void {
        this.memoryCache.delete(key);

        const storage = this.persistentCache.get(key);
        if (storage) {
            storage.delete();
            this.persistentCache.delete(key);
        }
    }

    /**
     * Elimina una collection del cache
     */
    removeCollection(name: string): void {
        const key = this.generateKey('collection', name);
        this.remove(key);
    }

    /**
     * Elimina un model del cache
     */
    removeModel(name: string, id: string): void {
        const key = this.generateKey('model', name, id);
        this.remove(key);
    }

    /**
     * Limpia todo el cache
     */
    clear(): void {
        this.memoryCache.clear();

        for (const storage of this.persistentCache.values()) {
            storage.delete();
        }
        this.persistentCache.clear();
    }

    /**
     * Limpia cache expirado
     */
    cleanup(): void {
        // Limpiar memoria
        for (const [key, entry] of this.memoryCache.entries()) {
            if (!this.isValidEntry(entry)) {
                this.memoryCache.delete(key);
            }
        }

        // Limpiar persistente
        for (const [key, storage] of this.persistentCache.entries()) {
            if (storage.value && !this.isValidEntry(storage.value)) {
                storage.delete();
                this.persistentCache.delete(key);
            }
        }
    }

    /**
     * Fuerza el tamaño máximo del cache
     */
    private enforceMaxSize(): void {
        if (this.memoryCache.size <= this.defaultConfig.maxSize!) return;

        // Ordenar por timestamp y eliminar los más viejos
        const entries = Array.from(this.memoryCache.entries())
            .sort((a, b) => a[1].timestamp - b[1].timestamp);

        const toDelete = entries.slice(0, entries.length - this.defaultConfig.maxSize!);
        toDelete.forEach(([key]) => this.memoryCache.delete(key));
    }

    /**
     * Obtiene estadísticas del cache
     */
    getStats(): {
        memorySize: number;
        persistentSize: number;
        totalSize: number;
        keys: string[];
    } {
        return {
            memorySize: this.memoryCache.size,
            persistentSize: this.persistentCache.size,
            totalSize: this.memoryCache.size + this.persistentCache.size,
            keys: [
                ...Array.from(this.memoryCache.keys()),
                ...Array.from(this.persistentCache.keys())
            ]
        };
    }

    /**
     * Verifica si existe una collection en cache
     */
    hasCollection(name: string): boolean {
        const key = this.generateKey('collection', name);
        return this.memoryCache.has(key) || this.persistentCache.has(key);
    }

    /**
     * Verifica si existe un model en cache
     */
    hasModel(name: string, id: string): boolean {
        const key = this.generateKey('model', name, id);
        return this.memoryCache.has(key) || this.persistentCache.has(key);
    }
}

// Instancia global
export const CacheManager = GlobalCacheManager.getInstance();

// Exportar clase para uso directo si es necesario
export { GlobalCacheManager };

// Helper functions para uso común
export const cacheCollection = (
    name: string,
    collection: BackboneCollection,
    config?: CacheConfig
) => CacheManager.setCollection(name, collection, config);

export const getCachedCollection = (
    name: string,
    CollectionClass: any
) => CacheManager.getCollection(name, CollectionClass);

export const cacheModel = (
    name: string,
    model: BackboneModel,
    config?: CacheConfig
) => CacheManager.setModel(name, model, config);

export const getCachedModel = (
    name: string,
    id: string,
    ModelClass: any
) => CacheManager.getModel(name, id, ModelClass);

export const clearCache = () => CacheManager.clear();
export const cleanupCache = () => CacheManager.cleanup();
