const express = require('express');
const app = express();
app.use(express.json());
const ProductRouter = require('./routes/ProductRoutes');
const UserRouter = require('./routes/UserRoutes');

app.use('/users',UserRouter);
app.use('/products',ProductRouter);

module.exports = app;