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
            cantidad
        } = req.body;

        // Validaciones básicas
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

module.exports = {
    realizarVenta
}; 