const { Router } = require('express');
const express = require('express');
const router = express.Router();
const ProductController = require('./../controllers/ProductController');
const AuthController = require('./../controllers/AuthenticationController');

router
    .route('/')
    .get(AuthController.protect, ProductController.getAllProducts)
    .post(ProductController.CreateProduct);

router
    .route('/getTourStats')
    .get(ProductController.getProductStats);
    
router
    .route('/:id')
    .get(ProductController.getProduct)
    .patch(ProductController.UpdateProduct)
    .delete(AuthController.protect, AuthController.restrict('admin'), ProductController.DeleteProduct);

module.exports = router;