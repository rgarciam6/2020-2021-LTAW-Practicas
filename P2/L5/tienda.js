//-- Lectura y modificación de un fichero JSON
const fs = require('fs');
//-- Npmbre del fichero JSON a leer
const FICHERO_JSON = "tienda.json";

//-- NOmbre del fichero JSON de salida
const FICHERO_JSON_OUT = "tienda-salida.json";

//-- Leer el fichero JSON
const tienda_json = fs.readFileSync(FICHERO_JSON);

//-- Crear la estructura tienda a partir del contenido del fichero
const tienda = JSON.parse(tienda_json);

//--Incrementar en 1 la cantidad de todos los productos
tienda[0]["productos"].forEach((element, index)=>{
    console.log("Stock Producto " + (index + 1) + ": " + element.stock);
    element.stock += 1;
  });

//-- Convertir la variable a cadena JSON
let myJSON = JSON.stringify(tienda);

//-- Guardarla en el fichero destino
fs.writeFileSync(FICHERO_JSON_OUT, myJSON);

console.log("Información guardada en fichero: " + FICHERO_JSON_OUT);