const util = require('util');
const jwt = require('jsonwebtoken');
const user = require('./../models/usermodel');
const catchAsync = require('./../utils/catchAsync');
const Apperror = require('./../utils/Apperror');
const bcrypt = require('bcryptjs');
const crypto = require('crypto') //built in module used for creating reset password token
const sendEmail = require('./../utils/email');

const signToken = id => {
    const token = jwt.sign({id},'this-is-a-secret-code-for-my-webapp',{
        expiresIn: "1d"});
            //first argument that is to be passed inside the sign method is the payload
    //payload means all the data that we are going to store inside of the token
    //and in this case we only want the id of the user
    //second argument is the secret and it can be anything but it should be minimum of 32 characters
    //third argument would be the time for which the jsonwebtoken would be valid even if it is correct and after that it would expire
    //now the created would be sent to the client
    
    return token;
    
}
const createSendToken = (user,statusCode,res) => {
    const token = signToken(user._id);

    res.cookie('jwt',token, {
        //first argument is the type of the cookie that we want to send
        //second argument is the data that we want to send
        ///third argument are couple of options that we are gonna send some options 
        expires: new Date(Date.now() + 90*24*60*60*1000), //first option is expires which determines after how many time this cookie would expire or would be deleted
        //here in expires we are setting its value to the current date + 90 days 
        //so the cookie will expire after 90 days from the current date on which user logged in

        secure: true, //this means that cookie will be only sent on secured networks that is https

        httpOnly: true //this means that cookie cannot be modified by the browser by any means in order to prevent cross side scripting attack
    });
    res.status(statusCode).json({
        status: 'success',
        token
    })
}
const CreatePasswordResetToken = function(freshuser) {
    const resetToken = crypto.randomBytes(32).toString('hex'); //32 is the number of characters that we need to specify 
    //it is basically the number of characters that we want in our resetToken string
    //and than we are converting that random 32 characters to hexadecimal using toString function and than we specified hex 
    //we will send this token to the user so that he can use it to create a new password
    //only the user will have access to this token
    //this resetToken will be stored in our database after encrypting it.
    //now we will encrypt the token
     
    freshuser.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex'); 
    //sha256 is an encryption algorithm and we are still using our crypto module
    //than we need to apply this algo to the resetToken therefore we have used update(resetToken) this encrypts our token
    //and than using digest we store it as an hexadecimal 
    //now we will save this token in our database in a new field so that we can compare it with the token that user provides
    //this token will basically expire in 

    freshuser.passwordResetExpires = Date.now() + 10*60*1000;
    //setting the passwordResetExpires to 10 mins from the current date in milliseconds

    return resetToken;
    //we would return the unencrypted token in the mail 
}
const changedPasswordAfter = async function(freshuser, JWTtimestamp){
    //this function is used to check if the user has changed his password or not
    //this function is used to protect the routes
    console.log(freshuser.passwordChangedAt, JWTtimestamp);
    if(freshuser.passwordChangedAt){
        const changedTimeStamp = parseInt(freshuser.passwordChangedAt.getTime() / 1000, 10); //converting our time into seconds because it is in milliseconds and the second argument is the base number
        console.log(freshuser.passwordChangedAt, JWTtimestamp);
        return JWTtimestamp < changedTimeStamp;
    }
   // console.log("hey");
    return false;
};
const correctPassword = async function(candidatePassword, userPassword){
    //as the password is not available using this keyword because we have specified select: false in our password field
    //therefore we have passed two parameters here
    //one is the candidate password that is given by the user at the time of login
    //another one is the encrypted password that we would pass in this function to check for our user

    //this function will return true if both the password are same after encryption of the user password
    return await bcrypt.compare(candidatePassword, userPassword);
};
exports.signup = catchAsync(async (req,res,next) => {
    const newUser = await user.create({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
        passwordConfirm: req.body.passwordConfirm
    });

    createSendToken(newUser,201,res);
});

