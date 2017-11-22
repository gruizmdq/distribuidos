/*
Repita​ ​el​ ​ejercicio​ ​anterior,​ ​pero​ ​utilizando​ ​el​ ​paquete​ ​HTTP.​ ​Para​ ​el​ ​servidor​ ​puede​ ​utilizar
la​ ​función​ ​http.createServer()​​ ​y​ ​para​ ​el​ ​cliente​ ​la​ ​función​ ​http.get()​.
2.3)​ ​Creando​ ​un​ ​servidor​ ​para​ ​el​ ​sistema​ ​de​ ​monitoreo
Crear​ ​un​ ​servidor​ ​que​ ​imprima​ ​por consola​ ​los​ ​parámetros​ ​recibidos​ ​del​ ​formulario​ ​del​ ​inciso​ ​1.2.

Además​ ​del​ ​servidor,​ ​se​ ​deberá​ ​programar​ ​el​ ​envío​ ​de​ ​datos​ ​del​ ​formulario​ ​desde​ ​el​ ​cliente
(HTML​ ​en​ ​el​ ​navegador).​ ​Lamentablemente,​ ​en​ ​el​ ​navegador​ ​no​ ​funciona​ ​la​ ​librería​ http​​ ​de
Node.js,​ ​por​ ​lo​ ​que​ ​se​ ​deberá​ ​utilizar​ ​el​ ​objeto​ ​XMLHttpRequest​ ​de​ ​JavaScript​ ​para​ ​que
tome​ ​los​ ​valores​ ​ingresados​ ​en​ ​el​ ​formulario​ ​del​ ​inciso​ ​1.2​ ​y​ ​los​ ​envíe​ ​al​ ​servidor​ ​creado.
Aquí​ ​tiene​ ​una​ ​referencia​ ​de​ ​cómo​ ​utIlizarlo:
https://developer.mozilla.org/es/docs/Web/API/XMLHttpRequest/Using_XMLHttpRequest
*/
var http = require('http');
var fs = require('fs');

fs.readFile('./index.html', function (err, html) {
    if (err) {
        throw err;
    }
    http.createServer(function(request, response) {
        response.writeHeader(200, {"Content-Type": "text/html"});
        response.write(html);
        response.end();
    }).listen(8000);
});
