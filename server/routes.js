// Routes.js - Módulo de rutas
var express = require('express');
var router = express.Router();


const mensajes=[
  {
    _id:'xxx',
    user:'spiderman',
    mensaje:'Hola mundo'
  }
]




// Get mensajes
router.get('/', function (req, res) {
  //res.json('Obteniendo mensajes');
  res.json(mensajes);
});

//post mensajes
router.post('/', function(req,res){
  console.log(req.body.lat);
  console.log(req.body.lng);
  const mensaje = {
    mensaje: req.body.mensaje,
    user: req.body.user,
    lat:req.body.lat,
    lng:req.body.lng,
    foto: req.body.foto
  }
  mensajes.push(mensaje);
  res.json({
    ok:true,
    mensaje
  });
});

module.exports = router;