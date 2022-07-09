class TipoDeReparacion {
  constructor (id, nombre, precio, categoria){
    this.id = parseInt(id)
    this.nombre = nombre
    this.precio = parseInt(precio)
    this.categoria = categoria
  }
}

//Definición de elementos y carga mediante localStorage si es que está disponible
let carrito = JSON.parse(localStorage.getItem("Carrito")) || [];
let precioFinal = JSON.parse(localStorage.getItem("Precio Final")) || 0;
render()

//Al intentar cargar archivos con un json local me tiraba error de CORS policy, por lo que
//decidí subrilo a una API que hostea archivos JSON (De paso me sirve como práctica)
//Usaré una alert mientras se carga el fetch, así no se entorpece la navegación del sitio
Swal.fire({
  title: 'Cargando...',
  html: '<b>Por favor, espere...</b>',
  allowEscapeKey: false,
  allowOutsideClick: false,
  background: '#FFFDD0',
  didOpen: () => {
    Swal.showLoading()
  }
});
let opcionesDeReparacion = []
const cargaJson = async () => {
  const fetchJson = await fetch('https://api.jsonbin.io/v3/b/62c9bce7f023111c706e621a',
                               {headers:{"X-Master-Key":"$2b$10$E/Td4EtAtSzqvHNDZ7ZWmuxvi68VZRHfF2qDekK27Y0UoPxVIxNIm"}})
  const datosJson = await fetchJson.json()
  opcionesDeReparacion = datosJson.record
  opcionesDeReparacion = opcionesDeReparacion.map(element => {
    return new TipoDeReparacion(element.id,element.nombre,element.precio,element.categoria)
  })
//Cargamos el listado al DOM
  for (const opcion of opcionesDeReparacion) {
    if (opcion.categoria == "Rústica"){
      ulRustica.innerHTML += `<li class="list-group-item clarisimo d-flex justify-content-between"> ${opcion.nombre + opcion.precio}
                              <button id="${opcion.id}"class="botonEliminador crema"> + </button></li>`
    }
    else if (opcion.categoria == "Cartoné"){
      ulCartone.innerHTML += `<li class="list-group-item clarisimo d-flex justify-content-between"> ${opcion.nombre + opcion.precio}
                              <button id="${opcion.id}" class="botonEliminador crema"> + </button></li>`
    }
    else if (opcion.categoria == "Cuero"){
      ulCuero.innerHTML += `<li class="list-group-item clarisimo d-flex justify-content-between"> ${opcion.nombre + opcion.precio}
                            <button id="${opcion.id}" class="botonEliminador crema"> + </button></li>`
    }
  }
//Agregamos funcionalidad a los botones del listado, para que el usuario pueda agregar los productos que desee al carrito
  for (const item of opcionesDeReparacion) {
    let eventos = document.getElementById(item.id);
    eventos.addEventListener("click", function () {
      if (carrito.length < 12){
        carrito.push(item)
        precioFinal += item.precio
        render()
        Toastify({
          text: "¡Producto agregado!",
          duration: 1500,
          gravity: 'top',
          position: 'right',
          style: { background: 'linear-gradient(to right, #4F7178, #E4AF8E)'}
        }).showToast();
      }
      else {
        Swal.fire({
          title: 'Lo sentimos',
          html: "<b>Solo aceptamos hasta 12 productos.<br> Para compras mayoristas, contáctenos a través de un correo electrónico</b>",
          icon: 'error',
          confirmButtonText: 'Cerrar',
          background: '#F2DEBD',
          allowOutsideClick:false
        })
      }
    });
  }
  swal.close();
}
cargaJson()

//Creamos una función para mostrar los elementos del carrito en el DOM. También mantiene actualizado al localStorage
function render () {
  let items = "";
  carrito.forEach((item, i) => {
    items += `<li class="d-flex justify-content-between"><p class="textoListaCarrito">${item.categoria} | ${item.nombre} ${item.precio}</p>
              <button class="botonEliminador crema"onclick="botonEliminador(${item.id},${item.precio})"> X </button></li>`;
  })
  listaCarrito.innerHTML = items || carrito;
  textoPrecioFinal.innerHTML = `Precio final: $${precioFinal}`;
  localStorage.setItem("Carrito", JSON.stringify(carrito));
  localStorage.setItem("Precio Final", JSON.stringify(precioFinal));}

//Función para eliminar elementos del carrito de forma individual
function botonEliminador (id, precio) {
  let idx = carrito.findIndex(p => p.id==id);
  let resta = carrito.find(p=>p.precio==precio)
  let eliminarPorId = carrito.splice(idx,1);
  precioFinal = precioFinal - resta.precio
  render();
};

//Botón para vaciar el carrito. Al instanciarse como función, podemos reutilizarla luego
function vaciar() { carrito != "" && ( carrito = [], precioFinal = 0, render() ) }
botonVaciador.addEventListener("click",  vaciar)

//Botón para ordenar de menor a mayor
botonOrdenador.addEventListener("click", function () {
  carrito.sort((a, b) => a.precio - b.precio)
  render()
});

//Evitamos que el botón de enviar refresque la página cuando lo presionamos
let formulario = document.getElementById("contact-form");
formulario.addEventListener("submit", function (e) {
  e.preventDefault();
});

//Incluimos el localStorage en el botón de enviar para que recuerde los mails que el usuario ingresó 
function solicitarCorreo() {
  (async() => {
    let {value : correo } = await Swal.fire({
      showCloseButton: true,
      icon: "info",
      html: "<b>Ingrese el correo electrónico al cual quiere que le mandemos la información</b>",
      input: "email",
      customClass: { input:"inputSweetAlert" },
      confirmButtonText:"Confirmar",
      background: '#FFFDD0',
    })
    if (correo){
      localStorage.setItem("Correo", correo)
      Swal.fire({
        icon:"success",
        html:`<b> El carrito y los métodos de pago han sido enviados a ${correo} </b>`,
        background: '#FFFDD0'
      });
      vaciar()
    }
  })()
}
botonDeEnvio.addEventListener("click", function () {
  if (carrito != "") {
    let correo = localStorage.getItem("Correo");
    if (correo == null) {
      solicitarCorreo()
    }
    else {
      Swal.fire({
        showCloseButton: true,
        icon: "question",
        html: `<b>Enviaremos el método de pago al  correo que usted ha registrado: ${correo}<br>¿Está de acuerdo?</b>`,
        confirmButtonText:"Confirmar correo",
        showCancelButton:true,
        cancelButtonText:"Cambiar correo",
        background: '#FFFDD0'
        }).then((result)=>  {
          if (result.isConfirmed){
            localStorage.setItem("Correo", correo)
            Swal.fire({
              icon:"success",
              html:`<b> El carrito y los métodos de pago han sido enviados a ${correo} </b>`,
              background: '#FFFDD0'
            });
            vaciar()
          }
          else if (result.dismiss === Swal.DismissReason.cancel) {
            solicitarCorreo()
          }
        })
    }
  }
  else {
    Swal.fire({
        title: 'Lo sentimos',
        html: "<b>Parece que su carrito está vacío</b>",
        icon: 'error',
        confirmButtonText: 'Cerrar',
        background: '#FFFDD0',
        allowOutsideClick:false
    })
  }
})
