<?php

namespace App\Services\Empresas;

use App\Models\Empresas;
use App\Models\Poderes;
use App\Models\Carteras;
use App\Models\RegistroIngresos;
use Illuminate\Support\Facades\DB;

class BuscarEmpresaService
{
    private $idAsamblea;
    private $nit;

    public function __construct($idAsamblea, $nit)
    {
        $this->idAsamblea = $idAsamblea;
        $this->nit = $nit;
    }

    /**
     * Buscar empresa por NIT y validar disponibilidad de voto
     */
    public function findByNit()
    {
        $empresaEntity = Empresas::where('nit', $this->nit)->first();
        if (!$empresaEntity) {
            return ['isValid' => false, 'msj' => 'La empresa no existe para continuar'];
        }

        $empresa = DB::table('empresas')
            ->select([
                'nit',
                DB::raw("'A' as estado"),
                'telefono',
                'email',
                'razsoc',
                'repleg',
                'cedrep',
                DB::raw('1 as valida'),
                DB::raw("(SELECT COUNT(*) FROM poderes
                    WHERE poderes.poderdante_nit='{$this->nit}' AND poderes.asamblea_id='{$this->idAsamblea}' AND poderes.estado='A') as has_poderes"),
                DB::raw("(SELECT COUNT(*) FROM carteras
                    WHERE carteras.nit='{$this->nit}' AND carteras.asamblea_id='{$this->idAsamblea}') as has_cartera"),
                DB::raw("(SELECT COUNT(*) FROM registro_ingresos
                    WHERE registro_ingresos.nit='{$this->nit}' AND registro_ingresos.asamblea_id='{$this->idAsamblea}' AND registro_ingresos.estado IN('A','F')) as has_asistencia")
            ])
            ->where('nit', $this->nit)
            ->where('asamblea_id', $this->idAsamblea)
            ->first();

        if (!$empresa) {
            return ['isValid' => false, 'msj' => 'La empresa no está registrada en esta asamblea'];
        }

        $msjs = [];
        $has_voto_disponible = 1;

        // Validar que la empresa no pertenezca al mismo representante
        if ($empresa->valida == -1) {
            $has_voto_disponible = -1;
            $msjs[] = "La empresa pertenece al mismo representante.<br/>";
        }

        if ($empresa->has_poderes > 0) {
            $has_voto_disponible = -1;
            $msjs[] = "La empresa ha dado poder a otra empresa.<br/>";
        }

        if ($empresa->has_asistencia > 0) {
            $msjs[] = "La empresa ya posee asistencia.";
            $has_voto_disponible = -1;
        }

        if ($empresa->has_cartera > 0) {
            $msjs[] = "La empresa ya posee mora en cartera.";
            $has_voto_disponible = -1;
        }

        return [
            "empresa" => (array) $empresa,
            "has_voto_disponible" => $has_voto_disponible,
            "msj" => implode("\n", $msjs),
            'isValid' => ($has_voto_disponible == 1) ? true : false
        ];
    }
}
