<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="csrf-token" content="{{ csrf_token() }}" path="{{ url('/') }}" app="{{ config('app.name') }}" />
    <title>Task Manager</title>
    <link rel="stylesheet" href="{{ asset('assets/noty/noty.css') }}" />
    <link rel="stylesheet" href="{{ asset('assets/swiper/swiper.css') }}" />
    <link rel="stylesheet" href="{{ asset('assets/select2/css/select2.min.css') }}" />
    <link rel="stylesheet" href="{{ asset('assets/font_awesome/all.css') }}" />
    <link rel="stylesheet" href="{{ asset('assets/sweetalert2/dist/sweetalert2.min.css') }}" />
    <link rel="stylesheet" href="{{ asset('assets/flatpickr/flatpickr.min.css') }}" />

    <link rel="stylesheet" href="{{ asset('theme/headroom.css') }}" />
    <link rel="stylesheet" href="{{ asset('theme/nucleo.css') }}" />
    <link rel="stylesheet" href="{{ asset('theme/nucleo.svg.css') }}" />
    @stack('styles')
    {{-- Ziggy: inyecta las rutas del backend en window.Ziggy --}}
    <script src="{{ asset('assets/jquery/jquery.min.js') }}"></script>
    <script src="{{ asset('assets/qs/qs.js') }}"></script>
    <script src="{{ asset('assets/sweetalert2/dist/sweetalert2.all.min.js') }}"></script>
    <script src="{{ asset('assets/underscore/underscore-umd-min.js') }}"></script>
    <script src="{{ asset('assets/backbone/backbone-min.js') }}"></script>
    <script src="{{ asset('assets/noty/noty.js') }}"></script>
    <script src="{{ asset('assets/validators/jquery.validate.min.js') }}"></script>
    <script src="{{ asset('assets/validators/messages_es.min.js') }}"></script>
    <script src="{{ asset('assets/moment/moment.js') }}"></script>
    <script src="{{ asset('assets/select2/select2.full.min.js') }}"></script>
    <script src="{{ asset('assets/bootstrap/js/bootstrap-datepicker.js') }}"></script>
    @stack('scripts')

    @routes
    {{-- Vite carga JS (el CSS se importa desde resources/js/app.js) --}}
    @vite(['resources/js/app.ts'])
    @inertiaHead
</head>
<body class="bg-gray-100">
    {{-- Inertia renderiza el root div#app con data-page automáticamente --}}
    @inertia
</body>
</html>
