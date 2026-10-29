const {
    conectarDB,
    client
} = require('../config/database');

const {
    ObjectId
} = require('mongodb');

const realizarVenta = async (req, res) => {

    // 1. INICIAR SESIÓN
    const session = client.startSession();

    try {

        // 2. INICIAR TRANSACCIÓN
        session.startTransaction();

        const db = await conectarDB();

        const {
            productoId,
            cajeroId,
            cantidad
        } = req.body;

        // Validaciones básicas
        if (
            !ObjectId.isValid(productoId) ||
            (cajeroId && !ObjectId.isValid(cajeroId)) ||
            !cantidad ||
            cantidad <= 0
        ) {

            await session.abortTransaction();
            session.endSession();

            return res.status(400).json({
                error: 'Datos de venta inválidos'
            });
        }

        // 3. BUSCAR PRODUCTO
        const producto = await db
            .collection('productos')
            .findOne(
                {
                    _id: new ObjectId(productoId)
                },
                {
                    session
                }
            );

        if (!producto) {

            await session.abortTransaction();
            session.endSession();

            return res.status(404).json({
                error: 'Producto no encontrado'
            });
        }

        // Validar stock disponible
        if (producto.stock < cantidad) {

            await session.abortTransaction();
            session.endSession();

            return res.status(400).json({
                error: `Stock insuficiente. Disponible: ${producto.stock}`
            });
        }

        // 4. ACTUALIZAR STOCK
        await db
            .collection('productos')
            .updateOne(
                {
                    _id: new ObjectId(productoId)
                },
                {
                    $inc: {
                        stock: -cantidad
                    }
                },
                {
                    session
                }
            );

        // 5. CREAR DOCUMENTO DE VENTA
        const nuevaVenta = {

            productoId:
                new ObjectId(productoId),

            nombreProducto:
                producto.nombre,

            cajeroId:
                cajeroId ? new ObjectId(cajeroId) : null,

            cantidadVendida:
                cantidad,

            precioUnitario:
                producto.precio,

            total:
                producto.precio * cantidad,

            fecha:
                new Date()
        };

        // 6. REGISTRAR LA VENTA
        const resultadoVenta =
            await db
                .collection('ventas')
                .insertOne(
                    nuevaVenta,
                    {
                        session
                    }
                );

        // 7. CONFIRMAR TRANSACCIÓN
        await session.commitTransaction();

        session.endSession();

        return res.status(201).json({

            mensaje:
                '¡Venta registrada con éxito bajo control ACID!',

            ventaId:
                resultadoVenta.insertedId
        });

    } catch (error) {

        // 8. REVERTIR TRANSACCIÓN
        try {

            await session.abortTransaction();

        } catch (abortError) {

            console.error(
                'Error al revertir la transacción:',
                abortError
            );
        }

        session.endSession();

        console.error(
            'Error crítico en la transacción de venta:',
            error
        );

        return res.status(500).json({

            error:
                'Error al procesar la venta. ' +
                'Transacción revertida automáticamente.'
        });
    }
};

const getVentas = async (req, res) => {
    try {
        const db = await conectarDB();

        const ventas = await db
            .collection('ventas')
            .find()
            .toArray();

        res.json(ventas);

    } catch (error) {
        console.error('Error fetching ventas:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

const getVentaById = async (req, res) => {
    try {
        const db = await conectarDB();
        const { id } = req.params;

        if (!ObjectId.isValid(id)) {
            return res.status(400).json({ error: 'ID inválido' });
        }

        const venta = await db
            .collection('ventas')
            .findOne({ _id: new ObjectId(id) });

        if (!venta) return res.status(404).json({ error: 'Venta not found' });

        res.json(venta);

    } catch (error) {
        console.error('Error fetching venta by ID:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

module.exports = {
    realizarVenta,
    getVentas,
    getVentaById
}; 