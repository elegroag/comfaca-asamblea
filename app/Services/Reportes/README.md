# Servicio de Reportes Laravel

Este paquete contiene la migración del sistema de generación de reportes desde Kumbia PHP a Laravel.

## Estructura

- **Interfaces**: `ReportFactoryInterface`, `ReportGeneratorInterface`
- **Factories**: `ExcelReportFactory`, `PDFReportFactory`
- **Generators**: `ExcelReportGenerator`, `PDFReportGenerator`
- **Utilidades**: `CsvToExcelGenerator`, `Tpdf`
- **Servicio Principal**: `ReporteService`
- **Helper**: `ReportesHelper`
- **ServiceProvider**: `ReportesServiceProvider`

## Uso Básico

### Generar Reporte Excel

```php
use App\Services\Reportes\ReportesHelper;

// Simple
$archivo = ReportesHelper::crearExcel(
    'Título del Reporte',
    'nombre_archivo',
    ['Columna 1', 'Columna 2', 'Columna 3'],
    $datos
);

// Avanzado
$generator = ReportesHelper::getExcelGenerator();
$generator->generateReport('Título', 'archivo', $columnas);
$generator->addDataArray($datos, 0);
$archivo = $generator->outFile();
```

### Generar Reporte PDF

```php
use App\Services\Reportes\ReportesHelper;

$archivo = ReportesHelper::crearPdf(
    'Título del Reporte',
    'nombre_archivo',
    ['Columna 1', 'Columna 2']
);
```

### Convertir Datos a Excel

```php
use App\Services\Reportes\ReportesHelper;

$archivo = ReportesHelper::convertirDatosAExcel('nombre_archivo', $datos);
```

## Compatibilidad con Kumbia

El helper mantiene compatibilidad con el patrón original de Kumbia:

```php
// Equivalente a Core::importLibrary('Reportes', 'Factory')
$factory = ReportesHelper::factory('excel');
$generator = $factory->createReportGenerator();
```

## Configuración

El servicio está registrado automáticamente a través del `ReportesServiceProvider` en `config/app.php`.

## Dependencias

- `phpoffice/phpspreadsheet`: Para generación de archivos Excel
- `tecnickcom/tcpdf`: Para generación de archivos PDF

## Archivos Generados

Los archivos se guardan en `storage/app/temp/` y son accesibles a través de la URL `/storage/temp/`.
