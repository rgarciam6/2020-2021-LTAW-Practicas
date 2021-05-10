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


//Página principal
const PAGINAPPAL = fs.readFileSync('tienda.html', 'utf-8');
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

//Fichero JSON con la estructura de la tienda
const FICHERO_JSON = "tienda.json";

//Fichero JSON modificado
const FICHERO_JSON_MODIFICADO = "tienda-modificada.json";

//Lectura del fichero JSON
const  tienda_json = fs.readFileSync(FICHERO_JSON);

const tienda = JSON.parse(tienda_json);

//Definición página principal
let paginappal;

//Definición contenido solicitado por el usuario
let requested_content;

//Lista de usuarios registrados
let registered_users = [];
console.log("Usuarios registrados");
tienda[1]["usuarios"].forEach((element, index)=>{
    console.log("Usuario " + (index + 1) + ": " + element.usuario);
    registered_users.push(element.usuario);
  });

//Lista de productos disponibles
let productos_disponibles = [];
let lista_productos = [];
console.log("Productos disponibles");
tienda[0]["productos"].forEach((element, index)=>{
  console.log("Producto " + (index + 1) + ": " + element.nombre + ", Precio: " + element.precio + ", Stock: " + element.stock);
  productos_disponibles.push([element.nombre, element.descripcion, element.precio, element.stock]);
  lista_productos.push(element.nombre);
});


//Creación del servidor
const server = http.createServer((req, res) => {

    console.log("Petición recibida");
  
    //Lectura de la cookie recibida
    const cookie = req.headers.cookie;

    //Declaración de variable para guardar el usuario
    let user;

    //Comprobamos si hay cookies
    if (cookie) {
        console.log("Cookie: " + cookie);

        //Obtener un array con todos los pares nombre-valor
        let pares = cookie.split(";");

        //Recorrer todos los pares nombre-valor
        pares.forEach((element, index) => {

        //Obtener los nombres y valores por separado
        let [nombre, valor] = element.split('=');

        ////Leer el usuario
        //Solo si el nombre es 'user'
        if (nombre.trim() === 'user') {
            user = valor;
        }
        });
    }else {
        console.log("Petición sin cookie");
    }

    //Construir el objeto url con la url de la solicitud
    const url = new URL(req.url, 'http://' + req.headers['host']);  
    console.log("");
    console.log("Método: " + req.method);
    console.log("Recurso: " + req.url);
    console.log("Ruta: " + url.pathname); 
    console.log("Parametros: " + url.searchParams); 
    //-- Leer los parámetros
    let nombre = url.searchParams.get('nombre');
    console.log(" Nombre usuario: " + nombre);

    let content_type = mime["html"]; 
  
    //Analizar los recursos solicitados
    if(url.pathname == '/'){
        //Comprobar si el usuario está registrado
        if(user){
            //Añadir nombre a página principal
            requested_content = PAGINAPPAL.replace('<h3></h3>', '<h3> Usuario: ' + user + '</h3>');
            requested_content = requested_content.replace('<b></b>',
                                    '<a  class= "elemen" href="/comprar">Finalizar Comprar</a>');
            paginappal = requested_content;
        }else{
            //Muestra la página principal con el login
            requested_content = PAGINAPPAL; 
            paginappal = requested_content;
        }
    
    //Login
    }else if (url.pathname == '/login'){
        //Comprobar si hay cookie del usuario
        if(user){
            //Si hay cookie
            console.log('Usuario ya logueado');
            requested_content = LOGIN_USER.replace("HTML_EXTRA", user );

        }else{
        console.log('Usuario no logueado');
        //Se envía formulario login
        requested_content = LOGIN;
        }
        ext = "html";
    //Procesar

    }else if (url.pathname == '/procesar'){
        //Se comprueba que el usuario está registrado en el JSON
        if ((registered_users.includes(nombre))){

            console.log('User: ' + nombre);

            //Se asigna la cookie
            res.setHeader('Set-Cookie', "user=" + nombre );

            //Login OK
            console.log('Usuario registrado');
            requested_content = LOGIN_CORRECTO;
            requested_content = requested_content.replace("HTML_EXTRA", nombre);

        }else{
            requested_content = LOGIN_INCORRECTO;
        }
    }else{
        path = url.pathname.split('/');
        ext = '';
        if (path.length > 2){
          file = path[path.length-1]
          ext = file.split('.')[1]
          if(path.length == 3){
            if (path[1].startsWith('producto')){
              filename = file
            }else{
              filename = path[1] + '/' + file
            }
           }else{
              filename = path[2] + '/' + file
           }
        }else{
          filename = url.pathname.split('/')[1];
          ext = filename.split('.')[1]
        }
        fs.readFile(filename, (err, data) => {
          //-- Controlar si la pagina es no encontrada.
          //-- Devolver pagina de error personalizada, 404 NOT FOUND
          if (err){
            res.writeHead(404, {'Content-Type': content_type});
            res.write(ERROR);
            res.end();
          }else{
            //-- Todo correcto
            //-- Devolvemos segun el tipo de mime
            content_type = mime[ext];
            res.setHeader('Content-Type', content_type);
            res.write(data);
            res.end();
          } 
        });
        return;
      }
      
      //-- Generar respuesta
      res.setHeader('Content-Type', content_type);
      res.write(requested_content);
      res.end();
    });
    
    server.listen(PUERTO);
    console.log("Escuchando en puerto: " + PUERTO);