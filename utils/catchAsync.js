const catchAsync = fn => {
        //we need next function here so that error can be handled by global handler middleware
    //async functions return promises and when there is an error inside async function than it basically means that the promise gets rejected
    //so to basically not halt the process we catch the error in catchAsync function and not in createTour or any other method
    //and now we will remove the try and catch block
    return (req,res,next) => {
        fn(req,res,next).catch(next)
    }; 
}

module.exports = catchAsync;