<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="csrf-token" content="{{ csrf_token() }}" path="{{ url('/') }}" app="{{ config('app.name') }}" />
    <title>Asamblea</title>
    <link href="https://fonts.googleapis.com/css?family=Montserrat:400,700,200" rel="stylesheet" />

    <!-- Favicon y Logo -->
    <link rel="icon" href="{{ asset('assets/paper/img/favicon.png') }}" type="image/png" />
    <link rel="icon" href="{{ asset('assets/paper/img/circle-logo.ico') }}" type="image/x-icon" />

    <!-- CSS Assets -->
    <link rel="stylesheet" href="{{ asset('assets/font-awesome/css/font-awesome.css') }}" />
    <link rel="stylesheet" href="{{ asset('assets/paper/css/bootstrap-switch.css') }}" />
    <link rel="stylesheet" href="{{ asset('assets/paper/css/bootstrap.min.css') }}" />
    <link rel="stylesheet" href="{{ asset('assets/noty/noty.css') }}" />

    <link rel="stylesheet" href="{{ asset('assets/datatables/css/dataTables.bootstrap4.min.css') }}" />

    <!-- CSS existentes de Laravel -->
    <link rel="stylesheet" href="{{ asset('assets/swiper/swiper.css') }}" />
    <link rel="stylesheet" href="{{ asset('assets/select2/css/select2.min.css') }}" />
    <link rel="stylesheet" href="{{ asset('assets/sweetalert2/dist/sweetalert2.min.css') }}" />
    <link rel="stylesheet" href="{{ asset('assets/flatpickr/flatpickr.min.css') }}" />

    <link rel="stylesheet" href="{{ asset('theme/headroom.css') }}" />
    <link rel="stylesheet" href="{{ asset('theme/nucleo.css') }}" />
    <link rel="stylesheet" href="{{ asset('theme/nucleo.svg.css') }}" />
    <link rel="stylesheet" href="{{ asset('theme/paper-dashboard.css') }}" />
    <link rel="stylesheet" href="{{ asset('theme/asamblea.css') }}" />
    @stack('styles')
    {{-- Ziggy: inyecta las rutas del backend en window.Ziggy --}}

    <!-- JavaScript Assets -->
    <script src="{{ asset('assets/jquery/jquery.min.js') }}"></script>
    <script src="{{ asset('assets/qs/qs.js') }}"></script>
    <script src="{{ asset('assets/sweetalert2/dist/sweetalert2.all.min.js') }}"></script>
    <script src="{{ asset('assets/jquery/underscore-min.js') }}"></script>
    <script src="{{ asset('assets/jquery/backbone-min.js') }}"></script>

    <script src="{{ asset('assets/paper/js/popper.min.js') }}"></script>
    <script src="{{ asset('assets/paper/js/bootstrap.min.js') }}"></script>
    <script src="{{ asset('assets/paper/js/plugins/bootstrap-notify.js') }}"></script>
    <script src="{{ asset('assets/axios/axios.js') }}"></script>

    <!-- Scripts existentes de Laravel -->
    <script src="{{ asset('assets/noty/noty.js') }}"></script>
    <script src="{{ asset('assets/moment/moment.js') }}"></script>
    <script src="{{ asset('assets/select2/select2.full.min.js') }}"></script>

    <script src="{{ asset('assets/datepicker/bootstrap-datepicker.js') }}"></script>
    <script src="{{ asset('assets/validators/jquery.validate.min.js') }}"></script>
    <script src="{{ asset('assets/validators/messages_es.min.js') }}"></script>

    <script type="text/javascript">
        const capitalize = (_string) => {
            if (typeof _string !== 'string') return '';
            var exp = _string.toLowerCase().split(' ');
            if (exp.length == 1) {
                _string = exp[0].charAt(0).toUpperCase() + exp[0].slice(1);
            }
            if (exp.length > 1) {
                var parts = new Array();
                _.each(exp, function (parte) {
                    parts.push(parte.charAt(0).toUpperCase() + parte.slice(1));
                });
                _string = parts.join(' ');
            }
            return _string;
        };
    </script>
    @stack('scripts')

    @routes
    {{-- Vite carga JS (el CSS se importa desde resources/js/app.js) --}}
    @vite(['resources/js/app.ts'])
    @inertiaHead
</head>
<body class="bg-gray-100">

    <div id='render_mymodal'></div>

	<script type='text/template' id='tmp_modal'>
		<div class="modal-dialog <%=size%>">
			<div class="modal-content">
				<div class="modal-header" style='padding: 5px 8px;'>
					<div class="row">
						<div class="col-11"><h6 class="modal-title"><%=title%></h6></div>
						<div class="col-1">
							<a type='button' class="btn-close" data-bs-dismiss="modal"><i class='fa fa-times'></i></a>
						</div>
					</div>
				</div>
				<div class="modal-body"><%=content%></div>
				<% if(footer !== -1){ %>
					<div class="modal-footer">
						<button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
						<button type="button" class="btn btn-primary">Continuar</button>
					</div>
				<% } %>
			</div>
		</div>
	</script>

	<script type='text/template' id='tmp_busqueda_invalid'>
		<div class='row'>
			<div class="pull-right" style='z-index:3000; position:absolute; right:10px;'>
				<a href='#' class="btn btn-sm btn-outline-primary btn-round" id='bt_back'><i class="fa fa-heart"></i> Salir</a>
			</div>
			<div class="col-md-6 ml-auto mr-auto">
				<div class="card-testimonial">
					<div class="card-body">
						<h4 class="card-title">Notificación Asamblea</h4>
						<p><%=msj%></p><br/>
						<div class="card-avatar">
							<a href="javascript:;"><img src="img/registro_asamblea.jpg" /></a>
						</div>
					</div>
					<div class="card-footer ">
						<h6 class="card-category">@Comfaca</h6>
					</div>
				</div>
			</div>
		</div>
	</script>

	<div class="modal fade" id="notice_modal" tabindex="-1" role="dialog" aria-labelledby="notice" aria-hidden="true">
		<div class="modal-dialog modal-notice">
			<div class="modal-content">
				<div class="modal-header">
					<button type="button" class="close" data-dismiss="modal" aria-hidden="true">
						<i class="nc-icon nc-simple-remove"></i>
					</button>
					<h5 class="modal-title" id='mdl_set_title'></h5>
				</div>
				<div class="modal-body" id='mdl_set_body'></div>
				<div class="modal-footer justify-content-center" id='mdl_set_footer'>
					<button type="button" class="btn btn-info btn-round" data-dismiss="modal" id='mdl_set_button'>Continuar!</button>
				</div>
			</div>
		</div>
	</div>

	<div class="modal fade" id="dialog_modal" tabindex="-1" role="dialog" aria-labelledby="notice" aria-hidden="true">
		<div class="modal-dialog modal-dialog">
			<div class="modal-content" id='mdl_set_body'>
			</div>
		</div>
	</div>

    {{-- Inertia renderiza el root div#app con data-page automáticamente --}}
    @inertia
</body>
</html>
