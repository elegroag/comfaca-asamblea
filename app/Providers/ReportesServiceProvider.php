<?php

namespace App\Providers;

use App\Services\Reportes\Libs\ReporteService;
use App\Services\Reportes\Libs\ReportFactoryInterface;
use ExcelReportFactory;
use Illuminate\Support\ServiceProvider;
use PDFReportFactory;

class ReportesServiceProvider extends ServiceProvider
{
    /**
     * Register services.
     */
    public function register(): void
    {
        // Bind de interfaces a implementaciones
        $this->app->bind(ReportFactoryInterface::class, function ($app, $params) {
            $type = $params['type'] ?? 'excel';

            return match ($type) {
                'excel' => new ExcelReportFactory(),
                'pdf' => new PDFReportFactory(),
                default => new ExcelReportFactory(),
            };
        });

        // Bind del servicio principal
        $this->app->singleton(ReporteService::class, function ($app) {
            return new ReporteService(
                $app->make(ReportFactoryInterface::class, ['type' => 'excel'])
            );
        });
    }

    /**
     * Bootstrap services.
     */
    public function boot(): void
    {
        // Publicar configuración si es necesario
        if ($this->app->runningInConsole()) {
            $this->publishes([
                __DIR__ . '/../config/reportes.php' => config_path('reportes.php'),
            ], 'reportes-config');
        }
    }
}
