const express = require('express');
require('dotenv').config();
const productosRoutes = require('./src/routes/productos.routes');
const categoriasRoutes = require('./src/routes/categorias.routes');
const cajerosRoutes = require('./src/routes/cajeros.routes');
const ventasRoutes = require('./src/routes/ventas.router');

const app = express();
const PORT =
    process.env.PORT || 3000;

app.use(express.json());

app.use('/api', categoriasRoutes);
app.use('/api', productosRoutes);
app.use('/api', cajerosRoutes);
app.use('/api', ventasRoutes);
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});