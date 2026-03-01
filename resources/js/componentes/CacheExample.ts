import { CacheManager, cacheCollection, getCachedCollection, cacheModel, getCachedModel } from './CacheManager';
import EmpresasCollection from '@/collections/EmpresasCollection';
import HabilesCollection from '@/componentes/habiles/collections/HabilesCollection';
import Empresa from '@/models/Empresa';

/**
 * Ejemplo de uso del CacheManager Global
 */
export class CacheExample {
    
    /**
     * Ejemplo 1: Cachear una collection después de cargar desde API
     */
    static async ejemploCargarYCacheEmpresas(api: any) {
        console.log('=== Ejemplo 1: Cargar y cachear empresas ===');
        
        // 1. Intentar obtener desde cache primero
        let empresas = getCachedCollection('empresas', EmpresasCollection);
        
        if (empresas) {
            console.log('✅ Empresas recuperadas desde cache:', empresas.length, 'items');
            return empresas;
        }
        
        console.log('📡 Cargando empresas desde API...');
        
        // 2. Si no está en cache, cargar desde API
        try {
            const response = await api.get('/habiles/listar');
            
            if (response?.success) {
                // 3. Crear collection y poblarla
                empresas = new EmpresasCollection();
                empresas.set(response.empresas);
                
                // 4. Guardar en cache para uso futuro
                cacheCollection('empresas', empresas, {
                    persistent: true, // Se guarda en localStorage
                    ttl: 60 * 60 * 1000 // 1 hora de validez
                });
                
                console.log('💾 Empresas cacheadas exitosamente:', empresas.length, 'items');
                return empresas;
            }
        } catch (error) {
            console.error('❌ Error cargando empresas:', error);
            return null;
        }
    }
    
    /**
     * Ejemplo 2: Trabajar con models individuales
     */
    static ejemploCachearModelIndividual() {
        console.log('=== Ejemplo 2: Cachear model individual ===');
        
        // Crear un model de empresa
        const empresa = new Empresa({
            id: '12345',
            nit: '900123456',
            razon_social: 'Empresa Ejemplo SA',
            representante: 'Juan Pérez'
        });
        
        // Cachear el model individual
        cacheModel('empresa', empresa, {
            persistent: true,
            ttl: 30 * 60 * 1000 // 30 minutos
        });
        
        console.log('💾 Model cacheado:', empresa.toJSON());
        
        // Recuperar el model desde cache
        const cachedEmpresa = getCachedModel('empresa', '12345', Empresa);
        
        if (cachedEmpresa) {
            console.log('✅ Model recuperado desde cache:', cachedEmpresa.toJSON());
        }
    }
    
    /**
     * Ejemplo 3: Integración con un controller Backbone
     */
    static ejemploIntegracionController() {
        console.log('=== Ejemplo 3: Integración con Controller ===');
        
        // Simular un controller con collections
        const controller = {
            Collections: {
                empresas: null as any,
                habiles: null as any
            },
            
            // Método para inicializar collections desde cache
            initializeFromCache() {
                console.log('🔄 Inicializando collections desde cache...');
                
                // Intentar cargar desde cache
                const cachedEmpresas = getCachedCollection('empresas', EmpresasCollection);
                const cachedHabiles = getCachedCollection('habiles', HabilesCollection);
                
                this.Collections.empresas = cachedEmpresas || new EmpresasCollection();
                this.Collections.habiles = cachedHabiles || new HabilesCollection();
                
                if (cachedEmpresas && cachedHabiles) {
                    console.log('✅ Todas las collections cargadas desde cache');
                    return true;
                } else {
                    console.log('⚠️ Algunas collections no encontradas en cache, se inicializarán vacías');
                    return false;
                }
            },
            
            // Método para guardar collections en cache
            saveToCache() {
                console.log('💾 Guardando collections en cache...');
                
                if (this.Collections.empresas?.length) {
                    cacheCollection('empresas', this.Collections.empresas, {
                        persistent: true,
                        ttl: 60 * 60 * 1000
                    });
                }
                
                if (this.Collections.habiles?.length) {
                    cacheCollection('habiles', this.Collections.habiles, {
                        persistent: true,
                        ttl: 60 * 60 * 1000
                    });
                }
                
                console.log('✅ Collections guardadas en cache');
            },
            
            // Método para limpiar cache
            clearCache() {
                CacheManager.clear();
                console.log('🧹 Cache limpiado completamente');
            }
        };
        
        // Demostrar uso
        controller.initializeFromCache();
        controller.saveToCache();
        
        return controller;
    }
    
