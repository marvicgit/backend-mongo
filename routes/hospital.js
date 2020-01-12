var express = require('express');
var app = express();
var bcrypt = require('bcryptjs');
var Hospital = require('../models/hospital');
var jwt = require('jsonwebtoken');
var mdAutenticacion = require('../middlewares/autentication');

// ===========================================
// Obtener todos los hositales
// ===========================================
app.get('/', (req, res, next) => {
    var desde = req.query.desde || 0;
    desde = Number(desde);
    Hospital.find({})
    .skip(desde)
    .limit(5)
    .populate('usuario', 'nombre id')
    .exec((err, hospitales) => {
        if(err){
            return res.status(500).json({
                ok: false,
                mensaje: 'Error cargando hospitales',
                errors: err
            })
        } 
        Hospital.count({}, (err, conteo) => {
            return res.status(200).json({
                ok: true,
                hospitales: hospitales,
                total: conteo
            });
        })
    })
});

// ==========================================
// Obtener Hospital por ID
// ==========================================
app.get('/:id', (req, res) => {
    var id = req.params.id;
    Hospital.findById(id)
        .populate('usuario', 'nombre img email')
        .exec((err, hospital) => {
            if (err) {
                return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar hospital',
                errors: err
                });
            }
            if (!hospital) {
                return res.status(400).json({
                ok: false,
                mensaje: 'El hospital con el id ' + id + 'no existe',
                errors: { message: 'No existe un hospital con ese ID' }
                });
            }
            res.status(200).json({
            ok: true,
            hospital: hospital
        });
    });
})
// ===========================================
// Crear nuevo hospital
// ===========================================
app.post('/', mdAutenticacion.verificaToken, (req, res) => {
    var body = req.body;
    var hospital = new Hospital({
        nombre: body.nombre,
        usuario: req.usuario._id
    });

    hospital.save((err, hospitalSave) => {
        if(err){
            return res.status(400).json({
                ok: false,
                mensaje: 'Error al crear hospitales',
                errors: err
            });
        } 

        return res.status(201).json({
            ok: true,
            body: hospitalSave
        });
    });
    
});
// ===========================================
// Actualiza hospital
// ===========================================
app.put('/:id', mdAutenticacion.verificaToken, (req, res) => {
    var id = req.params.id;
    var body = req.body;
    Hospital.findById(id, (err, hospital) => {
        if(err){
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar hospital',
                errors: err
            });
        } 
        if(!hospital){
            return res.status(400).json({
                ok: false,
                mensaje: 'El hospital con el id especificado no eiste',
                errors: { message: 'No existe hospital cn ese ID' }
            });
        } 

        hospital.nombre = body.nombre;
        hospital.usuario = req.usuario._id;

        hospital.save((err, hospitalSave) => {
            if(err){
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error al actualizar hospital',
                    errors: err
                });
            } 
            return res.status(200).json({
                ok: true,
                body: hospitalSave
            });
        })

    });
});
// ===========================================
// Borrar hospital por ID
// ===========================================
app.delete('/:id', mdAutenticacion.verificaToken, (req, res) => {
    var id = req.params.id;
    Hospital.findByIdAndRemove(id, (err, hospitalDelete) => {
        if(err){
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al borrar hospital',
                errors: err
            });
        } 
        return res.status(200).json({
            ok: true,
            hospital: hospitalDelete
        });
    })
});

module.exports = app;