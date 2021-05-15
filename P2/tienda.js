//Rebeca García Mencía
//P2 - TIENDA
//Importando módulos
const http = require('http');
const fs = require('fs');
const PUERTO = 9000;

//Definición de los tipos de mime
const mime= {
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

//Página de error
const ERROR = fs.readFileSync('error.html', 'utf-8');

//Páginas de los productos
const PRODUCTO1 = fs.readFileSync('producto1.html', 'utf-8');
const PRODUCTO2 = fs.readFileSync('producto2.html', 'utf-8');
const PRODUCTO3 = fs.readFileSync('producto3.html', 'utf-8');

//Formulario login y pedido
const LOGIN = fs.readFileSync('login.html','utf-8');
const PEDIDO = fs.readFileSync('pedido.html','utf-8');

//Páginas de respuesta de login y carrito
const LOGIN_CORRECTO = fs.readFileSync('login-correcto.html','utf-8');
const LOGIN_INCORRECTO = fs.readFileSync('login-incorrecto.html','utf-8');
const PEDIDO_REALIZADO = fs.readFileSync('pedido-realizado.html','utf-8');
const PRODUCTO_ANADIDO = fs.readFileSync('producto-anadido.html','utf-8');

//Ficheros JSON
const FICHERO_JSON = "tienda.json";
const FICHERO_JSON_MODIFICADA = "tienda-modificada.json";

//Página del carrito
const CARRITO = fs.readFileSync('carrito.html','utf-8');

//Declaración de variables de busqueda y articulos en el carrito
let hay_carrito = false;
let busqueda;

//Lectura del fichero JSON
const tienda_json = fs.readFileSync(FICHERO_JSON);

const tienda = JSON.parse(tienda_json);

//Lista de usuarios registrados
let registered_users = [];
console.log("Lista de usuarios registrados");
console.log("-----------------------------");
tienda[1]["usuarios"].forEach((element, index)=>{
    console.log("Usuario " + (index + 1) + ": " + element.usuario);
    registered_users.push(element.usuario);
  });
console.log();

//Lista de usuarios disponibles
let available_products = [];
let product_list = [];
console.log("Lista de productos disponibles");
console.log("-----------------------------");
tienda[0]["productos"].forEach((element, index)=>{
  console.log("Producto " + (index + 1) + ": " + element.nombre +
              ", Stock: " + element.stock + ", Precio: " + element.precio);
  available_products.push([element.nombre, element.descripcion, element.stock, 
                       element.precio]);
  product_list.push(element.nombre);
});
console.log();

//Analizar la cookie y devolver el nombre de usuario si existe,
//null en caso contrario.
function get_user(req) {
  
  //Leer la cookie recibida
  const cookie = req.headers.cookie;

  //Si hay cookie, guardamos el usuario
  if (cookie) {
    //Obtener un array con todos los pares nombre-valor
    let pares = cookie.split(";");

    // Variable para guardar el usuario
    let user;

    //Recorrer todos los pares nombre-valor
    pares.forEach((element, index) => {
      //Obtener los nombre y los valores por separado
      let [nombre, valor] = element.split('=');

      //Leer el usuario solo si nombre = user
      if (nombre.trim() === 'user') {
        user = valor;
      }
    });

    //Si user no esta asignada se devuelve null
    return user || null;
  }
}

//Funcion para crear las cookies al añadir los productos al carrito
function add_to_cart(req, res, producto) {
  const cookie = req.headers.cookie;

  if (cookie) {
    //Obtener un array con todos los pares nombre-valor
    let pares = cookie.split(";");

    //Recorrer todos los pares nombre-valor
    pares.forEach((element, index) => {
      //Obtener los nombre y los valores por separado
      let [nombre, valor] = element.split('=');

      //Si nombre = carrito enviamos cookie de respuesta
      if (nombre.trim() === 'carrito') {
        res.setHeader('Set-Cookie', element + ':' + producto);
      }
    });
  }
}

//Funcion para obtener el carrito
function get_cart(req){
  //Leer la cookie recibida
  const cookie = req.headers.cookie;

  if (cookie){
    //Obtener un array con todos los pares nombre-valor
    let pares = cookie.split(";");

    //Variables para guardar los datos del carrito
    let carrito;
    let thriller = '';
    let num_thriller = 0;
    let romantica = '';
    let num_romantica = 0;
    let historica = '';
    let num_historica = 0;

    //Recorrer todos los pares nombre-valor
    pares.forEach((element, index) => {
      //Obtener los nombre y los valores por separado
      let [nombre, valor] = element.split('=');

      //Si nombre = carrito registramos los articulos
      if (nombre.trim() === 'carrito') {
        productos = valor.split(':');
        productos.forEach((producto) => {
          if (producto == 'thriller'){
            if (num_thriller == 0) {
              thriller = available_products[0][0];
            }
            num_thriller += 1;
          }else if (producto == 'romantica'){
            if (num_romantica == 0){
              romantica = available_products[1][0];
            }
            num_romantica += 1;
          }else if (producto == 'historica'){
            if (num_historica == 0){
              historica = available_products[2][0];
            }
            num_historica += 1;
          }
        });

        if (num_thriller != 0) {
          thriller += ' x ' + num_thriller;
        }
        if (num_romantica != 0) {
          romantica += ' x ' + num_romantica;
        }
        if (num_historica != 0) {
          historica += ' x ' + num_historica;
        }
        carrito = thriller + '<br>' + romantica + '<br>' + historica;
      }
    });

    //Si esta vacío se devuelve null
    return carrito || null;
  }
}

var n;
//Funcion para obtener la pagina del producto requerido
function get_product(n, requested_content) {
  requested_content = requested_content.replace('NOMBRE', available_products[n][0]);
  requested_content = requested_content.replace('DESCRIPCION', available_products[n][1]);
  requested_content = requested_content.replace('PRECIO', available_products[n][3]);

  return requested_content;
}

//Creación del servidor
const server = http.createServer((req, res) => {

    //Construir la url
    const url = new URL(req.url, 'http://' + req.headers['host']);  
    console.log("");
    console.log("Método: " + req.method);
    console.log("Recurso: " + req.url);
    console.log("Ruta: " + url.pathname);
    console.log("Parametros: " + url.searchParams);

    let content_type = mime["html"];
    let requested_content = "";

    //Leer recurso y eliminar la / inicial
    let recurso = url.pathname;
    recurso = recurso.substr(1); 

    switch (recurso) {
      case '':
          console.log("Página principal");
          //Página principal
          requested_content = PAGINAPPAL;

           //Obtención del usuario
          let user = get_user(req);

          //Si hay un usuario registrado se accede con su nombre, sino se muestra el formulario login
          if (user) {
            requested_content = PAGINAPPAL.replace("HTML_EXTRA", "<h2>Usuario: " + user + "</h2>" +
                      `<a href="/carrito">Ir al carrito</a>`);
          }else{
            requested_content = PAGINAPPAL.replace("HTML_EXTRA", 
                      `<a href="/login">Login</a>`);
          }
          break;
      //Formulario Login
      case 'login':
        requested_content = LOGIN;
        break;
      
      //Se procesa el login
      case 'procesarlogin':
        let usuario = url.searchParams.get('nombre');
        console.log('Nombre: ' + usuario);
        //Si el usuario está registrado se muestra la página de login correcto
        if (registered_users.includes(usuario)){
            console.log('Usuario registrado');
            //Se asigna la cookie al usuario registrado.
            res.setHeader('Set-Cookie', "user=" + usuario);
            requested_content = LOGIN_CORRECTO;
            requested_content = requested_content.replace("HTML_EXTRA", usuario);
        }else{
          //Si el usuario no está registrado se muestra la página de login incorrecto
          requested_content = LOGIN_INCORRECTO;
        }
        break;

      //Paginas de los productos
      case 'producto1':
        n = 0;
        requested_content = PRODUCTO1;
        requested_content = get_product(n, requested_content);
        break;
      
      case 'producto2': 
        n = 1;
        requested_content = PRODUCTO2;
        requested_content = get_product(n, requested_content);
        break;

      case 'producto3':
        n = 2;
        requested_content = PRODUCTO3;
        requested_content = get_product(n, requested_content);
        break;

      //Se añaden los productos al carrito
      case 'add_thriller':
        requested_content = PRODUCTO_ANADIDO;
        if (hay_carrito) {
          add_to_cart(req, res, 'thriller');
        }else{
          res.setHeader('Set-Cookie', 'carrito=thriller');
          hay_carrito = true;
        }
        //Si el usuario está registrado se muestra la opción de ir al carrito, sino el formulario login
        registered_user= get_user(req);
          if (registered_user) {
            requested_content = PRODUCTO_ANADIDO.replace("HTML_EXTRA", 
                      `<a href="/carrito">Ir al carrito</a>`);
          }else{
            requested_content = PRODUCTO_ANADIDO.replace("HTML_EXTRA", 
                      `<a href="/login">Login</a>`);
          }
        break;

      case 'add_romantica':
        requested_content = PRODUCTO_ANADIDO;
        if (hay_carrito) {
          add_to_cart(req, res, 'romantica');
        }else{
          res.setHeader('Set-Cookie', 'carrito=romantica');
          hay_carrito = true;
        }
        //Si el usuario está registrado se muestra la opción de ir al carrito, sino el formulario login
        registered_user = get_user(req);
          if (registered_user) {
            requested_content = PRODUCTO_ANADIDO.replace("HTML_EXTRA", 
                      `<a href="/carrito">Ir al carrito</a>`);
          }else{
            requested_content = PRODUCTO_ANADIDO.replace("HTML_EXTRA", 
                      `<a href="/login">Login</a>`);
          }
        break;
      
      case 'add_historica':
        requested_content = PRODUCTO_ANADIDO;
        if (hay_carrito) {
          add_to_cart(req, res, 'historica');
        }else{
          res.setHeader('Set-Cookie', 'carrito=historica');
          hay_carrito = true;
        }
        //Si el usuario está registrado se muestra la opción de ir al carrito, sino el formulario login
        registered_user = get_user(req);
          if (registered_user) {
            requested_content = PRODUCTO_ANADIDO.replace("HTML_EXTRA", 
                      `<a href="/carrito">Ir al carrito</a>`);
          }else{
            requested_content = PRODUCTO_ANADIDO.replace("HTML_EXTRA", 
                      `<a href="/login">Login</a>`);
          }
        break;

      //Acceso al carrito
      case 'carrito':
        requested_content = CARRITO;
        let carrito = get_cart(req);
        requested_content = requested_content.replace("PRODUCTOS", carrito);
        break;

      //Acceso al formulario de pedidos
      case 'pedido':
        requested_content = PEDIDO;
        let pedido = get_cart(req);
        requested_content = requested_content.replace("PRODUCTOS", pedido);
        break;
      
      //Se procesa el formulario de pedidos
      case 'procesarpedido':
        //Obtención de parámetros
        let direccion = url.searchParams.get('dirección');
        let tarjeta = url.searchParams.get('tarjeta');
        console.log("Dirección de envío: " + direccion + "\n" +
                    "Número de la tarjeta: " + tarjeta + "\n");
        //Lista de productos y cantidades
        carro = get_cart(req);
        producto_unidades = carro.split('<br>');
        console.log(producto_unidades);

        let productos_comprados = [];
        let unidades_compradas = [];
        //Se obtiene el número de productos adquiridos y se actualiza el stock
        producto_unidades.forEach((element, index) => {
          let [producto, unidades] = element.split(' x ');
          productos_comprados.push(producto);
          unidades_compradas.push(unidades);
        });
        
        tienda[0]["productos"].forEach((element, index)=>{
          console.log("Producto " + (index + 1) + ": " + element.nombre);
          console.log(productos_comprados[index]);
          console.log();
          if (element.nombre == productos_comprados[index]){
            element.stock = element.stock - unidades_compradas[index];
          }
        });
        console.log();
        
        //Guardar pedido
        if ((direccion != null) && (tarjeta != null)) {
          let pedido = {
            "usuario": get_user(req),
            "dirección": direccion,
            "tarjeta": tarjeta,
            "productos": producto_unidades
          }
          tienda[2]["pedidos"].push(pedido);
          //Convertir a JSON y registrarlo
          let myTienda = JSON.stringify(tienda, null, 4);
          fs.writeFileSync(FICHERO_JSON_MODIFICADA, myTienda);
        }
        //Confirmación de pedido
        console.log('Pedido realizado');
        requested_content = PEDIDO_REALIZADO;
        break;
      
      //Busqueda
      case 'productos':
          console.log("Peticion de Productos!")
          content_type = mime["json"]; 

          //Leer los parámetros
          let param1 = url.searchParams.get('param1');

          param1 = param1.toUpperCase();

          console.log("  Param: " +  param1);

          let result = [];

          for (let prod of product_list) {

              //Pasar a mayúsculas
              prodU = prod.toUpperCase();

              // Si el producto comienza por lo indicado en el parametro
              //meter este producto en el array de resultados
              if (prodU.startsWith(param1)) {
                  result.push(prod);
              }
              
          }
          console.log(result);
          busqueda = result;
          requested_content = JSON.stringify(result);
          break;
        
          case 'buscar':
            if (busqueda == 'Reina Roja') {
              n = 0;
              requested_content = PRODUCTO1;
              requested_content = get_product(n, requested_content);
            }else if(busqueda == 'Un cuento perfecto'){
              n = 1;
              requested_content = PRODUCTO2;
              requested_content = get_product(n, requested_content);
            }else if(busqueda == 'Dime quién soy'){
              n = 2;
              requested_content = PRODUCTO3;
              requested_content = get_product(n, requested_content);
            }
            break;
    
      case 'cliente.js':
          //Leer fichero javascript
          console.log("recurso: " + recurso);
          fs.readFile(recurso, 'utf-8', (err,data) => {
              if (err) {
                  console.log("Error: " + err)
                  return;
              } else {
                res.setHeader('Content-Type', mime["js"]);
                res.write(data);
                res.end();
              }
          });
          
          return;
          break;

          //Pagina de error en el caso de no solicitar recurso disponible
          default:

            path = url.pathname.split('/');
            ext = '';
            if (path.length > 2){
                file = path[path.length-1]
                ext = file.split('.')[1]
                if(path.length == 3){
                    if (path[1].startsWith('producto')){
                        recurso = file
                    }else{
                        recurso = path[1] + '/' + file
                    }
                }else{
                    recurso = path[2] + '/' + file
                }
            }else{
                recurso = url.pathname.split('/')[1];
                ext = recurso.split('.')[1]
            }
            fs.readFile(recurso, (err, data) => {
                if (err){
                res.writeHead(404, {'Content-Type': content_type});
                res.write(ERROR);
                res.end();
                }else{
                    content_type = mime[ext];
                    res.setHeader('Content-Type', content_type);
                    res.write(data);
                    res.end();
                } 
            });
        return;
    }
    //Si hay datos en el cuerpo
    req.on('data', (cuerpo) => {
        //-- Datos = caracteres
        req.setEncoding('utf8');
        console.log(`Cuerpo (${cuerpo.length} bytes)`)
        console.log(` ${cuerpo}`);
      });
  
      //Fin  mensaje de solicitud
      req.on('end', ()=> {
        res.setHeader('Content-Type', content_type);
        res.write(requested_content);
        res.end()
      });

});

server.listen(PUERTO);
console.log("Escuchando en puerto: " + PUERTO);