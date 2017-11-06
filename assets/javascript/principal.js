var jWindow = $(window);

if ( typeof com === 'undefined') {
	com = {};
}

com.codeismo = {

	ajax : {
		/*
		 @idSeccion : el id de la seccion, se usa para los links del menu
		 @cajaSelector : la caja en la que se van a cargar los datos ajax, si no se da ningun valor
		 se usa #contenido
		 @urlAjax : la url que se usara para pedir los datos ajax
		 @urlOriginal : la url que aparecera en la parte de arriba del navegador, deberia ser href
		 @cajaScroll : caja a la que se hara scroll
		 */
		cargaAjaxLink : function(params) {

			params.cajaSelector = params.cajaSelector || "contenido";

			var contenedor = $("#" + params.cajaSelector);
			var cajaLoading = $("#caja-loading");

			/*cambiamos la sombra de los menus*/

			$(".menu-seleccionado").removeClass("menu-seleccionado");
			$("#" + params.idSeccion + "-link").parent().addClass("menu-seleccionado");

			var altura = contenedor.height();

			cajaLoading.removeClass("invisible");
			contenedor.fadeOut("slow", function() {

				contenedor.load(params.urlAjax, function() {

					//en lo que se lee traemos a la caja de regreso
					contenedor.fadeIn("slow", function() {
						cajaLoading.addClass("invisible");
						//OBTENEMOS LA POSICION DEL SCROLL
						var posicionScroll = (params.cajaScroll) ? $(params.cajaScroll).offset().top : 0;

						//una vez visible el contenido animamos
						$('html, body').animate({
							scrollTop : posicionScroll
						}, 'slow');

					});

				});

			});
		},
		//forma debe ser un objeto de jquery
		enviarDatosForma : function(forma) {
			//evitamos que de click en el boton por segunda vez
			//mientras se carga la venta
			var urlAction = forma.attr("action");
			var datos = forma.serialize();

			var ventana = com.codeismo.formas.crearVentanaForma(forma);

			//console.log("DATOS:" + datos);
			$.post(urlAction, datos).done(function(respuesta) {
				ventana.html(respuesta);
			});

			return false;
		}
	},
	facebook : {
		pintaComentarios : function() {

			function pintaComentarios() {
				//debugger;
				$(".fb-comments").attr("data-width", $(".comentarios").width());
				FB.XFBML.parse($(".comentarios")[0]);
			};

			var idIntervalFacebookComments = setInterval(function() {
				//debugger;
				if ( typeof FB !== "undefined" && idIntervalFacebookComments !== null) {
					clearInterval(idIntervalFacebookComments);
					idIntervalFacebookComments = null;
					pintaComentarios();
				}
			}, 500);
		}
	},
	inicio : {
		actualizaCajaBienvenida : function(ancho, alto) {
			var altoHeader = alto - $("header").height();

			if (screen && screen.height > alto && alto > 400) {
				var seccionImagen = $(".imagen-seccion");
				var altoImagen = altoHeader * 3 / 4;

				seccionImagen.height(altoImagen);
				seccionImagen.css("line-height", altoImagen + "px");
			}
		},
		ajustaCajas : function() {
			var ancho = jWindow.width();
			var alto = jWindow.height();
			com.codeismo.inicio.actualizaCajaBienvenida(ancho, alto);

			var menuResponsive = $("#menu");
			menuResponsive.data("abierto", false);
			menuResponsive.addClass("ocultar-en-moviles");
		}
	},
	formas : {
		limpiarForma : function(forma) {
			var selectorCSS = "#" + forma.attr("id");
			$(':input', selectorCSS).not(':button, :submit, :reset, :hidden').val('').removeAttr('checked').removeAttr('selected');
		},

		crearVentanaForma : function(forma) {

			var contenidoVentana = "<div class='ventana-enviar'><div>Enviando datos...</div><div><img src='/estatico/img/loading.gif'></div></div>";
			var ventana = $(contenidoVentana).appendTo("#contenido");

			ventana.dialog({
				modal : true,
				close : function() {
					//console.log("destruyendo");

					//limpiamos la forma
					com.codeismo.formas.limpiarForma(forma);
					ventana.dialog('destroy').remove();
				}
			});

			return ventana;
		}
	}
};