exports.login = catchAsync(async (req, res, next) => {
    const email = req.body.email;
    const password = req.body.password;
    //now we will check for the email and password in our database
     //first we need to check if email and password exist
     //then if the user exist than check if the password is correct
     //then if everything is correct than send token to client

     if(!email || !password)
     {
        //this is the case where email or password and both are not specified
        //so in this case we have to send an error by creating an error using Apperror that
        //is defined in apperror.js file

        next(new Apperror('Please provide email and passowrd',400));
     }
     const users = await user.findOne({ email }).select('+password');//here we are specifying the parameter by which we have to find the user
     //as we have specified select: false in our password field in usermodel.js file therefore we have to explicitly select
     //the password to verify our user that is logging in
     //and using .select('+password') we select password
     //as this field is by default not selected we have to use + infront of this field while selecting it
    
     //now we will call our correctPassword function here
   //const correct = await user1.correctPassword(password, user.password);

     //instead of using above line to check if the password are matching or not we are basically 
     //specifying it in our if else statement because if our user does not exist than we cannot have user.password and it would
     //cause an unneccessary error 

     //and here in the if condition if the user does not exit than further condition wont be executed 

     //as correctPassword is an instance method it is available on documents and not of the whole schema
     if(!users || !(await correctPassword(password, users.password)))     
     {
         //console.log("hey");
         //this block checks that if user exist or the password are matching or not
         next(new Apperror("Incorrect email or password",401));
     }
     createSendToken(users,200,res);
});

exports.protect = catchAsync(async (req,res,next) => {
    //1. get the token and check if its their
    //to do the above step a common practice is to send a token using http header with the request
    let token;
    if(req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
        //console.log(token);
    }
    if(!token)
    {
        //if there is no token sent with the request than token does not exist and therefore we have to throw an error
        next(new Apperror('You are not logged in',401));
    }
    //2. verify the token 
    //basically we check here if someone manipulated the data or if the token is not expired
    //verify is an asynchronous function and therefore we have to promisify it because it returns promises
    //and for promisifying it we will use a built in module named as util
    const decoded = await util.promisify(jwt.verify)(token, 'this-is-a-secret-code-for-my-webapp');
    //decoded variable will contain the decoded payload in json
    //while creating the token payload we used user id, so therefore the decoded variable would also contain id: userid
    //decoded is an object and it also contains the creation time and expiry date for the payload or user id
    //if someone tries to change payload than an error will occur named as invalid signature handled by catchAsync and errorController.js
    //there can be another error named as expired token this will also be handled by catchAsync and errorcontroller.js
    //or if the user has changed his password and the json web token is still the same so any user can access the product route using old json web token
    //therefore to avoid above situation we implement this step
    //if the user has deleted its user id but the token is still present than we dont want that user to be logged in
    //therefore we have implemented this step
    //3. if verification is successful than check if the user still exist 
    const freshuser = await user.findById(decoded.id); //as we have used id to create the payload in jwt.sign therefore when we decode our jwt web token we can access the id from it
    //this decoded web token also contains creation time and deletion time too
    if(!freshuser)
    {
        //if the user does not exist with the given payload id
        //this block also helps to check if the payload is manipulated than id is also manipulated therefore for that manipulated id we dont have any user
        //therefore null will be returned and stored inside freshuser
        next(new Apperror('User does not exist'));
    }
   // 4. checking if the user's password is changed or not
   if(await changedPasswordAfter(freshuser, decoded.exp)){
       //console.log(decoded.iat);
       //console.log(decoded);
       return next(new Apperror('User recently changed password. Please login again',401));
    }
    
    //grant access
    req.user = freshuser; //putting entire user data on the request
    //if there is no problem in any of the above step than only the getallproducts function will be called
    next();  
});

//here we cannot pass arguments because it is a middleware function
//and we want to pass in the roles
//so for passing arguments we will create a wrapper function to take arguments 
exports.restrict = (...roles) => { //roles is the argument that needs to be passed in our function
    return (req,res,next) => { //but as we cannot directly pass any arguments to middleware function we use this technique
        //roles is an array and we can access roles array here
        //and this is our actual function where we will write logic for our restriction
        //roles will contain admin and inside the if we will be checking if roles array contains the role that is of our current user 
        if(!roles.includes(req.user.role)) //in the just above middleware function or our protect middleware function we have just put our userdata into the req.user therefore we can access role from there. req.user.role gives the value of role of the current user
        return next(new Apperror('you do not have permission to perform this action',403));

        next(); //if the role of the user is present in the roles array than next will lead us to the delete tour route
    }
    
}

