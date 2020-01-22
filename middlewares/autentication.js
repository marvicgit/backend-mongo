var jwt = require('jsonwebtoken');
var SEED = require('../config/config').SEED;
// ===========================================
// Verificar token
// ===========================================
exports.verificaToken = (req, res, next) => {
    var token = req.query.token;
    jwt.verify(token, SEED, (err, decode) => {
        if(err){
            return res.status(401).json({
                ok: false,
                mensaje: 'Token incorrecto',
                errors: err
            })
        } 
        req.usuario =  decode.usuario;
        next();
        // return res.status(200).json({
        //     ok: true,
        //     decode: decode
        // })
    })
}

// ===========================================
// Verificar Admin
// ===========================================
exports.verificaAdmin_Role = (req, res, next) => {
    var usuario = req.usuario;
    if (usuario.role === 'ADMIN_ROLE') {
        next();
        return;
    } else {
        return res.status(401).json({
            ok: false,
            mensaje: 'Token incorrecto - No es administrador',
            errors: { message: 'No es administrador no puede hacer eso' }
        });
    }
}

// ===========================================
// Verificar Admin o Mismo Usuario
// ===========================================
exports.verificaAdmin_o_MismoUsuario = (req, res, next) => {
    var usuario = req.usuario;
    var id = req.params.id;
    if (usuario.role === 'ADMIN_ROLE' || usuario._id === id) {
        next();
        return;
    } else {
        return res.status(401).json({
            ok: false,
            mensaje: 'Token incorrecto - No es administrador ni es el mismo usuario',
            errors: { message: 'No es administrador no puede hacer eso' }
        });
    }
}


