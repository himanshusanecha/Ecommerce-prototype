const { Router } = require('express');
const express = require('express');
const router = express.Router();
const UserController = require('./../controllers/UserController');

router
    .route('/')
    .get(UserController.getAllusers)
    .post(UserController.CreateUser);

router
    .route('/:id')
    .get(UserController.getUser)
    .patch(UserController.UpdateUser)
    .delete(UserController.DeleteUser)

module.exports = router;