(function() {

	$(window).resize(function() {
		com.codeismo.facebook.pintaComentarios();
	});

	jWindow.resize(com.codeismo.inicio.ajustaCajas);
	com.codeismo.inicio.ajustaCajas();

	//$("#" + ID_SECCION + "-link").parent().addClass("menu-seleccionado");
	//$("#contenido").load(LAYOUT_CONTENIDO);

	$("#contenido-DESHABILITADO").on("click", "a.post-facebook", function() {

		var fbSharer = $(this);
		var link = fbSharer.attr("data-url");
		var titulo = fbSharer.attr("data-titulo");
		var descripcion = fbSharer.attr("data-descripcion");
		var imagen = fbSharer.attr("data-imagen");

		FB.ui({
			app_id : "622670574470942",
			method : 'feed',
			link : link,
			caption : titulo,
			description : descripcion,
			picture : imagen
		}, function(response) {

		});

		return false;
	});

	$(document).on("submit", "form", function() {
		com.codeismo.ajax.enviarDatosForma($(this));
		return false;
	});

	$(document).on("click", ".info-curso", function() {
		var linkCurso = $(this);
		//vemos si esos datos ya los hemos pedido al servidor
		var leido = linkCurso.data("leido");
		//obtenemos las cajas necesarias para ocultar y mostrar datos
		var cajaPrincipal = linkCurso.parents(".curso-caja-der");
		var linkOcultar = cajaPrincipal.find(".ocultar-info-curso");
		var temarioCaja = cajaPrincipal.find(".curso-mas-info");

		//si ya hemos traido esa informacion del servidor
		if (leido && leido === true) {

			linkCurso.addClass("oculto");
			linkOcultar.removeClass("oculto");
			temarioCaja.fadeIn("slow");
		} else {

			$.get(linkCurso.attr("href"), function(respuesta) {
				//marcamos que ya leimos los datos, para no volverlos a pedir
				linkCurso.data("leido", true);
				linkCurso.addClass("oculto");
				linkOcultar.removeClass("oculto");
				temarioCaja.html(respuesta).fadeIn("slow");
			});
		}

		return false;
	});

	$(document).on("click", ".ocultar-info-curso", function() {
		var linkOcultar = $(this);
		var cajaPrincipal = linkOcultar.parents(".curso-caja-der");

		linkOcultar.addClass("oculto");
		cajaPrincipal.find(".info-curso").removeClass("oculto");
		cajaPrincipal.find(".curso-mas-info").fadeOut("slow");

		return false;
	});

	$('body').bind('click', function(e) {

		//si esta habilitado el icono del menu responsive para moviles y si dieron click en un area
		//diferente del menu
		var menu = $("#menu");
		if (menu.data("abierto") && $(e.target).closest('#menu-responsive').length == 0) {
			//console.log("dieron click fuera de menu responsive");

			//forzamos un click para que se cierre el menu responsive			
			menu.addClass("ocultar-en-moviles");
			menu.data("abierto", false);
		}
	});

	$(document).on("click", "#menu-responsive", function() {

		var menu = $("#menu");
		if (menu.data("abierto")) {

			menu.addClass("ocultar-en-moviles");
			menu.data("abierto", false);
		} else {

			menu.data("abierto", true);
			menu.removeClass("ocultar-en-moviles");
		}
	});

	$(document).on("click", "a[data-ajax]", function() {
		var link = $(this);
		var url = link.attr("data-ajax");
		var urlOriginal = link.attr("href");
		//fix temporal
		var urlMostrar = link.attr("data-ajax-urls");

		var idSeccion = link.attr("data-ajax-seccion");

		//el selector de id de la caja a a pintar
		var cajaSelector = link.attr("data-ajax-caja");
		var cajaScroll = link.attr("data-ajax-scroll");

		return false;
	});

})();
