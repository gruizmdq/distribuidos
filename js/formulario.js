/** CLIENTE
  Es capaz de enviar solicitudes post, get, put y delete al servidor
  para chequear el estado del host solicitado.
**/


// Formato para chequear validez de la direccion IP dada
var ipformat = /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
var i = 0;


//Funcion asociada al boton submit del html.
function enviar() {

  var ip = document.getElementById('ip1').value+"."+document.getElementById('ip2').value+"."+document.getElementById('ip3').value+"."+document.getElementById('ip4').value;
  var port = document.getElementById('puerto').value;
  var modo;

  //Si la ip es válida hacer:
  if(ip.match(ipformat)){

    nuevaconsulta('POST', null, ip, parseInt(port,10), modo, function (respuesta) {
      //SI HAY IP REPETIDA, NO LA PONE!.

      if (respuesta == 'error'){
        $('.error').show(400);
          setTimeout(function(){
            $('.error').hide(400);
          }, 5000);
      }
      else{
        var data;
        var estado = respuesta.split(" ")[0];
        var id = respuesta.split(" ")[1];
        addNode(id, estado, ip, port, modo);
      }
    });

  }
}

//***POST*** Nueva consulta al servidor
function nuevaconsulta(method, index, ip, puerto, modo, callback){
  $('.lwrapper').addClass('active');
  var request = new XMLHttpRequest();
  request.open(method, "http://"+window.location.host, true);

  request.onload = function () {
    $('.lwrapper').removeClass('active');
    callback(this.responseText);
  };

  request.send(JSON.stringify({'index': index, 'ip': ip, 'puerto': puerto}));
}

/* (DELETE)

  En javascript el evento click no funciona con el elementos que fueron agregados
  dinamicamente (no vienen por defecto en el html entregado por el servidor). Por eso
  es necesario declarar la funcion para DELETE de la siguiente manera */

$(document).on('click', '.remove', function() {

  //Efecto al eliminar
  var tr = $(this).closest("tr");
  tr.addClass('fadeOut');
  tr.children('td, th')
            .animate({padding: 0})
            .wrapInner('<div />')
            .children()
            .slideUp(function () {
              tr.remove();
            })

    //obtengo el id del nodo a eliminar.
    var id = tr.attr('id');

    //le envío al servidor el id del nodo que quiero eliminar.
    $('.lwrapper').addClass('active');
    var request = new XMLHttpRequest();
    request.open('DELETE', "http://"+window.location.host, true);
    $('.lwrapper').removeClass('active');
    request.send(JSON.stringify({'id': id}));
});



// *** PUT *** NUEVA SOLICITUD CUANDO APRETO RECARGAR!
$(document).on('click', '.refresh', function() {

  row = $(this).closest("tr");
  index = row.attr("id");
  state = row.children('.state');
  ip = row.children('.ip');
  ip = ip.children().val();
  puerto = row.children('.puerto');
  var modo;

  row.removeClass('fadeInLeft');
  console.log(ip);

  nuevaconsulta('PUT', parseInt(index), ip, parseInt(puerto.text(),10), modo, function(resp){
    if (resp.split(" ")[0] == 'true') {
      row.removeClass('offline');
      row.addClass('online');
    }
    else{
      row.removeClass('online');
      row.addClass('offline');
    }
    row.addClass('fadeInLeft')
  });
});

// *** PUT 2 *** CAMBIO DE MODO CUANDO APRETO EN EL CHECKBOX
$(document).on('click', '.checkbox', function() {

  id = $(this).closest("tr").attr("id");
  val = $(this).is(":checked");

  $('.lwrapper').addClass('active');

  var request = new XMLHttpRequest();
  request.open('PUT', "http://"+window.location.host, true);

  request.onload = function () {
    $('.lwrapper').removeClass('active');
  };

  request.send('modo '+id+ " "+val);

});

