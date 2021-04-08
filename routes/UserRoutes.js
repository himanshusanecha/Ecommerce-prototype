const { Router } = require('express');
const express = require('express');
const router = express.Router();
const UserController = require('./../controllers/UserController');
const AuthController = require('./../controllers/AuthenticationController');
router.post('/signup', AuthController.signup); //this does not follow
//rest API structure and hence this end point is different 
//this route is different because here we only want to post the data and not get anything from it

router.post('/login', AuthController.login);

router.post('/forgotpassword', AuthController.forgotPassword); //will recieve the email address as a parameter
router.patch('/resetpassword/:token', AuthController.resetPassword); //will recieve the token as well as the new password

router.patch('/updatepassword',AuthController.protect, AuthController.updatePassword);
router.delete('/deleteMe',AuthController.protect, UserController.deleteMe);
router.patch('/updateMe', AuthController.protect, UserController.updateMe);
//the below routes and functions are generally used by admin to update the user get all users data 
//update existing user etc etc
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