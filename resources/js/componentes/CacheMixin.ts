import { CacheManager, cacheCollection, getCachedCollection, cacheModel, getCachedModel } from './CacheManager';

/**
 * Mixin para agregar capacidades de cache a cualquier Backbone class
 */
export const CacheMixin = {
    Collections: {} as any,
    /**
     * Guarda una collection en cache con configuración automática
     */
    cacheCollection(name: string, config?: { persistent?: boolean; ttl?: number }) {
        if (!this.Collections || !this.Collections[name]) {
            console.warn(`Collection ${name} no encontrada en this.Collections`);
            return;
        }

        const defaultConfig = {
            persistent: false,
            ttl: 30 * 60 * 1000, // 30 minutos
            ...config
        };

        cacheCollection(name, this.Collections[name], defaultConfig);
        console.log(`Collection ${name} cacheada con config:`, defaultConfig);
    },

    /**
     * Obtiene una collection desde cache
     */
    getCachedCollection(name: string, CollectionClass: any) {
        const cached = getCachedCollection(name, CollectionClass);
        if (cached) {
            this.Collections[name] = cached;
            console.log(`Collection ${name} recuperada desde cache`);
            return true;
        }
        console.log(`Collection ${name} no encontrada en cache`);
        return false;
    },

    /**
     * Guarda un model en cache
     */
    cacheModel(name: string, model: any, config?: { persistent?: boolean; ttl?: number }) {
        const defaultConfig = {
            persistent: false,
            ttl: 30 * 60 * 1000,
            ...config
        };

        cacheModel(name, model, defaultConfig);
        console.log(`Model ${name} cacheado`);
    },

    /**
     * Obtiene un model desde cache
     */
    getCachedModel(name: string, id: string, ModelClass: any) {
        const cached = getCachedModel(name, id, ModelClass);
        if (cached) {
            console.log(`Model ${name}:${id} recuperado desde cache`);
            return cached;
        }
        console.log(`Model ${name}:${id} no encontrado en cache`);
        return null;
    },

    /**
     * Verifica si existe una collection en cache
     */
    hasCachedCollection(name: string): boolean {
        return CacheManager.hasCollection(name);
    },

    /**
     * Verifica si existe un model en cache
     */
    hasCachedModel(name: string, id: string): boolean {
        return CacheManager.hasModel(name, id);
    },

    /**
     * Elimina una collection del cache
     */
    removeCachedCollection(name: string): void {
        CacheManager.removeCollection(name);
        console.log(`Collection ${name} eliminada del cache`);
    },

    /**
     * Elimina un model del cache
     */
    removeCachedModel(name: string, id: string): void {
        CacheManager.removeModel(name, id);
        console.log(`Model ${name}:${id} eliminado del cache`);
    },

    /**
     * Limpia todo el cache
     */
    clearCache(): void {
        CacheManager.clear();
        console.log('Cache limpiado completamente');
    },

    /**
     * Limpia cache expirado
     */
    cleanupCache(): void {
        CacheManager.cleanup();
        console.log('Cache expirado limpiado');
    },

    /**
     * Obtiene estadísticas del cache
     */
    getCacheStats() {
        return CacheManager.getStats();
    }
};

/**
 * Función para aplicar el mixin a una clase
 */
export function applyCacheMixin(targetClass: any) {
    Object.assign(targetClass.prototype, CacheMixin);
    return targetClass;
}

/**
 * Decorador para aplicar cache mixin automáticamente
 */
export function withCache<T extends { new(...args: any[]): {} }>(constructor: T) {
    return applyCacheMixin(constructor);
}
