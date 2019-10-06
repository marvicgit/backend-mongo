var express = require('express');
var app = express();
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');
var SEED = require('../config/config').SEED;
var Usuario = require('../models/usuario');

app.post('/', (req, res) => {
    var body = req.body;
    Usuario.findOne({email: body.email}, (err,usuarioBD) => {
        if(err){
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar usuarios',
                errors: err
            })
        } 

        if(!usuarioBD){
            return res.status(500).json({
                ok: false,
                mensaje: 'Credenciales incorrectas - email',
                errors: err
            });
        } 

        if(!bcrypt.compareSync(body.password, usuarioBD.password)) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Credenciales incorrectas - password',
                errors: err
            });
        }
        // crear token
        usuarioBD.password = ':)';
        var token = jwt.sign({ usuario: usuarioBD }, SEED,{ expiresIn: 14400 })
        return res.status(200).json({
            ok: true,
            token: token,
            id: usuarioBD._id
        })
    })
    
})

module.exports = app;