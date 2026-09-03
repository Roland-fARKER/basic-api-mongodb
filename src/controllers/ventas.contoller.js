const {
    conectarDB,
    client
} = require('../config/database');

const {
    ObjectId
} = require('mongodb');

const realizarVenta = async (req, res) => {

    const session = client.startSession();

    try {

        session.startTransaction();

        const db = await conectarDB();

        const {
            productoId,
            cantidad
        } = req.body;

        if (
            !ObjectId.isValid(productoId) ||
            !cantidad ||
            cantidad <= 0
        ) {

            await session.abortTransaction();
            session.endSession();

            return res.status(400).json({
                error: 'Datos de venta inválidos'
            });
        }

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

        if (producto.stock < cantidad) {

            await session.abortTransaction();
            session.endSession();

            return res.status(400).json({
                error: `Stock insuficiente. Disponible: ${producto.stock}`
            });
        }

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

        const nuevaVenta = {

            productoId:
                new ObjectId(productoId),

            nombreProducto:
                producto.nombre,

            cantidadVendida:
                cantidad,

            precioUnitario:
                producto.precio,

            total:
                producto.precio * cantidad,

            fecha:
                new Date()
        };

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

module.exports = {
    realizarVenta
};
