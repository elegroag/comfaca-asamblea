<?php

if (!function_exists('oficios_requeridos')) {

    function oficios_requeridos($tipafi)
    {
        switch ($tipafi) {
            case 'I':
                return __op_independiente();
                break;
            case 'E':
                return __op_empresa();
                break;
            case 'T':
                return __op_trabajador();
                break;
            case 'C':
                return __op_conyuge();
                break;
            case 'B':
                return __op_beneficiario();
                break;
            case 'O':
                return __op_pensionado();
                break;
            case 'F':
                return __op_facultativo();
                break;
            case 'U':
                return __op_actualizadatos();
                break;
            default:
                return false;
                break;
        }
    }

    function __op_actualizadatos()
    {
        return array(
            array(
                'label' => 'Formulario',
                'file' => 'formulario',
                'url' => 'actualizadatos/formulario',
                'auto_generar' => true,
                'firmas' => array(
                    'E' => 'Empleador'
                )
            )
        );
    }

    function __op_independiente()
    {
        return array(
            array(
                'label' => 'Formulario',
                'file' => 'formulario',
                'url' => 'independiente/formulario',
                'auto_generar' => true,
                'firmas' => array(
                    'T' => 'Trabajador'
                )
            ),
            array(
                'label' => 'Oficio solicitud afiliación',
                'file' => 'carta_solicitud_afiliacion_empresario.pdf',
                'url' => 'independiente/cartaSolicitud',
                'auto_generar' => false,
                'firmas' => array(
                    'T' => 'Trabajador'
                )
            ),
            array(
                'label' => 'Tratamiento datos personales',
                'file' => 'formato_pm_psf_ft_11.pdf',
                'url' => 'independiente/tratamientoDatos',
                'auto_generar' => false,
                'firmas' => array(
                    'T' => 'Trabajador'
                )
            )
        );
    }

    function __op_empresa()
    {
        return array(
            array(
                'label' => 'Formulario',
                'file' => 'formulario',
                'url' => 'empresa/formulario',
                'auto_generar' => true,
                'firmas' => array(
                    'E' => 'Empleador',
                )
            ),
            array(
                'label' => 'Oficio solicitud afiliación',
                'file' => 'carta_solicitud_afiliacion_empresario',
                'url' => 'empresa/cartaSolicitud',
                'auto_generar' => true,
                'firmas' => array(
                    'E' => 'Empleador',
                )
            ),
            array(
                'label' => 'Tratamiento datos personales',
                'file' => 'oficio_tratamiento_datos_personales.pdf',
                'url' => 'empresa/tratamientoDatos',
                'auto_generar' => true,
                'firmas' => array(
                    'E' => 'Empleador'
                )
            ),
            array(
                'label' => 'Relación trabajadores en nomina',
                'file' => 'oficio_tratamiento_datos_personales.pdf',
                'url' => 'empresa/tratamientoDatos',
                'auto_generar' => true,
                'firmas' => array(
                    'E' => 'Empleador'
                )
            )
        );
    }

    function __op_trabajador()
    {
        return array(
            array(
                'label' => 'Formulario',
                'file' => 'independiente',
                'url' => 'trabajador/formulario',
                'auto_generar' => true,
                'firmas' => array(
                    'T' => 'Trabajador',
                    'E' => 'Empleador',
                )
            ),
            array(
                'label' => 'Oficio solicitud afiliación',
                'file' => 'carta_solicitud_afiliacion_trabajador.pdf',
                'url' => 'trabajador',
                'auto_generar' => false,
                'firmas' => array(
                    'E' => 'Empleador'
                )
            ),
            array(
                'label' => 'Tratamiento datos personales',
                'file' => 'formato_pm_psf_ft_10.pdf',
                'url' => 'trabajador',
                'auto_generar' => false,
                'firmas' => array(
                    'E' => 'Empleador',
                    'T' => 'Trabajador',
                )
            )
        );
    }

    function __op_conyuge()
    {
        return array(
            array(
                'label' => 'Formulario',
                'file' => 'formulario',
                'url' => 'conyuge/formulario',
                'auto_generar' => true,
                'firmas' => array(
                    'T' => 'Trabajador',
                    'E' => 'Empleador',
                )
            ),
            array(
                'label' => 'Tratamiento datos personales',
                'file' => 'formato_pm_psf_ft_11.pdf',
                'url' => 'conyuge',
                'auto_generar' => false,
                'firmas' => array(
                    'T' => 'Trabajador',
                    'E' => 'Empleador',
                )
            )
        );
    }

    function __op_beneficiario()
    {
        return array(
            array(
                'label' => 'Formulario',
                'file' => 'formulario',
                'url' => 'beneficiario/formulario',
                'auto_generar' => true,
                'firmas' => array(
                    'T' => 'Trabajador',
                    'E' => 'Empleador'
                )
            ),
            array(
                'label' => 'Oficio solicitud afiliación',
                'file' => 'carta_solicitud_afiliacion_empresario.pdf',
                'url' => 'beneficiario',
                'auto_generar' => false,
                'firmas' => array(
                    'T' => 'Trabajador',
                    'E' => 'Empleador',
                )
            ),
            array(
                'label' => 'Tratamiento datos personales',
                'file' => 'formato_pm_psf_ft_10.pdf',
                'url' => 'beneficiario',
                'auto_generar' => false,
                'firmas' => array(
                    'T' => 'Trabajador',
                    'E' => 'Empleador',
                )
            )
        );
    }

    function __op_pensionado()
    {
        return array(
            array(
                'label' => 'Formulario',
                'file' => 'formulario',
                'url' => 'pensionado/formulario',
                'auto_generar' => true,
                'firmas' => array(
                    'T' => 'Trabajador'
                )
            ),
            array(
                'label' => 'Oficio solicitud afiliación',
                'file' => 'carta_solicitud_afiliacion_empresario.pdf',
                'url' => 'pensionado',
                'auto_generar' => false,
                'firmas' => array(
                    'T' => 'Trabajador'
                )
            ),
            array(
                'label' => 'Tratamiento datos personales',
                'file' => 'formato_pm_psf_ft_11.pdf',
                'url' => 'pensionado',
                'auto_generar' => false,
                'firmas' => array(
                    'T' => 'Trabajador'
                )
            )
        );
    }

    function __op_facultativo()
    {
        return array(
            array(
                'label' => 'Formulario',
                'file' => 'formulario',
                'url' => 'facultativo',
                'auto_generar' => true,
                'firmas' => array(
                    'T' => 'Trabajador'
                )
            ),
            array(
                'label' => 'Oficio solicitud afiliación',
                'file' => 'carta_solicitud_afiliacion_empresario.pdf',
                'url' => 'facultativo',
                'auto_generar' => false,
                'firmas' => array(
                    'T' => 'Trabajador'
                )
            ),
            array(
                'label' => 'Tratamiento datos personales',
                'file' => 'formato_pm_psf_ft_11.pdf',
                'url' => 'facultativo',
                'auto_generar' => false,
                'firmas' => array(
                    'T' => 'Trabajador'
                )
            )
        );
    }
}


if (!function_exists('firmas_requeridas')) {

    function firmas_requeridas($tipafi)
    {
        switch ($tipafi) {
            case 'E':
            case 'U':
                return array(
                    array(
                        'code' => 'E',
                        'label' => 'Empleador',
                        'estado' => 'P',
                    )
                );
                break;
            case 'T':
            case 'C':
            case 'B':
                return array(
                    array(
                        'code' => 'E',
                        'label' => 'Empleador',
                        'estado' => 'P',
                    ),
                    array(
                        'code' => 'T',
                        'label' => 'Trabajador',
                        'estado' => 'P',
                    )
                );
                break;
            case 'O':
            case 'I':
            case 'F':
                return array(
                    array(
                        'code' => 'T',
                        'label' => 'Trabajador',
                        'estado' => 'P',
                    )
                );
                break;
            default:
                return false;
                break;
        }
    }
}
