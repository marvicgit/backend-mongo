var express = require('express');
var app = express();
var Medico = require('../models/medico');
var jwt = require('jsonwebtoken');
var mdAutenticacion = require('../middlewares/autentication');

// ===========================================
// Obtener todos los medicos
// ===========================================
app.get('/', (req, res, next) => {
    var desde = req.query.desde || 0;
    desde = Number(desde);
    Medico.find({})
    .skip(desde)
    .limit(5)
    .populate('usuario', 'nombre id')
    .populate('hospital')
    .exec((err, medicos) => {
        if(err){
            return res.status(500).json({
                ok: false,
                mensaje: 'Error cargando medicos',
                errors: err
            });
        } 
        Medico.count({}, (err, conteo) => {
            return res.status(200).json({
                ok: true,
                medicos: medicos,
                total: conteo
            });
        });
    })
});
// ===========================================
// Crear nuevo medico
// ===========================================
app.post('/', mdAutenticacion.verificaToken, (req, res) => {
    var body = req.body;
    var medico = new Medico({
        nombre: body.nombre,
        usuario: req.usuario._id,
        hospital: body.hospital
    });

    medico.save((err, medicolSave) => {
        if(err){
            return res.status(400).json({
                ok: false,
                mensaje: 'Error al crear medicos',
                errors: err
            });
        } 

        return res.status(201).json({
            ok: true,
            body: medicolSave
        });
    });
    
});
// ===========================================
// Actualiza medico
// ===========================================
app.put('/:id', mdAutenticacion.verificaToken, (req, res) => {
    var id = req.params.id;
    var body = req.body;
    Medico.findById(id, (err, medico) => {
        if(err){
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar medico',
                errors: err
            });
        } 
        if(!medico){
            return res.status(400).json({
                ok: false,
                mensaje: 'El medico con el id especificado no eiste',
                errors: { message: 'No existe medico cn ese ID' }
            });
        } 

        medico.nombre = body.nombre;
        medico.usuario = req.usuario._id;
        medico.hospital = body.hospital;

        medico.save((err, medicoSave) => {
            if(err){
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error al actualizar medico',
                    errors: err
                });
            } 

            return res.status(200).json({
                ok: true,
                body: medicoSave
            });
        })

    });
});
// ===========================================
// Borrar hospital por ID
// ===========================================
app.delete('/:id', mdAutenticacion.verificaToken, (req, res) => {
    var id = req.params.id;
    Medico.findByIdAndRemove(id, (err, medicoDelete) => {
        if(err){
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al borrar medico',
                errors: err
            });
        } 
        return res.status(200).json({
            ok: true,
            medico: medicoDelete
        });
    })
});

module.exports = app;