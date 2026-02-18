<?php

namespace App\Services\Empresas;

use App\Models\Empresas;
use App\Models\RegistroIngresos;
use App\Models\Carteras;
use App\Services\Carteras\CarteraReportarService;
use Illuminate\Support\Facades\DB;

class HabilEmpresaService
{
    /**
     * Crear nueva empresa
     */
    public function create(array $data)
    {
        $empresa = $this->findEmpresaByNit(intval($data['nit']));
        if ($empresa != false) return false;
        
        $empresa = Empresas::create($data);
        return $empresa;
    }

    /**
     * Actualizar empresa existente
     */
    public function update(array $setting, $nit): bool
    {
        $updateData = [];
        foreach ($setting as $field) {
            if (strpos($field, '=') !== false) {
                list($column, $value) = explode('=', $field, 2);
                $updateData[trim($column)] = trim($value, "'");
            }
        }
        
        return Empresas::where('nit', $nit)->update($updateData) > 0;
    }

    /**
     * Buscar empresa por NIT
     */
    public function findEmpresaByNit($nit)
    {
        return Empresas::where('nit', $nit)->first();
    }

    /**
     * Crear o actualizar empresa con preregistro
     */
    public function previosCreateEmpresa($data, $cruzar_cartera, $crear_pre_registro, $tipo_ingreso)
    {
        $empresa = $this->findEmpresaByNit($data['nit']);
        if ($empresa == false) {
            $empresa = $this->create($data);
        } else {
            $this->update([
                "cedrep={$data['cedrep']}",
                "razsoc='{$data['razsoc']}'",
                "telefono='{$data['telefono']}'",
                "email='{$data['email']}'",
                "repleg='{$data['repleg']}'",
                "asamblea_id={$data['asamblea_id']}"
            ], $empresa->nit);
        }

        $registroIngreso = RegistroIngresos::where('nit', $empresa->nit)
            ->where('asamblea_id', $data['asamblea_id'])
            ->where('cedula_representa', $data['cedrep'])
            ->first();

        /**
         * Se crea el pre registro de ingreso a la asamblea
         */
        if ($crear_pre_registro == 1) {
            if (!$registroIngreso) {
                $documento = RegistroIngresos::max('documento') ?: 1;
                
                $registroIngreso = RegistroIngresos::create([
                    "documento" => $documento + 1,
                    'fecha' => now()->format('Y-m-d'),
                    "hora" => now()->format('H:i:s'),
                    "nit" => intval($empresa->nit),
                    "usuario" => 1,
                    "estado" => 'P',
                    "votos" => 1,
                    "mesa_id" => 0,
                    "tipo_ingreso" => $tipo_ingreso ?? 'P',
                    "asamblea_id" => $data['asamblea_id'],
                    "cedula_representa" => $data['cedrep'],
                    "nombre_representa" => $data['repleg'],
                ]);
            } else {
                /**
                 * Se actualiza el pre registro a la asamblea 
                 */
                $registroIngreso->update([
                    "estado" => 'P',
                    "votos" => '1'
                ]);
            }
        }

        $carteras = Carteras::where('nit', $empresa->nit)->first();
        
        // Cruzar con cartera de rechazo
        if ($cruzar_cartera == 1 && $carteras && $registroIngreso) {
            $criterio = $carteras->getCriterioId(); // Método que debe existir en el modelo Carteras

            $registroIngreso->update([
                "estado" => 'R',
                "votos" => '0'
            ]);

            $carteraReportarServices = new CarteraReportarService($data['asamblea_id']);
            $carteraReportarServices->creaRechazoByRegister($registroIngreso, $criterio);
        }

        return $empresa;
    }

    /**
     * Eliminar empresa y sus registros
     */
    public function removeEmpresa($nit, $asamblea_id)
    {
        $empresa = $this->findEmpresaByNit(intval($nit));
        if ($empresa) {
            $registroIngreso = RegistroIngresos::where('nit', $empresa->nit)
                ->where('asamblea_id', $asamblea_id)
                ->first();
            
            if ($registroIngreso) {
                $registroIngreso->delete();
            }

            if (!$empresa->delete()) {
                throw new \Exception('No se puede borrar la empresa', 1);
            }
        }
        
        return true;
    }
}
