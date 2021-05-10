//Rebeca García Mencía
//P2 - TIENDA

//Importando módulos
const url = require('url');
const http = require('http');
const fs = require('fs');

//Definición del puerto
const PUERTO = 9000;

//Definición de los tipos mime 
const mime = {
    "html" : "text/html",
    "css"  : "text/css",
    "js"   : "application/javascript",
    "jpg"  : "image/jpg",
    "png"  : "image/png",
    "PNG"  : "image/png",
    "gif"  : "image/gif",
    "json" : "application/json"
  };


//Página de los productos
const THRILLER = fs.readFileSync('thriller.html', 'utf-8');  
const ROMANTICA = fs.readFileSync('romantica.html', 'utf-8');
const HISTORICA = fs.readFileSync('historica.html', 'utf-8');

//Página de error
const ERROR = fs.readFileSync('error.html', 'utf-8');

//Página formulario login
const LOGIN = fs.readFileSync('login.html', 'utf-8');

//Página login correcto
const LOGIN_CORRECTO = fs.readFileSync('login-correcto.html', 'utf-8');

//Página login incorrecto
const LOGIN_INCORRECTO = fs.readFileSync('login-incorrecto.html', 'utf-8');

//Página usuario ya logueado
const LOGIN_USER = fs.readFileSync('usuario-logueado.html', 'utf-8');

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
      if(resource_type == 'jpg' || resource_type == 'png' || resource_type == 'PNG' || resource_type == 'gif'){
          mime = "image/" + resource_type;
      }

      //Definición del tipo de archivo css
      if (resource_type == "css"){
          mime = "text/css";
      }

      //Fichero no encontrado
      if (err) {
        resource = "./error.html";
        data = fs.readFileSync(resource);
        res.writeHead(404, {'Content-Type': mime});
        console.log("404 Not Found");
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
console.log("Servidor de la tienda online escuchando en puerto: " + PUERTO);