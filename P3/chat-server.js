//Rebeca García Mencía
//P3 - CHAT

//-- Cargar las dependencias
const socket = require('socket.io');
const http = require('http');
const express = require('express');
const colors = require('colors');

const PUERTO = 8080;

let welcome_message = "¡Hola, bienvenido al chat!";
let new_user = "Un nuevo usuario ha entrado en el chat";
let hello_message = "¡Hola!";
let date = new Date (Date.now());

let commands = "Los comandos especiales son: <br>" +
                "/help: Mostrará una lista con todos los comandos soportados <br>" + 
                "/list: Devolverá el número de usuarios conectados <br>" +
                "/hello: El servidor nos devolverá el saludo <br>" + 
                "/date: Nos devolverá la fecha <br>";

let user_count = 0;
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
  //Enviar mensaje de bienvenida
  socket.send(welcome_message);

  //Enviar mensaje al resto de usuarios de que hay un nuevo usuario en el chat
  io.send(new_user);

  //-- Evento de desconexión
  socket.on('disconnect', function(){
    console.log('** CONEXIÓN TERMINADA **'.yellow);
    user_count -=1;
 });  

  //-- Mensaje recibido: Hacer eco
  socket.on("message", (msg)=> {
    console.log("Mensaje Recibido!: " + msg.blue);
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
            msg = ("La fecha actual es: " + date);
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