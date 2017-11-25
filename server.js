var http = require('http');
var fs = require('fs'); // sistema de archivo
var path = require('path'); // path
var ping = require ("net-ping");

var i = 0;
var nodos = [];

function pingIp(ip, callback){
  var session = ping.createSession ();

  session.pingHost (ip, function (error, target) {
    if (error){
        if (error instanceof ping.RequestTimedOutError)
            console.log (target + ": Offline");
        else
            console.log (target + ": " + error.toString ());
        callback('false');
    }
    else{
        console.log (target + ": Online");
        callback('true');
    }
  });
}

function onRequest(request, response){

  if (request.method == 'POST')
    post(request, response);

  else if (request.method == 'DELETE')
    f_delete(request, response);

  else if(request.method == 'GET')
      get(request, response);
  else
    put(request, response);

}

function post(request, response) {

        var body = '';

        request.on('data', function (data) {
            body += data;

            // Too much POST data, kill the connection!
            // 1e6 === 1 * Math.pow(10, 6) === 1 * 1000000 ~~~ 1MB
            if (body.length > 1e6)
                request.connection.destroy();
        });

        request.on('end', function () {
            var post = JSON.parse(body);

            var j = 0;
            //BUSCA SI EXISTE UN NODO CON ESA IP
            while (nodos != 'undefined' && j < nodos.length && nodos[j][2] != post.ip) {
              j++;
            }
            //NO EXISTE ESA IP
            if (j >= nodos.length)
              pingIp(post.ip, function(respuesta){
                response.writeHead(200);
                nodos.push([i, respuesta, post.ip, post.puerto, 'false', new Date()]);
                console.log(nodos);
                response.end(respuesta + " " + i++);
              });

            //ERROR PORQUE YA EXISTIA LA IP EN UN NODO
            else {
              response.writeHead(200);
              response.end('error');
            }
        });

}

function f_delete(request, response){
  var body = '';

  request.on('data', function (data) {
      body += data;

      // 1e6 === 1 * Math.pow(10, 6) === 1 * 1000000 ~~~ 1MB
      if (body.length > 1e6)
          request.connection.destroy();
  });

  request.on('end', function () {
      var data = JSON.parse(body);
      var id = data.id;
      var index = 0;
      while(index < nodos.length && nodos[index][0] != id)
        index++;
      if (index < nodos.length)
        nodos.splice(index, 1);
  });
}

function get(request, response){
  if (request.url.includes('nodos')){
     response.writeHead(200);
     response.end(JSON.stringify(nodos));
   }

   else {
     var ruta = '.' + ((request.url=='/') ? '/index.html' : request.url);
     var extension =path.extname(ruta); // obtiene la extension del archivo
     var contentType = 'text/html';
     switch (extension){
         case '.js':
              contentType = 'text/javascript';
              break;
         case '.css':
              contentType = 'text/css';
     }
     fs.exists(ruta,function(bExist){
         if(bExist)
         {
           fs.readFile(ruta, function(bError,content){
               if(bError)  {
                   response.writeHead(500);
                   response.end();
               }
               else  {
                   response.writeHead(200,{'content-Type' : contentType});
                   response.end(content);
               }
           });
         }
         else{
             response.writeHead(404); response.end();
         }
       });
     }
   }

   /***** PUT *****/

  function put(request, response) {
    var body = '';

    request.on('data', function (data) {
        body += data;

        if (body.length > 1e6)
            request.connection.destroy();
    });

    request.on('end', function () {
        /* Existe dos put. En uno el cliente modifica ip de un nodo (click en recargar)
          El otro cuando apreta en el checkbox para Monitorear
          En caso que se busque monitorear, manda la palabra MODO */

        if (body.split(" ")[0] == 'modo'){
          var id = body.split(" ")[1];
          var modo = body.split(" ")[2];

          var j = 0;
          while (j < nodos.length && nodos[j][0] != id)
            j++;
          //encontro
          if (j < nodos.length){
            //cambio modo.
            nodos[j][4] = modo;
            //actualizo fecha.
            nodos[j][5] = new Date();
            console.log(nodos);
            response.writeHead(200);
            response.end();
          }
        }
        else{
          var data = JSON.parse(body);
          var ip = data.ip;
          var puerto = data.puerto;
          var modo = data.modo;
          var index = data.index;

          pingIp(ip, function(respuesta){
            response.writeHead(200);
            var j = 0;
            while (j < nodos.length && nodos[j][0] != index)
              j++;
            //encontro
            if (j < nodos.length){
              nodos[j] = [index,respuesta, ip, puerto, modo, new Date()];
            }
            response.end(respuesta);
          });
        }
    });
  }
  http.createServer(onRequest).listen(88);


  //CHEQUEA LOS NODOS QUE ESTAN CON MODO = TRUE
  function checkNode(){
    for (var i = 0; i < nodos.length; i++)
      (function(i) {

          if(nodos[i][4] == 'true'){
            ip = nodos[i][2];
            pingIp(ip, function(respuesta){
              //actualizo status
              nodos[i][1] = respuesta;
              //actualiza fecha
              nodos[i][5] = new Date();
              console.log(nodos);
            })
          }
      })(i);
  }
//CADA 20 segundos chequea los nodos. Menos tiempo seria sobrecargar demasiado al servidor
setInterval(checkNode, 20000);
