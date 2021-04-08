class Apperror extends Error{
    constructor(message, statusCode){
        //message ans status code is passed while creating a new object of Apperror class
    //each time we  create a new object constructor is triggered and called

    super(message); //whenever we inherit from a class we use super to call the parent class's constructor and here super is called and message is passed into the parent constructor because Error class only takes message as its constructor
    this.statusCode = statusCode;
  // console.log(typeof this.statusCode);
    const str = this.statusCode.toString(); //converting number to string to check if it starts with 4 or not
    //if the statuscode starts with 4 than we have a failure else it is internal server error
    if(str.startsWith('4'))
    {
        this.status = "fail";
    }
    else
    {
        this.status = "error";
    }
    //now we will use this Apperror class in order to create all the errors in our application
    //as there will be operational errors too therefore we will create a variable named as isOperational and set it to true
    this.isOperational = true;
    //and we are setting this property so that we can send errors to the client for these operational errors and for other errors too
    //errors like programming errors or bugs in our dependencies will have isOperational set to false
    //error stack is the stack that contains all the info or all the call stack that is originated in the error and we have to preserve it and we dont want this class to be in the stacktrace
    //to access stacktrace we use err.stack
    //to not mention this class in stacktrace we add the following code

    //Error.captureStackTrace(this, this.constructor); 
    //this here refers to the current error and this.constructor specifies the class
    }
};

module.exports = Apperror;