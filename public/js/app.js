
var url = window.location.href;
var swLocation = '/twittor/sw.js';

class Camara{
    constructor(videoNode){
        this.videoNode = videoNode;
        console.log('Camara inicializada');
    }

    encender(){
        navigator.mediaDevices.getUserMedia({
            audio:false,
            video:{width:300, height:300}
        }).then(stream=>{
            this.videoNode.srcObject = stream;
            this.stream = stream;
        });
    }

    apagar(){
        this.videoNode.pause();
        if(this.stream){
            this.stream.getTracks()[0].stop();
        }
    }

    tomarFoto(){
        let canvas = document.createElement('canvas');

        canvas.setAttribute('width', 300);
        canvas.setAttribute('height', 300);

        let context = canvas.getContext('2d');

        context.drawImage(this.videoNode, 0, 0, canvas.width, canvas.height);

        this.foto = context.canvas.toDataURL();

        canvas = null;
        context = null;

        return this.foto;
    }
}

if ( navigator.serviceWorker ) {


    if ( url.includes('localhost') ) {
        swLocation = '/sw.js';
    }


    navigator.serviceWorker.register( swLocation );
}

var googleMapKey = 'AIzaSyA5mjCwx1TRLuBAjwQw84WE6h5ErSe7Uj8';


// Referencias de jQuery

var titulo      = $('#titulo');
var nuevoBtn    = $('#nuevo-btn');
var salirBtn    = $('#salir-btn');
var cancelarBtn = $('#cancel-btn');
var postBtn     = $('#post-btn');
var avatarSel   = $('#seleccion');
var timeline    = $('#timeline');

var modal       = $('#modal');
var modalAvatar = $('#modal-avatar');
var avatarBtns  = $('.seleccion-avatar');
var txtMensaje  = $('#txtMensaje');

var btnLocation      = $('#location-btn');

var modalMapa        = $('.modal-mapa');

var btnTomarFoto     = $('#tomar-foto-btn');
var btnPhoto         = $('#photo-btn');
var contenedorCamara = $('.camara-contenedor');
var player           = $('#player');

var lat  = null;
var lng  = null; 
var foto = null; 

// El usuario, contiene el ID del héroe seleccionado
var usuario;

const camara = new Camara($('#player')[0]);


// ===== Codigo de la aplicación

function crearMensajeHTML(mensaje, personaje, lat, lng, foto ) {

    // console.log(mensaje, personaje, lat, lng);

    var content =`
    <li class="animated fadeIn fast"
        data-tipo="mensaje">


        <div class="avatar">
            <img src="img/avatars/${ personaje }.jpg">
        </div>
        <div class="bubble-container">
            <div class="bubble">
                <h3>@${ personaje }</h3>
                <br/>
                ${ mensaje }
                `;
    
     if ( foto ) {
        content += `
                <br>
                <img class="foto-mensaje" src="${ foto }">
        `;
    }
        
    content += `</div>        
                <div class="arrow"></div>
            </div>
        </li>
    `;

    
    // si existe la latitud y longitud, 
    // llamamos la funcion para crear el mapa
    if ( lat ) {
        crearMensajeMapa( lat, lng, personaje );
    }
    
    // Borramos la latitud y longitud por si las usó
    lat = null;
    lng = null;

    $('.modal-mapa').remove();

    timeline.prepend(content);
    cancelarBtn.click();

}

function crearMensajeMapa(lat, lng, personaje) {


    let content = `
    <li class="animated fadeIn fast"
        data-tipo="mapa"
        data-user="${ personaje }"
        data-lat="${ lat }"
        data-lng="${ lng }">
                <div class="avatar">
                    <img src="img/avatars/${ personaje }.jpg">
                </div>
                <div class="bubble-container">
                    <div class="bubble">
                        <iframe
                            width="100%"
                            height="250"
                            frameborder="0" style="border:0"
                            src="https://www.google.com/maps/embed/v1/view?key=${ googleMapKey }&center=${ lat },${ lng }&zoom=17" allowfullscreen>
                            </iframe>
                    </div>
                    
                    <div class="arrow"></div>
                </div>
            </li> 
    `;

    timeline.prepend(content);
}




