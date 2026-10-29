const {
    Router
} = require('express');

const {
    realizarVenta,
    getVentas,
    getVentaById
} = require('../controllers/ventas.controller');

const router = Router();

router.get('/', getVentas);
router.get('/:id', getVentaById);

router.post(
    '/',
    realizarVenta
);

module.exports = router;