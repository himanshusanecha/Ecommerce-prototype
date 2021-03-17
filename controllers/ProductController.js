const Product = require('./../models/productModel');
const path = require('path');
exports.getAllProducts = async (req,res) => {
    try{
        const products = await Product.find();
        //code to render all the products in the webpage
        res.status(200).json({
            products
        })
    }
    catch(err)
    {
        console.log(err);
    }
}
exports.CreateProduct = async (req,res) => {
    try 
    {
        const product = await Product.create(req.body);
        //this product variable would be used while rendering json data and webpage
        //code to render the website with newly created product
        res.status(200).json({
            product
        })
    } catch(err) {
        console.log(err);
    }
    
}
exports.getProduct = async (req,res) => {
    try{
        console.log(req.params.id);
        var product;
        Product.findById(req.params.id, function(err, docs){
            if(err)
            {
                console.log(err);
            }
            else
            {
                product = docs;
            }
            res.status(200).json({
                product
            })
        });
      //  console.log(products);
        //code to render single product in a dedicated webpage
      //  res.status(200).json({
          //  product
        //});
    }
    catch(err)
    {
       // console.log(err);
    }
}
exports.UpdateProduct = async (req,res) => {
    try{
        const product = await Product.findByIdAndUpdate(req.params.id,req.body, {
            new: true
        });
        res.status(200).json({
            product
        })
    }
    catch(err)
    {
        console.log(err);
    }
}
exports.DeleteProduct = async (req,res) => {
    try{
        await Product.findByIdAndDelete(req.params.id);
        res.send('deleted');
    }
    catch(err)
    {
        console.log(err);
    }
}
