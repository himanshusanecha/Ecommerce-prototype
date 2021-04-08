const mongoose = require('mongoose');
const { Db } = require('mongodb');
const path = require('path');
const validator = require('validator');
const bcrypt = require('bcryptjs');
mongoose.connect("mongodb://localhost:27017/Ecommerce",{
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: true
}).then(con => {
    console.log("connection successful");

});
const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please tell your name']
    },
    email: {
        type: String,
        required: [true, 'Please provide your mail'],
        unique: true,
        lowercase: true, //transforms the email to lowercase
        validate: [validator.isEmail],
    },
    photo: String,
    password: {
        type: String,
        required: [true, 'Provide a password'],
        minlength: [8, 'Length should be 8 minimum'],
        select: false
    }, 
    passwordConfirm: {
        type: String,
        required: [true, 'Provide confirm your password'],
        validate: {
            validator: function(el){
                return el == this.password; //el refers to the confirmPassword value
                //this validation will only work on create and save 
                 //and not on updating the user etc

            },
            message: "Password are not same"
            //in the above validator we just have to specify a callback function that will return true or false boolean value
            //true when password = confirmpassword
            //else it will return false
        },
        select: false
    },
    passwordChangedAt: Date, //this passwordChangedAt key value pair only contains the date when password is changed
    //for user who didnt changed password this field remains empty
    role: {
        type: String,
        enum: ['admin','user'],
        default: 'user'
    },
    passwordResetToken: String,
    passwordResetExpires: Date, //reset token will expire after sometime due to certain security reasons
    active: {
        type: Boolean,
        default: true,
        select: false
    }
});

userSchema.pre('save',async function(next) {
    if(!this.isModified('password'))
    {//if the password is not modified go to the next middleware and if no middleware exist than execute the function before which this middleware is executed
        return next();
    } 
    else
    {
        this.password = await bcrypt.hash(this.password, 12);//12 is the cost parameter
        this.passwordConfirm = undefined; // we are setting passwordConfirm to just validate our user's password and data persistance should not happen therefore we are setting passwordConfirm to undefined
        //after the user has confirm his/her password we really dont need passwordConfirm field

    }//isModified is a method to check if the specified thing has been modified or not
    //password is the thing that we want to check if it has been modified or nor
    next();
}) //document middleware
const user = mongoose.model('User',userSchema);

userSchema.pre('find',async function(next){ //middleware function that is to be triggered for every find query that is to be executed
    //this middleware will take care that any find query that is executed on user model will go through this middleware and if the inactive is set to false than that user will not be returned in the find query
    this.find({ active: { $ne: false }}); //this means we are only finding documents where active is set to true
    next();
})
//now we have created our model in separate file therefore we have to export it
module.exports = user;