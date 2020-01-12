var express = require('express');
var fileUpload = require('express-fileupload');
var fs = require('fs');

var app = express();
var Usuario = require('../models/usuario');
var Medico = require('../models/medico');
var Hospital = require('../models/hospital');

app.use(fileUpload());
app.put('/:tipo/:id', (req, res, next) => {
    var tipo = req.params.tipo;
    var id = req.params.id;

    // tipos de coleccion
    var tipoValidos = ['hospitales', 'medicos', 'usuarios']
    if(tipoValidos.indexOf(tipo) < 0) {
        return res.status(400).json({
            ok: false,
            mensaje: 'Tipo de coleccion no valida',
            errors: { message: 'los tipo validas' }
        });
    }

    if(!req.files) {
        return res.status(400).json({
            ok: false,
            mensaje: 'No selecciono nada',
            errors: { message: 'debe seleccinar una imagen' }
        });
    }
    //Obtener nombre del archivo
    var archivo = req.files.imagen;
    var nombreCortado = archivo.name.split('.');
    var extensionArchivo = nombreCortado[nombreCortado.length - 1];

    // solo estas extesiones aceptamos
    var etensionesValidad = ['png', 'jpg', 'jpeg', 'gif'];
    if(etensionesValidad.indexOf(extensionArchivo) < 0) {
        return res.status(400).json({
            ok: false,
            mensaje: 'Etension no valida',
            errors: { message: 'las extensiones validas' }
        });
    }

    // nombre de archivo personalizado
    var nombreArchivo = `${ id }-${ new Date().getMilliseconds() }.${ extensionArchivo }`;
    // mover el archivo del tempral a un path
    var path = `./uploads/${ tipo }/${nombreArchivo}`;
    archivo.mv(path, (err) => {
        if(err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al mover el archivo',
                errors: err
            });
        }
        subirPorTipo(tipo, id, nombreArchivo, res);
        // res.status(200).json({
        //     ok: true,
        //     mensaje: 'Archivo Movido'
        // })
    })
    
});

function subirPorTipo(tipo, id, nombreArchivo, res) {
    if(tipo === 'usuarios') {
        Usuario.findById(id, (err, usuario) => {
            if(!usuario) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Usuario no eiste',
                    errors: err
                });
            }

            var pathViejo = './uploads/usuarios/' + usuario.img;

            // elimina path viejo
            if(fs.existsSync(pathViejo)) {
                fs.unlinkSync(pathViejo);
            }
            usuario.img = nombreArchivo;
            usuario.save((err, usuarioActualizado) => {
                usuarioActualizado.password = ':)';
                return res.status(200).json({
                    ok: true,
                    mensaje: 'Imagen de usuario actualizado',
                    usuario: usuarioActualizado
                    });
            });
        });
    }
    if(tipo === 'medicos') {
        Medico.findById(id, (err, medico) => {
            if(!medico) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'medico no eiste',
                    errors: err
                });
            }

            var pathViejo = './uploads/medicos/' + medico.img;

            // elimina path viejo
            if(fs.existsSync(pathViejo)) {
                fs.unlinkSync(pathViejo);
            }
            medico.img = nombreArchivo;
            medico.save((err, medicoActualizado) => {
                return res.status(200).json({
                    ok: true,
                    mensaje: 'Imagen de medico actualizado',
                    medico: medicoActualizado
                    });
            });
        });
    }
    if(tipo === 'hospitales') {
        Hospital.findById(id, (err, hospital) => {
            if(!hospital) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'hospital no eiste',
                    errors: err
                });
            }

            var pathViejo = './uploads/hospitales/' + hospital.img;

            // elimina path viejo
            if(fs.existsSync(pathViejo)) {
                fs.unlinkSync(pathViejo);
            }
            hospital.img = nombreArchivo;
            hospital.save((err, hospitalActualizado) => {
                return res.status(200).json({
                    ok: true,
                    mensaje: 'Imagen de hospital actualizado',
                    hospital: hospitalActualizado
                    });
            });
        });
        
    }
}
module.exports = app;