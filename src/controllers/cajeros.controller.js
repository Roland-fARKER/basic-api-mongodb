const {conectarDB} = require('../config/database');
const {ObjectId}= require('mongodb');

const new_cajeros=[
    {
        Nombre:'Ana',
        Apellido:'Chavez',
        estado:true

    },
    {
        Nombre:'Pedro',
        Apellido:'Garcia',
        estado:true
    },
    {
        Nombre:'Rosa',
        Apellido:'Lopez',
        estado:true

    }
];

const canew_bulk = async(req, res)=> {
    try{
        const db = await conectarDB();

        const cajeros = await 
        db.collection('cajeros').insertMany(new_cajeros);
        res.json(cajeros);
    }
    catch(error){
        console.error('Error fetching cajeros:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}

const getCajeros = async(req,res)=>{
    try{
        const db = await conectarDB();
        const cajeros = await
        db.collection('cajeros').find().toArray();
        res.json(cajeros);

    }
    catch(error){
        console.error('Error fetching cajeros:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

const getCajerosById = async (req, res) => {
    try{

        const db = await conectarDB();
        const { id } = req.params;

        const cajero = await 
            db.collection('cajeros').findOne({ _id: new ObjectId(id) });

        if (!cajero) return res.status(404).json({ error: 'Cajero not found' });
        res.json(cajero);

    } catch (error) {
        console.error('Error fetching cajero by ID:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}

const createCajero = async (req, res) => {
    try {
        const db = await conectarDB();
        const newCajero = req.body; 

        const result = await 
        db.collection('cajeros').insertOne(newCajero);

        res.status(201).json({ message: 'Cajero created', id: result.insertedId });
    }catch (error) {
        console.error('Error creating cajero:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}

const createCajeros = async (req, res) => {
    try{
        const db = await conectarDB();
        const newCajeros = req.body; 
        if (!Array.isArray(newCajeros) || newCajeros.length === 0) {
            return res.status(400).json({ error: 'Invalid input. Expected an array of cajeros.' });
        }

        const result = await 
            db.collection('cajeros').insertMany(newCajeros);
        res.status(201).json({ message: 'Cajeros created', ids: result.insertedIds });

    }catch (error) {
        console.error('Error creating cajeros:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}

const updateCajeros = async (req, res) => {
    try{
        const db = await conectarDB();
        const { id } = req.params;
        
        const result = await 
            db.collection('cajeros').updateOne(
                { _id: new ObjectId(id) },
                { $set: req.body }
            );
        
        if (result.matchedCount === 0) return res.status(404).json({ error: 'Cajero not found' });
        
        res.json({ message: 'Cajero updated' });

    }catch (error) {
        console.error('Error updating cajero:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}

const deleteCajeros = async (req, res) => {
    try{
        const db = await conectarDB();
        const { id } = req.params;
        
        //SINTAXIS PARA ELIMINAR UN PRODUCTO POR SU ID(MONGO)
        const result = await 
            db.collection('cajeros').deleteOne({ _id: new ObjectId(id) });

        if (result.deletedCount === 0) return res.status(404).json({ error: 'Cajero not found' });

        res.json({ message: 'Cajero deleted' });

    }catch (error) {
        console.error('Error deleting cajero:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}

module.exports = { 
    getCajeros,
    getCajerosById,
    createCajero,
    createCajeros,
    updateCajeros,
    deleteCajeros,
    canew_bulk

};