    /**
     * Ejemplo 4: Monitoreo y estadísticas del cache
     */
    static ejemploMonitoreoCache() {
        console.log('=== Ejemplo 4: Monitoreo del Cache ===');
        
        // Obtener estadísticas
        const stats = CacheManager.getStats();
        console.log('📊 Estadísticas del cache:', stats);
        
        // Verificar si existen items específicos
        console.log('🔍 ¿Existe collection empresas?', CacheManager.hasCollection('empresas'));
        console.log('🔍 ¿Existe collection habiles?', CacheManager.hasCollection('habiles'));
        console.log('🔍 ¿Existe model empresa:12345?', CacheManager.hasModel('empresa', '12345'));
        
        // Limpiar cache expirado
        CacheManager.cleanup();
        console.log('🧹 Cache expirado limpiado');
        
        // Estadísticas después de limpieza
        const statsAfterCleanup = CacheManager.getStats();
        console.log('📊 Estadísticas después de limpieza:', statsAfterCleanup);
    }
    
    /**
     * Ejemplo 5: Estrategias avanzadas de cache
     */
    static ejemploEstrategiasAvanzadas() {
        console.log('=== Ejemplo 5: Estrategias Avanzadas ===');
        
        // Estrategia 1: Cache en memoria para acceso rápido (sesión actual)
        cacheCollection('empresas_fast', new EmpresasCollection(), {
            persistent: false, // Solo en memoria
            ttl: 10 * 60 * 1000 // 10 minutos
        });
        
        // Estrategia 2: Cache persistente para datos importantes
        cacheCollection('empresas_persistent', new EmpresasCollection(), {
            persistent: true, // En localStorage
            ttl: 24 * 60 * 60 * 1000 // 24 horas
        });
        
        // Estrategia 3: Cache con TTL corto para datos volátiles
        cacheCollection('datos_volatiles', new EmpresasCollection(), {
            persistent: false,
            ttl: 5 * 60 * 1000 // 5 minutos
        });
        
        console.log('✅ Estrategias de cache aplicadas');
        
        // Mostrar diferencias
        const stats = CacheManager.getStats();
        console.log('📊 Cache con múltiples estrategias:', stats);
    }
    
    /**
     * Ejemplo completo de flujo de trabajo
     */
    static async ejemploFlujoComplejo(api: any) {
        console.log('🚀 === Ejemplo: Flujo Complejo de Cache ===');
        
        // 1. Inicializar
        const controller = this.ejemploIntegracionController();
        
        // 2. Cargar datos si es necesario
        if (!controller.Collections.empresas.length) {
            await this.ejemploCargarYCacheEmpresas(api);
            controller.Collections.empresas = getCachedCollection('empresas', EmpresasCollection);
        }
        
        // 3. Trabajar con models individuales
        this.ejemploCachearModelIndividual();
        
        // 4. Monitorear estado
        this.ejemploMonitoreoCache();
        
        // 5. Aplicar estrategias avanzadas
        this.ejemploEstrategiasAvanzadas();
        
        console.log('✅ Flujo completado exitosamente');
        
        return {
            controller,
            stats: CacheManager.getStats(),
            empresasCount: controller.Collections.empresas.length,
            hasData: controller.Collections.empresas.length > 0
        };
    }
}

// Exportar para uso fácil
export default CacheExample;