exports.forgotPassword = catchAsync(async (req,res,next) => {
    //1. get user based on posted email
    const freshuser = await user.findOne( {email: req.body.email} );
    if(!freshuser)
    {
        //if user does not exist than we create this error
        return next(new Apperror('No user with this email address',404));
    }

    //2. generate random reset token (or number)
    const resetToken = CreatePasswordResetToken(freshuser);
    console.log(resetToken);
    await freshuser.save({ validateBeforeSave: false}); //in the above functiion that is creating reset token and modifying and saving it in our database we are actually using
    //post request and post request on a user route requires all the other data such as email password etc. etc. all that things that are required
    //and we our just modifying our database. therefore we have to explicitky specify and save the user
    //and while saving it we have to use a parameter named as validateBeforeSave and set it to false so that no validators are working and required parameter also not works while modifying our data

    //3. send the token as an email
    //here we are creatimg a url where user can go and reset its password
    const resetURL = req.protocol + "://" + req.get('host') +"/users/resetpassword/" + resetToken;
    //req.get('host') here means the host. in our local pc it is 127.0.0.1:8080 

    const message = "Forgot your password submit a patch request with your new password and passwordConfirm through the resetURL " + resetURL + "\n Please ignore this password if you didnt requested for reset password."
    //if the sendEmail function error occurs than we need to send response of error as well as we need to reset the token and also the password reset expires values in our database
    //so we need to add try catch block here to simply do this because global error handling system would not do this
    try{
        await sendEmail({
            email: freshuser.email, //options of sendEmail
            subject: 'Password reset',
            message
        });
    }
    catch{
        freshuser.passwordResetToken = undefined;
        freshuser.passwordResetExpires = undefined;
        await freshuser.save({ validateBeforeSave: false});
        res.status(500).json({
            status: "fail",
            message: "error occured please try again after sometime"
        });
    }

    res.status(200).json({
        status: "success",
        message: "token sent to the email"
    })
})

exports.resetPassword = catchAsync(async (req,res,next) => {
    //1. get user based on the token
    //as we will get the token in an unencrypted form than we will encrypt it and find the user based on the encrypted user
    const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex'); //as we have to encrypt the token coming from our url therefore we are encrypting it 
    //and storing it in hashedToken and than we will compare this hashedToken to the passwordResetToken
    //finding user based on hashedToken vlue
    const freshuser = await user.findOne({passwordResetToken: hashedToken});
    //2. if token has not expired and user does exist based on the token then set the new password
    if(!freshuser)
    {
        return next(new Apperror('Invalid token',404));
    }
    else if(Date.now() > freshuser.passwordResetExpires)
    {
        return next(new Apperror('Password reset URL expired',400));
    }
    freshuser.password = req.body.password;
    freshuser.passwordConfirm = req.body.passwordConfirm;
    freshuser.passwordResetToken = undefined;
    freshuser.passwordResetExpires = undefined;

    //Everything related to passwords and to the user we use .save() instead of .update() because .update() dont run validators

    //3. update changedPasswordAt property for the current user
    freshuser.passwordChangedAt = Date.now();
    await freshuser.save(); //here we dont need to use validateBeforeSave key value pair because we need the validators to work
    //4.log the user in, send the jwt token
    createSendToken(freshuser,200,res);
});

exports.updatePassword = catchAsync(async(req, res, next) => {
    //only available for logged in user but we want user to type the password again just for security

    //1. we need to get user from collection
    console.log(req.body.oldpassword);
    console.log(req.user);
 //   console.log(freshuser.password);
    const freshuser = await user.findById(req.user.id).select('+password');
    //here we cannot use findbyidandupdate method because this way our validators wont work
    //never use findbyidandupdate for anything related to passwords
    //and also the middlewares wont work

    //2. check if posted password is correct

    console.log(await correctPassword(req.body.oldpassword, freshuser.password));
    if(!(await correctPassword(req.body.oldpassword, freshuser.password)))
    {
        return next(new Apperror('Current password was not accurate',404));
    }
    //3. if the password is correct than update the password
    freshuser.password = req.body.password;
    freshuser.passwordConfirm = req.body.passwordConfirm;
    await freshuser.save();
    //4. log the user in
    createSendToken(freshuser,200,res);
})

