const path = require('path');
const Apperror = require('../utils/Apperror');
const user = require('./../models/usermodel');

const filterObj = (obj, ...allowedFields) => {
    //here obj is req.body
    //and allowedFields is an array which now contains the name and email string
    //and now we need to just loop through each element and check if that element exist in our allowedFields or not
    //if it does exist than update its value as specified in the obj i.e req.body
    //and if not than ignore it
    //at the end return an updated obj so that it can be used by findByIdandUpdate to update certain values
    const newObj = {};
    Object.keys(obj).forEach(el => {
        if(allowedFields.includes(el))
        {
            newObj[el] = obj[el];
        }
    })
    return newObj;
}
exports.getAllusers = async (req,res) => {
    try{
        //console.log(req.query);
        const users = await user.find();
        res.status(200).json({
            users
        })
    }
    catch(err)
    {
        console.log(err);
    }
}
exports.CreateUser = async (req,res) => {
    try{
        const newUser = await user.create(req.body);
        res.status(200).json({
            newUser
        })
    }
    catch(err)
    {
        console.log(err);
    }
}
exports.getUser = async (req,res) => {
    try{
        const freshuser = await user.findById(req.params.id);
        res.status(200).json({
            freshuser
        })
    }
    catch(err)
    {
        console.log(err);
    }
}
exports.UpdateUser = async (req,res) => { //this is for admin to update user data
    try{
        const freshuser = await User.findByIdAndUpdate(req.params.id,req.body, {
            new:true,
            runValidators: true
        });
        res.status(200).json({
            freshuser
        })
    }
    catch(err)
    {
        console.log(err);
    }
}
exports.DeleteUser = async (req,res) => {
    try{
        await user.findByIdAndDelete(req.params.id);
        res.send("deleted");
    }
    catch(err)
    {
        console.log(err);
    }
}

exports.updateMe = async(req, res, next) => { //this function is triggered by user to update his or her info

    //1. create an error if user tries to update his password (Although we would not provide any field for password)
    if(req.body.password || req.body.passwordConfirm)
    {
        return next(new Apperror('You cannot update your password from here',404));
    }
    //2. update the user document    
    //here we want the validators to work for the field that is specified by the user
    //but here we cannot use the save method because it will trigger all our validators
    //and as we are not dealing with passwords we can use finByIdandUpdate

    //filtered out the fields that are not allowed to be updated
    const x = filterObj(req.body, 'name', 'email'); //here we are filtering out req.body and we need to keep email and name only because they are the only one that needs to be updated
    //and therefore we specify name and email in our filterObj function
    //later we will specify more fields that are need to be updated such as image etc.
    //than we will specify image string too in the filterObj function

    const updatedUser = await user.findByIdAndUpdate(req.user.id, x, {new: true, runValidators: true});
    //here inside updatedUser we have passed three arguments
    //1. is the user id by which we will search the document
    //2. is the data x that we want to update 
    //and instead of using req.body we are using x as if we use req.body the user can update anything
    //user can even update the reset token, its role and can manipulate certain data
    //therefore we are not using req.body here
    //here we only need to update basically the email and password
    //3. an object having new: true so that after finding and updating it returns the updated document
    //runValidators: true will run validators on the field being updated

    res.status(200).json({
        data: {
            updatedUser
        }
    })
}

exports.deleteMe = async(req,res,next) => {
    //await user.findByIdAndUpdate(req.user.id, {active: false});
    //here we have set the user's active field to inactive and therefore we need only those users whose active: true in our getallusers query or any other query
    //therefore for this we will make a pre query middleware in usermodel.js file 
        res.status(200).json({
        status: 'success',
        data: null
    })
}