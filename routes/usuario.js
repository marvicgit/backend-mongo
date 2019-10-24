var express = require('express');
var app = express();
var bcrypt = require('bcryptjs');
var Usuario = require('../models/usuario');
var jwt = require('jsonwebtoken');
var mdAutenticacion = require('../middlewares/autentication');

// ===========================================
// Obtener todos los usuarios
// ===========================================
app.get('/', (req, res, next) => {
    var desde = req.query.desde || 0;
    desde = Number(desde);
    Usuario.find({}, 'nombre email img role')
    .skip(desde)
    .limit(5)
    .exec((err, usuarios) => {
        if(err){
            return res.status(500).json({
                ok: false,
                mensaje: 'Error cargando usuarios',
                errors: err
            })
        }
        Usuario.count({}, (err, conteo) => {
            return res.status(200).json({
                ok: true,
                usuarios: usuarios,
                total: conteo
            });
        });
    })
});

// ===========================================
// Crear nuevo usuario
// ===========================================
app.post('/', (req, res) => {
    var body = req.body;
    var usuario = new Usuario({
        nombre: body.nombre,
        email: body.email,
        password: bcrypt.hashSync(body.password, 10),
        img: body.img,
        role: body.role
    });

    usuario.save((err, usuarioSave) => {
        if(err){
            return res.status(400).json({
                ok: false,
                mensaje: 'Error al crear usuarios',
                errors: err
            });
        } 

        return res.status(201).json({
            ok: true,
            body: usuarioSave,
            usuarioToken: req.usuario
        });
    });
    
})

// ===========================================
// Actualiza usuario
// ===========================================
app.put('/:id', mdAutenticacion.verificaToken, (req, res) => {
    var id = req.params.id;
    var body = req.body;
    Usuario.findById(id, (err, usuario) => {
        if(err){
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar usuario',
                errors: err
            });
        } 
        if(!usuario){
            return res.status(400).json({
                ok: false,
                mensaje: 'El usuario con el id especificado no eiste',
                errors: { message: 'No existe usuario cn ese ID' }
            });
        } 

        usuario.nombre = body.nombre;
        usuario.email = body.email;
        usuario.role = body.role;

        usuario.save((err, usuarioSave) => {
            if(err){
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error al actualizar usuario',
                    errors: err
                });
            } 
            usuarioSave.password = ':)';
            return res.status(200).json({
                ok: true,
                body: usuarioSave
            });
        })

    });
});

// ===========================================
// Borrar usuario por ID
// ===========================================
app.delete('/:id', mdAutenticacion.verificaToken, (req, res) => {
    var id = req.params.id;
    Usuario.findByIdAndRemove(id, (err, usuarioDelete) => {
        if(err){
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al borrar usuario',
                errors: err
            });
        } 
        return res.status(200).json({
            ok: true,
            usuario: usuarioDelete
        });
    })
});
module.exports = app;

// 
// iFQ6Hm4rJH7TqgKhHdhvkhyj