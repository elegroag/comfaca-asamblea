<?php

namespace App\Services\Poderes;

use App\Models\Poderes;
use App\Models\Empresas;
use App\Models\RegistroIngresos;
use App\Models\Rechazos;
use App\Models\AsaRepresentantes;
use App\Models\Carteras;
use Illuminate\Support\Facades\DB;

class RegistraRechazoPoderService
{
    private $idAsamblea;
    private $poderdante;
    private $apoderado;
    private $poderEntity;
    private $registroEmpresaService;

    public function __construct($idAsamblea)
    {
        $this->idAsamblea = $idAsamblea;
        $this->registroEmpresaService = new \App\Services\Empresas\RegistroEmpresaService($idAsamblea);
    }

    /**
     * Registrar un poder rechazado
     */
    public function main($data)
    {
        $apoderado_nit = $data['nit1'];
        $apoderado_razsoc = $data['razsoc1'];
        $apoderado_cedrep = $data['cedrep1'];
        $apoderado_repleg = $data['repleg1'];
        $poderdante_nit = $data['nit2'];
        $poderdante_razsoc = $data['razsoc2'];
        $poderdante_cedrep = $data['cedrep2'];
        $poderdante_repleg = $data['repleg2'];
        $radicado = $data['radicado'];
        $notificacion = $data['notificacion'];

        // Verificar si ya existe el poder
        $poder = Poderes::where('apoderado_nit', $apoderado_nit)
            ->where('poderdante_nit', $poderdante_nit)
            ->first();

        if ($poder) {
            throw new \Exception("Error el poder ya está registrado.", 1);
        }

        // Verificar si el radicado ya existe
        $poder = Poderes::where('radicado', $radicado)->first();
        if ($poder) {
            throw new \Exception("Error el radicado ya se encuentra registrado previamente.", 1);
        }

        $this->validaHasApoderado($apoderado_nit, $apoderado_razsoc, $apoderado_cedrep, $apoderado_repleg);
        $this->validaHasPoderdante($poderdante_nit, $poderdante_razsoc, $poderdante_cedrep, $poderdante_repleg);

        $cartera = Carteras::where('nit', $this->poderdante->nit)->first();

        $ingresoDante = RegistroIngresos::where('nit', $this->poderdante->nit)
            ->where('cedula_representa', $this->poderdante->cedrep)
            ->first();

        if (!$ingresoDante) {
            $ingresoDante = $this->registroEmpresaService->registraIngresoDefault([
                'nit' => $this->poderdante->nit,
                'cedrep' => $this->poderdante->cedrep,
                'repleg' => $this->poderdante->repleg
            ]);
        }

        // Se borran todos los rechazos para el registro de poderdante
        Rechazos::where('regingre_id', $ingresoDante->documento)
            ->whereIn('criterio_id', [18, 25])
            ->delete();

        if ($cartera) {
            $ingresoDante->estado = 'R';
            $ingresoDante->votos = 0;
            $ingresoDante->save();
        } else {
            $otherRechazos = Rechazos::where('regingre_id', $ingresoDante->documento)
                ->whereNotIn('criterio_id', [18, 25])
                ->first();

            if (!$otherRechazos) {
                $ingresoDante->estado = 'P';
                $ingresoDante->votos = 1;
                $ingresoDante->save();
            }
        }

        $this->createPoderRechazado($radicado, $notificacion);

        $ingresoApo = RegistroIngresos::where('nit', $this->poderdante->nit)
            ->where('cedula_representa', $this->apoderado->cedrep)
            ->first();

        if (!$ingresoApo) {
            $ingresoApo = $this->registroEmpresaService->registraIngresoDefault([
                'nit' => $this->poderdante->nit,
                'cedrep' => $this->apoderado->cedrep,
                'repleg' => $this->apoderado->repleg
            ]);
        }

        $ingresoApo->estado = 'R';
        $ingresoApo->votos = 0;
        $ingresoApo->save();

        // Eliminar rechazo existente
        Rechazos::where('regingre_id', $ingresoApo->documento)
            ->where('criterio_id', 18)
            ->delete();

        // Crear nuevo rechazo
        $rechazo = Rechazos::where('regingre_id', $ingresoApo->documento)
            ->where('criterio_id', 25)
            ->first();

        if (!$rechazo) {
            $rechazo = new Rechazos();
            $rechazo->criterio_id = 25;
            $rechazo->regingre_id = $ingresoApo->documento;
            $rechazo->dia = now()->format('Y-m-d');
            $rechazo->hora = now()->format('H:i:s');
            $rechazo->save();
        }

        return $this->poderEntity;
    }

