//Rebeca García Mencía
//P4 

//-- Cargar las dependencias
const socket = require('socket.io');
const http = require('http');
const express = require('express');
const colors = require('colors');
const electron = require('electron');
const ip = require('ip');
const process = require('process');

const PUERTO = 8080;

let welcome_message = "¡Hola, bienvenido al chat!";
let new_user = "Un nuevo usuario ha entrado en el chat";
let hello_message = "¡Hola!";
let date = new Date();
var options = { year: 'numeric', month: 'long', day: 'numeric' };

let commands = "Los comandos especiales son: <br>" +
                "/help: Mostrará una lista con todos los comandos soportados <br>" + 
                "/list: Devolverá el número de usuarios conectados <br>" +
                "/hello: El servidor nos devolverá el saludo <br>" + 
                "/date: Nos devolverá la fecha <br>";

let user_count = 0;

//-- Variable para acceder a la ventana principal
//-- Se pone aquí para que sea global al módulo principal
let win = null;

//-- Crear una nueva aplciacion web
const app = express();

//-- Crear un servidor, asosiaco a la App de express
const server = http.Server(app);

//-- Crear el servidor de websockets, asociado al servidor http
const io = socket(server);

//-------- PUNTOS DE ENTRADA DE LA APLICACION WEB
//-- Definir el punto de entrada principal de mi aplicación web
app.get('/', (req, res) => {
  res.send('¡Bienvenido al chat!' + '<p><a href="/chat.html">Unirse al chat</a></p>');
});
//-- Esto es necesario para que el servidor le envíe al cliente la
//-- biblioteca socket.io para el cliente
app.use('/', express.static(__dirname +'/'));

//-- El directorio publico contiene ficheros estáticos
app.use(express.static('public'));

//------------------- GESTION SOCKETS IO
//-- Evento: Nueva conexion recibida
io.on('connect', (socket) => {
  
  console.log('** NUEVA CONEXIÓN **'.yellow);
  user_count = user_count + 1;
  win.webContents.send('users', user_count);
  //Enviar mensaje de bienvenida
  socket.send(welcome_message);
  
  //Enviar mensaje al resto de usuarios de que hay un nuevo usuario en el chat
  io.send(new_user);
  win.webContents.send('msg', new_user);

  //-- Evento de desconexión
  socket.on('disconnect', function(){
    console.log('** CONEXIÓN TERMINADA **'.yellow);
    user_count -=1;
    win.webContents.send('users', user_count);
 });  

  //-- Mensaje recibido: Hacer eco
  socket.on("message", (msg)=> {
    console.log("Mensaje Recibido!: " + msg.blue);
    win.webContents.send('msg', msg);
    if (msg.startsWith('/')){
        if (msg == '/help'){
            console.log("Muestra una lista con todos los comandos soportados");
            msg = commands;
            socket.send(msg);
        }else if (msg == '/list'){
            console.log("Devuelve el número de usuarios conectados");
            msg = ("El número de usuarios conectados es: " + user_count);
            socket.send(msg);
        }else if (msg == '/hello'){
            console.log("El servidor devuelve el saludo");
            msg = hello_message;
            socket.send(msg);
        } else if(msg == '/date'){
            console.log("Devuelve la fecha");
            msg = ("La fecha actual es: " + date.toLocaleDateString("es-ES", options));
            socket.send(msg);
        }else{
            console.log("Comando no reconocido");
            msg = ("Comando no reconocido");
            socket.send(msg);
        }

    }else{
        //-- Hacer eco
        io.send(msg);
    }

  });

});

//-- Lanzar el servidor HTTP
//-- ¡Que empiecen los juegos de los WebSockets!
server.listen(PUERTO);
console.log("Escuchando en puerto: " + PUERTO);

//-- Punto de entrada. En cuanto electron está listo,
//-- ejecuta esta función
electron.app.on('ready', () => {
  console.log("Evento Ready!");

  //-- Crear la ventana principal de nuestra aplicación
  win = new electron.BrowserWindow({
      width: 600,   //-- Anchura 
      height: 600,  //-- Altura

      //-- Permitir que la ventana tenga ACCESO AL SISTEMA
      webPreferences: {
        nodeIntegration: true,
        contextIsolation: false
      }
  });

  //-- En la parte superior se nos ha creado el menu
  //-- por defecto
  //-- Si lo queremos quitar, hay que añadir esta línea
  //win.setMenuBarVisibility(false)
  
  //-- Cargar interfaz gráfica en HTML
  let index = "index.html"
  win.loadFile(index);

  //-- Obtener elementos de la interfaz
  version_node = process.versions.node;
  version_electron = process.versions.electron;
  version_chrome = process.versions.chrome;
  arquitectura = process.arch;
  plataforma = process.platform;
  directorio = process.cwd();
  ip_address = ip.address();
  chat = "chat.html";

  let information = [version_node, version_electron, version_chrome, arquitectura, plataforma, directorio, ip_address, PUERTO, chat];

  //-- Esperar a que la página se cargue y se muestre
  //-- y luego enviar el mensaje al proceso de renderizado para que 
  //-- lo saque por la interfaz gráfica
  win.on('ready-to-show', () => {
    win.webContents.send('information', information);
  });

});

//-- Esperar a recibir los mensajes de botón apretado (Test) del proceso de 
//-- renderizado. Al recibirlos se escribe una cadena en la consola
electron.ipcMain.handle('test', (event, msg) => {
console.log("-> Mensaje: " + msg);
io.send(msg);
});