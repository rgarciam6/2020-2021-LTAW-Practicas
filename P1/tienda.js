//Rebeca García Mencía
//P1 - TIENDA

//Importando módulos
const url = require('url');
const http = require('http');
const fs = require('fs');

//Definición del puerto
const PUERTO = 9000;

//Creación del servidor
const server = http.createServer((req, res) => {

    console.log("Petición recibida")

    //Construir el objeto url con la url de la solicitud
    const url = new URL(req.url, 'http://' + req.headers['host']);
    console.log(url.pathname);

    //Se inicializa la variable recurso
    var resource = "";
    //Analizar el recurso solicitado
    if (url.pathname == '/') {
      resource += "/tienda.html"; //Si pide la página principal
    } else {
      resource += url.pathname; //Si pide otro recurso
    }

    //Obtención del tipo de recurso solicitado
    resource_type = resource.split(".")[1];
    resource = "." + resource;

    console.log("Recurso: " + resource);
    console.log("Extensión: " + resource_type);

    //Lectura asíncrona
    fs.readFile(resource, function(err, data){

      //Definición del tipo de archivo html.
      var mime = "text/html"

      //Definición del tipo de imágenes
      if(resource_type == 'jpg' || resource_type == 'png' || resource_type == 'PNG'){
          mime = "image/" + resource_type;
      }

      //Definición del tipo de archivo css
      if (resource_type == "css"){
          mime = "text/css";
      }

      //Fichero no encontrado
      if (err){
          //Lanza error
          res.writeHead(404,{'Content-Type': mime})
          res.write(data);
          res.end();
      }else{
          res.writeHead(200, {'Content-Type': mime});
          console.log("Peticion Recibida, 200 OK");
          res.write(data);
          res.end();
      }
    });
});

server.listen(PUERTO);
console.log("Servidor de la tienda online escuchando en puerto: " + PUERTO)