    /**
     * Validar y crear apoderado si no existe
     */
    private function validaHasApoderado($apoderado_nit, $razsoc1, $cedrep1, $repleg1)
    {
        $this->apoderado = Empresas::where('nit', $apoderado_nit)
            ->where('asamblea_id', $this->idAsamblea)
            ->first();

        if (!$this->apoderado) {
            $this->apoderado = Empresas::create([
                'nit' => $apoderado_nit,
                'razsoc' => $razsoc1,
                'cedrep' => $cedrep1,
                'repleg' => $repleg1,
                'asamblea_id' => $this->idAsamblea
            ]);

            $this->createRepresentante($repleg1, $cedrep1);

            $ingresoApo = $this->registroEmpresaService->registraIngresoDefault([
                'nit' => $apoderado_nit,
                'cedrep' => $cedrep1,
                'repleg' => $repleg1
            ]);

            if ($ingresoApo) {
                $ingresoApo = RegistroIngresos::where('nit', $this->apoderado->nit)
                    ->where('cedula_representa', $this->apoderado->cedrep)
                    ->first();
                $ingresoApo->estado = 'R';
                $ingresoApo->votos = 0;
                $ingresoApo->save();
            }

            // Reportar rechazo porque el representante no es válido
            $rechazo = Rechazos::where('regingre_id', $ingresoApo->documento)
                ->where('criterio_id', 26)
                ->first();

            if (!$rechazo) {
                $rechazo = new Rechazos();
                $rechazo->criterio_id = 26;
                $rechazo->regingre_id = $ingresoApo->documento;
                $rechazo->dia = now()->format('Y-m-d');
                $rechazo->hora = now()->format('H:i:s');
                $rechazo->save();
            }
        }

        if (!$this->apoderado) {
            throw new \Exception("Error no está el apoderado registrado en la base de empresas hábiles", 301);
        }
    }

    /**
     * Validar y crear poderdante si no existe
     */
    private function validaHasPoderdante($poderdante_nit, $razsoc2, $cedrep2, $repleg2)
    {
        $this->poderdante = Empresas::where('nit', $poderdante_nit)
            ->where('asamblea_id', $this->idAsamblea)
            ->first();

        if (!$this->poderdante) {
            $this->poderdante = Empresas::create([
                'nit' => $poderdante_nit,
                'razsoc' => $razsoc2,
                'cedrep' => $cedrep2,
                'repleg' => $repleg2,
                'asamblea_id' => $this->idAsamblea
            ]);

            $this->createRepresentante($repleg2, $cedrep2);

            $ingresoDante = $this->registroEmpresaService->registraIngresoDefault([
                'nit' => $poderdante_nit,
                'cedrep' => $cedrep2,
                'repleg' => $repleg2
            ]);

            if ($ingresoDante) {
                $ingresoDante = RegistroIngresos::where('nit', $this->poderdante->nit)
                    ->where('cedula_representa', $this->poderdante->cedrep)
                    ->first();
                $ingresoDante->estado = 'R';
                $ingresoDante->votos = 0;
                $ingresoDante->save();

                $rechazo = Rechazos::where('regingre_id', $ingresoDante->documento)
                    ->where('criterio_id', 26)
                    ->first();

                if (!$rechazo) {
                    $rechazo = new Rechazos();
                    $rechazo->criterio_id = 26;
                    $rechazo->regingre_id = $ingresoDante->documento;
                    $rechazo->dia = now()->format('Y-m-d');
                    $rechazo->hora = now()->format('H:i:s');
                    $rechazo->save();
                }
            }
        }

        if (!$this->poderdante) {
            throw new \Exception("Error no está el poderdante registrado en la base de empresas hábiles", 301);
        }
    }

    /**
     * Crear el poder rechazado
     */
    private function createPoderRechazado($radicado, $notificacion)
    {
        $documento = 'POW-' . date('Y') . '-' . str_pad(Poderes::count() + 1, 4, '0', STR_PAD_LEFT);
        
        $this->poderEntity = Poderes::create([
            'documento' => $documento,
            'fecha' => now(),
            'apoderado_nit' => $this->apoderado->nit,
            'poderdante_nit' => $this->poderdante->nit,
            'apoderado_repleg' => $this->apoderado->repleg,
            'poderdante_repleg' => $this->poderdante->repleg,
            'estado' => 'I',
            'radicado' => $radicado,
            'apoderado_cedrep' => $this->apoderado->cedrep,
            'poderdante_cedrep' => $this->poderdante->cedrep,
            'asamblea_id' => $this->idAsamblea,
            'notificacion' => $notificacion
        ]);
    }

    /**
     * Crear representante
     */
    private function createRepresentante($nombre, $cedrep)
    {
        $asaRepresentante = AsaRepresentantes::where('cedrep', $cedrep)->first();
        if ($asaRepresentante) return $asaRepresentante;

        $asaRepresentante = AsaRepresentantes::create([
            'nombre' => $nombre,
            'cedrep' => $cedrep,
            'clave_ingreso' => $this->claveAleatoria(),
            'asamblea_id' => $this->idAsamblea,
            'acepta_politicas' => 1,
            'create_at' => now(),
            'update_at' => now()
        ]);

        return $asaRepresentante;
    }

    /**
     * Generar clave aleatoria
     */
    private function claveAleatoria($long = 6)
    {
        $str = "123456789";
        $password = "";
        for ($i = 0; $i < $long; $i++) {
            $password .= substr($str, rand(0, 8), 1);
        }
        return $password;
    }

    /**
     * Obtener poder como array
     */
    public function getArrayPoder()
    {
        return Poderes::with(['apoderado', 'poderdante'])
            ->where('documento', $this->poderEntity->documento)
            ->first()
            ->toArray();
    }
}
