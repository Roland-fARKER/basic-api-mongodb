const {
    Router
} = require('express');

const {
    realizarVenta
} = require('../controllers/ventas.controller');

const router = Router();

router.post(
    '/',
    realizarVenta
);

module.exports = router;