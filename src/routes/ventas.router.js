const {
    Router
} = require('express');

const {
    realizarVenta
} = require('../controllers/ventas.controller');

const router = Router();

// Procesar una venta
router.post('/',realizarVenta);

module.exports = router;
