<?php

namespace App\Services\Empresas;

use App\Models\Empresas;
use App\Models\RegistroIngresos;
use Illuminate\Support\Facades\DB;

class RegistroEmpresaService
{
    private $idAsamblea;

    public function __construct($idAsamblea)
    {
        $this->idAsamblea = $idAsamblea;
    }

    /**
     * Registrar ingreso por defecto para una empresa
     */
    public function registraIngresoDefault($data, $orden = 0)
    {
        $documento = RegistroIngresos::max('documento') ?: 1;

        $registroIngreso = RegistroIngresos::create([
            "documento" => $documento + 1,
            'fecha' => now()->format('Y-m-d'),
            "hora" => now()->format('H:i:s'),
            "nit" => intval($data['nit']),
            "usuario" => 1,
            "estado" => 'P',
            "votos" => 1,
            "mesa_id" => 0,
            "tipo_ingreso" => 'P',
            "asamblea_id" => $this->idAsamblea,
            'fecha_asistencia' => null,
            "cedula_representa" => $data['cedrep'],
            "nombre_representa" => $data['repleg'],
            "orden" => $orden
        ]);

        return $registroIngreso;
    }

    /**
     * Buscar preregistro por empresa
     */
    public function findPreRegistroByEmpresa($empresa)
    {
        if (is_array($empresa)) {
            return RegistroIngresos::where('cedula_representa', $empresa['cedrep'])
                ->where('nit', $empresa['nit'])
                ->first();
        }

        return RegistroIngresos::where('cedula_representa', $empresa->cedrep)
            ->where('nit', $empresa->nit)
            ->first();
    }

    /**
     * Buscar registro por NIT y cédula representante
     */
    public function findRegistroByNitCedrep($nit, $cedrep)
    {
        return RegistroIngresos::where('cedula_representa', $cedrep)
            ->where('nit', $nit)
            ->first();
    }

    /**
     * Buscar preregistro por empresa (versión alternativa)
     */
    public function findPreRegistroByEmpresaAlt(Empresas $empresa)
    {
        return RegistroIngresos::where('cedula_representa', $empresa->cedrep)
            ->where('nit', $empresa->nit)
            ->first();
    }
}
