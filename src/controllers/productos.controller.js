const { conectarDB } = require('../config/database');
const { ObjectId } = require('mongodb');

const  new_product=[
    {
        nombre:'caramelo',precio : 5 , categoria:'dulce', stock: 100
    },

    {
        nombre:'manzana',precio : 20 , categoria:'fruta', stock: 50
    },

    {
        nombre:'zapato',precio : 500 , categoria:'calzado', stock: 10
    }

];

const new_bulk = async(req, res)=> {
    try{
        const db = await conectarDB();

        const productos = await 
        db.collection('productos').insertMany(new_product);
        res.json(productos);
    }
    catch(error){
        console.error('Error fetching productos:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}
const getProductos = async (req, res) => {
    try {
        //ESPERAMOS CONECTARNOS A MONGODB Y OBTENER LA BASE DE DATOS
        const db = await conectarDB();

        const productos = await 
        //SINTAXIS PARA OBTENER TODOS LOS PRODUCTOS DE LA COLECCIÓN "productos"
        db.collection('productos').find().toArray();
        //RETORNAMOS LOS PRODUCTOS EN FORMATO JSON(JS)
        res.json(productos);

    } catch (error) {
        console.error('Error fetching productos:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};


const getProductoById = async (req, res) => {
    try{

        const db = await conectarDB();
        const { id } = req.params;

        //SINTAXIS PARA OBTENER UN PRODUCTO POR SU ID(MONGO)
        const producto = await 
            db.collection('productos').findOne({ _id: new ObjectId(id) });

        //RETORNAMOS EL PRODUCTO EN FORMATO JSON(JS)
        if (!producto) return res.status(404).json({ error: 'Producto not found' });
        res.json(producto);

    } catch (error) {
        console.error('Error fetching producto by ID:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}

const createProducto = async (req, res) => {
    try {
        const db = await conectarDB();
        const newProducto = req.body; //{nombre: 'Producto 1', precio: 100, }

        //SINTAXIS PARA INSERTAR UN NUEVO PRODUCTO EN LA COLECCIÓN "productos"(Mongo)
        const result = await 
        db.collection('productos').insertOne(newProducto);

        //RETORNAMOS UN MENSAJE DE ÉXITO Y EL ID DEL NUEVO PRODUCTO CREADO
        res.status(201).json({ message: 'Producto created', id: result.insertedId });
    }catch (error) {
        console.error('Error creating producto:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}

const createProductos = async (req, res) => {
    try{
        const db = await conectarDB();
        const newProductos = req.body; //[{nombre: 'Producto 1', precio: 100, }, {nombre: 'Producto 2', precio: 200, }]

        if (!Array.isArray(newProductos) || newProductos.length === 0) {
            return res.status(400).json({ error: 'Invalid input. Expected an array of productos.' });
        }

        //SINTAXIS PARA INSERTAR VARIOS PRODUCTOS EN LA COLECCIÓN "productos"(Mongo)
        const result = await 
            db.collection('productos').insertMany(newProductos);
        res.status(201).json({ message: 'Productos created', ids: result.insertedIds });

    }catch (error) {
        console.error('Error creating productos:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}

const updateProducto = async (req, res) => {
    try{
        const db = await conectarDB();
        const { id } = req.params;
        
        //SINTAXIS PARA ACTUALIZAR UN PRODUCTO POR SU ID(MONGO)
        const result = await 
            db.collection('productos').updateOne(
                { _id: new ObjectId(id) },
                { $set: req.body }
            );
        
        if (result.matchedCount === 0) return res.status(404).json({ error: 'Producto not found' });
        
        res.json({ message: 'Producto updated' });

    }catch (error) {
        console.error('Error updating producto:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}

const deleteProducto = async (req, res) => {
    try{
        const db = await conectarDB();
        const { id } = req.params;
        
        //SINTAXIS PARA ELIMINAR UN PRODUCTO POR SU ID(MONGO)
        const result = await 
            db.collection('productos').deleteOne({ _id: new ObjectId(id) });

        if (result.deletedCount === 0) return res.status(404).json({ error: 'Producto not found' });

        res.json({ message: 'Producto deleted' });

    }catch (error) {
        console.error('Error deleting producto:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}

module.exports = { 
    getProductos, 
    getProductoById, 
    createProducto, 
    createProductos, 
    updateProducto, 
    deleteProducto,
    new_bulk
};