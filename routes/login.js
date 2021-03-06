var express = require('express');
var app = express();
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');
var SEED = require('../config/config').SEED;
var Usuario = require('../models/usuario');


//google
var CLIENT_ID = require('../config/config').CLIENT_ID;
const {OAuth2Client} = require('google-auth-library');
const client = new OAuth2Client(CLIENT_ID);

var mdAutenticacion = require('../middlewares/autentication');

// ===========================================
// rfresh token
// ===========================================
app.get('/refreshToken', mdAutenticacion.verificaToken, (req, res) => {

    var token = jwt.sign({ usuario: req.usuario }, SEED,{ expiresIn: 14400 })

    return res.status(200).json({
        ok: true,
        token: token
    })
})



// ===========================================
// Autenticacion de google
// ===========================================
async function verify(token) {
    const ticket = await client.verifyIdToken({
        idToken: token,
        audience: CLIENT_ID,  // Specify the CLIENT_ID of the app that accesses the backend
        // Or, if multiple clients access the backend:
        //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
    });
    const payload = ticket.getPayload();
    const userid = payload['sub'];
    // If request specified a G Suite domain:
    //const domain = payload['hd'];
    return {
        nombre: payload.name,
        email: payload.email,
        img: payload.picture,
        google: true
    };
}
app.post('/google', async (req, res) => {
    var token = req.body.token;
    var googleUser = await verify(token)
        .catch(err => {
            return res.status(403).json({
                ok: false,
                mensaje: 'Token no valido',
                err: err
            })
        });

    Usuario.findOne({ email: googleUser.email }, (err, usuarioBD) => {
        if(err){
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar usuarios',
                errors: err
            })
        } 

        if(usuarioBD){
            if(usuarioBD.google === false) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Debe de usar su autenticacion normal',
                    errors: err
                });
            } else {
                var token = jwt.sign({ usuario: usuarioBD }, SEED,{ expiresIn: 14400 })
                return res.status(200).json({
                    ok: true,
                    token: token,
                    usuario: usuarioBD,
                    id: usuarioBD._id,
                    menu: obtenerMenu(usuarioBD.role)
                });
            }
            
        } else {
            // usuario no eiste, crearlo
            var usuario = new Usuario({
                nombre: googleUser.nombre,
                email: googleUser.email,
                password: ':)',
                img: googleUser.img,
                role: 'USER_ROLE',
                google: true
            });

            usuario.save((err, usuarioSave) => {
                if(err){
                    return res.status(400).json({
                        ok: false,
                        mensaje: 'Error al crear usuarios',
                        errors: err
                    });
                } 
                var token = jwt.sign({ usuario: usuarioSave }, SEED,{ expiresIn: 14400 })
                return res.status(201).json({
                    ok: true,
                    usuario: usuarioSave,
                    token: token,
                    id: usuarioSave._id,
                    menu: obtenerMenu(usuarioBD.role)
                });
            });
        }
    });               
});
// ===========================================
// Autenticacion Normal
// ===========================================
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
            usuario: usuarioBD,
            id: usuarioBD._id,
            menu: obtenerMenu(usuarioBD.role)
        })
    })
    
})

function obtenerMenu(role) {
    var menu = [
        {
          titulo: 'principal',
          icono: 'mdi mdi-gauge',
          submenu: [
            { titulo: 'Dashboard', url: '/dashboard' },
            { titulo: 'ProgressBar', url: '/progress' },
            { titulo: 'Gráficas', url: '/graficas1' },
            { titulo: 'Promesas', url: '/promesa' },
            { titulo: 'Rxjs', url: '/rxjs' }
          ]
        },
        {
          titulo: 'Mantenimientos',
          icono: 'mdi mdi-folder-lock-open',
          submenu: [
            //{ titulo: 'Usuarios', url: '/usuarios' },
            { titulo: 'Hospitales', url: '/hospitales' },
            { titulo: 'Medicos', url: '/medicos' }
          ]
        }
      ];

      if(role === "ADMIN_ROLE") {
          menu[1].submenu.unshift({ titulo: 'Usuarios', url: '/usuarios' });
      }
    return menu;
}

module.exports = app;