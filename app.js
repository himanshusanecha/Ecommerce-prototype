const express = require('express');
const app = express();
app.use(express.json());
const ProductRouter = require('./routes/ProductRoutes');
const UserRouter = require('./routes/UserRoutes');
const globalErrorHandler = require('./controllers/ErrorController');
const Apperror = require('./utils/Apperror');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const hpp = require('hpp');

const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const limiter = rateLimit({ //this is a middleware function
    //ratelimit is a function where we need to set some option basically that just limit our request
    //first key value pair in this object is max it means maximum number of request from a single IP
    //second key value pair is the max window means from the same ip only 100 requests can be made in an hour
    max: 100, 
    windowMs: 60*60*1000, //60 is minutes than another 60 is seconds and 1000 is used to convert seconds to milliseconds
    message: 'Too many request from this IP, please try again in an hour'
});
app.use(helmet()); //for security setting http headers
app.use('/users',limiter); //using limiter for every user route
app.use('/products',limiter); //using limiter for every products route
app.use('/users',UserRouter);
app.use('/products',ProductRouter);
app.use(express.json({ limit: '10kb'})); //this means that any req body will not be larger than 10kb

app.use(mongoSanitize()); //for protecting against nosql injection
app.use(xss()); //prevent from malicious html code
app.use(hpp()); //for parameter pollution
//perfect place for doing santization
///data santization against nosql query injection and also against cross site scrypting attack


app.all('*', (req,res,next) => { //inside this we are creating an error using Apperror class 
    //and using next function so that global error handler can catch it
    next(new Apperror("Cant find " + req.originalUrl + "on this server", 404));
});

//here we are using the imported global handler function from errorController.js file
app.use(globalErrorHandler);


//we will use express rate limiter package to limit responses 
module.exports = app;