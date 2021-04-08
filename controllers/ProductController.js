const Product = require('./../models/productModel');
const path = require('path');
const { setFlagsFromString } = require('v8');

const APIfeatures = require('./../utils/APIfeatures');
const catchAsync = require('./../utils/catchAsync');
const Apperror = require('../utils/Apperror');

exports.getAllProducts = catchAsync(async (req,res,next) => {
    const features = new APIfeatures(Product.find(),req.query)
    .filter()
    .sorting()
    .paginate()
    .limitFields();

//console.log(features);
const data = await features.query;
res.status(200).json({
    data
});
});
exports.CreateProduct = catchAsync(async (req,res,next) => {
    const product = await Product.create(req.body);
        //this product variable would be used while rendering json data and webpage
        //code to render the website with newly created product
        res.status(200).json({
            product
        }); 
});
exports.getProduct = catchAsync(async (req,res,next) => {
        var product = await Product.findById(req.params.id);
        console.log(product);
        if(product==null) //!null = true
        {
           return next(new Apperror('No tour found with that ID', 404)); //we have used return here so that the tour does not return two responses
            //two responses here will be 
            //1. the error response
           //2. the null value response if we do not use return
       }
            res.status(200).json({
                product
            })
        });
    

exports.UpdateProduct = catchAsync(async (req,res,next) => {
        const product = await Product.findByIdAndUpdate(req.params.id,req.body, {
            new: true,
            runValidators: true
        });
        if(product==null) //!null = true
        {
           return next(new Apperror('No tour found with that ID', 404)); //we have used return here so that the tour does not return two responses
            //two responses here will be 
            //1. the error response
           //2. the null value response if we do not use return
       }
        res.status(200).json({
            product
        })
    });
exports.DeleteProduct = catchAsync(async (req,res,next) => {
        const product = await Product.findByIdAndDelete(req.params.id);
        if(product==null) //!null = true
        {
           return next(new Apperror('No tour found with that ID', 404)); //we have used return here so that the tour does not return two responses
            //two responses here will be 
            //1. the error response
           //2. the null value response if we do not use return
       }
       res.send('deleted');
});

exports.getProductStats = catchAsync(async (req,res,next) => {
        const stats = await Product.aggregate([
            {
                $match: { ratingsAverage: {$gte: 4.5}}
            },
            {
                $group: {
                    _id:null,
                    num: {$sum: 1},
                    numratings: {$sum: '$ratingsAverage'},
                    avgrating: {$avg: '$ratingsAverage'},
                    avgprice: {$avg: '$Price'},
                    minprice: {$min: '$Price'},
                    maxprice: {$max: '$Price'}
                }
            },
            {
                $sort: {avgprice: 1}
            }
        ]);
        res.status(200).json({
            stats
        })
    });
