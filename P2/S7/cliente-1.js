//-- Servidor JSON

const http = require('http');
const fs = require('fs');
const PUERTO = 8080;

console.log("Ejecutando Javascript...");

const display = document.getElementById("display");
const boton_test = document.getElementById("boton_test");

boton_test.onclick = ()=> {
    display.innerHTML+="<p>Hola desde JS!</p>";
}