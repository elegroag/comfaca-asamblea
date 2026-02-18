<!DOCTYPE html>
<html lang="es">

<head>
    <meta charset="UTF-8">
    <meta
    name="csrf-token"
    content="{{ csrf_token() }}"
    path="{{ url('/') }}"
    app="{{ config('app.name') }}" />

    <title>@yield('title')</title>
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

    {{-- Ziggy: inyecta las rutas del backend en window.Ziggy --}}
    @routes
    {{-- Vite carga solo el JS (CSS incluido dentro del entry) --}}
    @vite(['resources/js/app.ts'])
    @inertiaHead
</head>

<body class="bg-gray-100">
    @inertia()
</body>

</html>
