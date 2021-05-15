console.log("Ejecutando Javascript...");

//Elementos HTML para mostrar informacion
const display1 = document.getElementById("display1");

//Caja de busqueda
const caja = document.getElementById("caja");

//Retrollamda del boton de Ver productos
caja.oninput = () => {

    //Crear objeto para hacer peticiones AJAX
    const m = new XMLHttpRequest();

    //Función de callback que se invoca cuando
    //hay cambios de estado en la petición
    m.onreadystatechange = () => {

        //Petición enviada y recibida.
        if (m.readyState==4) {

            //Si la respuesta es correcta
            if (m.status==200) {

                let productos = JSON.parse(m.responseText)

                console.log(productos);

                //Borrar el resultado anterior
                display1.innerHTML = "";

                //Se recorren los productos del JSON
                for (let i=0; i < productos.length; i++) {

                    //Añadir cada producto a la visualización
                    display1.innerHTML += productos[i];

                    //Separación de los productos por coma
                    if (i < productos.length-1) {
                    display1.innerHTML += ', ';
                    }
                }

            } else {
                //Error en la petición
                console.log("Error en la petición: " + m.status + " " + m.statusText);
                display2.innerHTML += '<p>ERROR</p>'
            }
        }
    }

    console.log(caja.value.length);

    //Petición si hay al menos dos valores
    if (caja.value.length >= 2) {

      //Configurar la petición
      m.open("GET","/productos?param1=" + caja.value, true);

      //Enviar la petición
      m.send();
      
    } else {
        display1.innerHTML="";
    }
}