/* GET TODOS LOS NODOS!. Tienen que añadirse a la lista los nodos que no estén */
function getNodos(){
  var request = new XMLHttpRequest();
  request.open('GET', "http://"+window.location.host+"/nodos", true);

  request.onload = function () {
      respuesta = JSON.parse(this.responseText);
      newList(respuesta);
  };

  request.send();
}

function newList(respuesta){

  //selecciono la primera fila
  var listRow = $("#lista tbody tr").first();
  var i = 0;

  while (i < respuesta.length) {

      //IGUALDAD
      if(listRow.attr('id') == respuesta[i][0]){

            //MODIFICA STATUS
            var celda = listRow.children().first();
            if (respuesta[i][1] == 'true'){
              celda.addClass('online');
              celda.removeClass('offline');
            }
            else {
              celda.addClass('offline');
              celda.removeClass('online');
            }

            //MODIFICA IP
            celda = celda.next();
            celda.children().val(respuesta[i][2]);

            //MODIFICA PUERTO
            celda = celda.next();
            celda.text(respuesta[i][3]);

            //MODIFICA MODO
            var id = '#checkbox'+respuesta[i][0];
            celda = $(id);
            modo = respuesta[i][4];
            
            // EL ATRIBUTO NO ACEPTA 'FALSE' COMO STRING.
            if (modo == 'false')
              modo = false;
            else
              modo = true;
            celda.prop('checked', modo)



      }

      else if (listRow.attr('id') < respuesta[i][0])

        //BORRAR TODOS LOS NODOS DE LA LISTA MENORES!
        while(parseInt(listRow.attr('id')) < respuesta[i][0] && listRow.length > 0){
          aux = listRow.next();
          listRow.remove();
          listRow = aux;
        }

      //AGREGAR NODO A LISTA CLIENTE
      else{
        //agregar nodo
        addNode(respuesta[i][0], respuesta[i][1], respuesta[i][2], respuesta[i][3], respuesta[i][4]);
      }
    i++;
    listRow = listRow.next();
  }
}


function addNode(index, estado, ip, port, modo){

  //va a cambiar la clase de la primera celda segun respuesta
  //0: offline, 1: online
  if (estado === 'true')
    var data = '<tr id="'+ index + '" class="animated fadeInLeft online"><td class="state" scope="row">‎●</td>';
  else
    var data = '<tr id="'+ index + '" class="animated fadeInLeft offline"><td class="state" scope="row">‎●</td>';

  data += '<td class="ip"><input placeholder="'+ip+'" value ="'+ip+'" /></td>';
  data += '<td class="puerto">'+port+'</td>';
  data += '<td><span class="refresh hoverable" data-toggle="tooltip" data-placement="bottom" title="Refresh">Recargar</span></td>';
  data += '<td><span class="remove hoverable" data-toggle="tooltip" data-placement="bottom" title="Eliminar">Eliminar</span></td>';
  data += '<td><div class="form-group"><input type="checkbox" class="checkbox" id="checkbox'+index+'"><label for="checkbox'+index+'">Monitorear</label></div></td></tr>';

  $('#lista').append(data);

  if (modo == 'true'){
    //MODIFICA MODO
    var id = '#checkbox'+index;
    celda = $(id);
    celda.attr('checked', modo)
  }

}


/* FUNCIONES QUE SE LLAMAN CUANDO LA PAGINA SE CARGA COMPLETAMENTE */
$(document).ready(function() {
  // Cambia de input cuando completa 3 numeros y agrega separador
  $(".ip-input").keyup(function () {
    if (this.value.length == this.maxLength) {
      if($(this).next().is('.ip-input')){
        $(this).next('.ip-input').focus();
        $(this).after(".");
      }
    }
  });

  //SOLICITA NODOS CADA 21 SEGUNDOS PORQUE EL SEGUNDOS
  // HACE PINGS DE LA LISTA DE NODOS CADA 20 SEGUNDOS
  getNodos();
  setInterval(getNodos, 21000);
})
