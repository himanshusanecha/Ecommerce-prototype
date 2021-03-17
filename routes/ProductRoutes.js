const { Router } = require('express');
const express = require('express');
const router = express.Router();
const ProductController = require('./../controllers/ProductController');
router
    .route('/')
    .get(ProductController.getAllProducts)
    .post(ProductController.CreateProduct);

router
    .route('/:id')
    .get(ProductController.getProduct)
    .patch(ProductController.UpdateProduct)
    .delete(ProductController.DeleteProduct);

module.exports = router;