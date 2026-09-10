const express = require('express');
require('dotenv').config();
const productosRoutes = require('./src/routes/productos.routes');
const categoriasRoutes = require('./src/routes/categorias.routes');
const cajerosRoutes = require('./src/routes/cajeros.routes');
const ventaRoutes = require('./src/routes/ventas.routes');

const app = express();
const port = 3000;

app.use(express.json());

app.use('/api/productos', productosRoutes);
app.use('/api/categorias', categoriasRoutes);
app.use('/api/cajeros', cajerosRoutes);
app.use('/api/ventas', ventaRoutes);

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});