// Globals
function logIn( ingreso ) {

    if ( ingreso ) {
        nuevoBtn.removeClass('oculto');
        salirBtn.removeClass('oculto');
        timeline.removeClass('oculto');
        avatarSel.addClass('oculto');
        modalAvatar.attr('src', 'img/avatars/' + usuario + '.jpg');
    } else {
        nuevoBtn.addClass('oculto');
        salirBtn.addClass('oculto');
        timeline.addClass('oculto');
        avatarSel.removeClass('oculto');

        titulo.text('Seleccione Personaje');
    
    }

}


// Seleccion de personaje
avatarBtns.on('click', function() {

    usuario = $(this).data('user');

    titulo.text('@' + usuario);

    logIn(true);

});

// Boton de salir
salirBtn.on('click', function() {

    logIn(false);

});

// Boton de nuevo mensaje
nuevoBtn.on('click', function() {

    modal.removeClass('oculto');
    modal.animate({ 
        marginTop: '-=1000px',
        opacity: 1
    }, 200 );

});


// Boton de cancelar mensaje
cancelarBtn.on('click', function() {

    if ( !modal.hasClass('oculto') ) {
        modal.animate({ 
            marginTop: '+=1000px',
            opacity: 0
         }, 200, function() {
             modal.addClass('oculto');
             modalMapa.addClass('oculto');
             txtMensaje.val('');
         });
    }

});

// Boton de enviar mensaje
postBtn.on('click', function() {

    var mensaje = txtMensaje.val();
    if ( mensaje.length === 0 ) {
        cancelarBtn.click();
        return;
    }

    var data = {
        mensaje: mensaje,
        user: usuario,
        lat: lat,
        lng: lng,
        foto: foto
    };


    fetch('api', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify( data )
    })
    .then( res => res.json() )
    .then( res => console.log( 'app.js', res ))
    .catch( err => console.log( 'app.js error:', err ));

    //camera.apagar();
    //contenedorCamara.addClass('oculto');

    crearMensajeHTML( mensaje, usuario, lat, lng , foto);
    
    foto = null;
});



// Obtener mensajes del servidor
function getMensajes() {

    fetch('api')
        .then( res => res.json() )
        .then( posts => {


            posts.forEach( post => 
                crearMensajeHTML( post.mensaje, post.user, post.lat, post.lng, post.foto ));
        });


}

getMensajes();


function isOnline(){
    if(navigator.onLine){
        var isonline = mdtoast('Online',{
            interaction:true,
            interactionTimeout:1000,
            actionText:'Ok'
        });
        isonline.show();

    }else{
        var isoffline = mdtoast('Offline',{
            interaction:true,
            actionText:'Ok',
            type:'warning'
        });
        isoffline.show();
    }
}

window.addEventListener('online',isOnline);
window.addEventListener('offline',isOnline);
isOnline();

// Crear mapa en el modal
function mostrarMapaModal(lat, lng) {

    $('.modal-mapa').remove();
    
    var content = `
            <div class="modal-mapa">
                <iframe
                    width="100%"
                    height="250"
                    frameborder="0"
                    src="https://www.google.com/maps/embed/v1/view?key=${ googleMapKey }&center=${ lat },${ lng }&zoom=17" allowfullscreen>
                    </iframe>
            </div>
    `;

    modal.append( content );
}

// Obtener la geolocalización
btnLocation.on('click', () => {

    var loadingMap = mdtoast('cargando mapa...',{
        interaction:true,
        interactionTimeout:2000,
        actionText:'Ok!'
    })

    loadingMap.show();

    //console.log('Botón geolocalización');
    navigator.geolocation.getCurrentPosition(pos =>{
        console.log(pos)
        mostrarMapaModal(pos.coords.latitude,pos.coords.longitude);

        lat = pos.coords.latitude;
        lng = pos.coords.longitude;
    })

});



// Boton de la camara
// usamos la funcion de flecha para prevenir
// que jQuery me cambie el valor del this
btnPhoto.on('click', () => {

    //console.log('Inicializar camara');
    contenedorCamara.removeClass('oculto')

    /camara.encender();
});


// Boton para tomar la foto
btnTomarFoto.on('click', () => {

    console.log('Botón tomar foto');

    foto = camara.tomarFoto();

    camara.apagar();   
});
