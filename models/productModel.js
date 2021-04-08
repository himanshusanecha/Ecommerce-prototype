const mongoose = require('mongoose');
const { Db } = require('mongodb');
const path = require('path');
mongoose.connect("mongodb://localhost:27017/Ecommerce",{
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: true
}).then(con => {
    console.log("connection successful");
});
const ProductSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    processor: {
        type: String,
        required: true
    },
    ScreenSize: {
        type: String,
        required: true
    },
    Harddisk: {
        type: String,
        required: true
    },
    GraphicCard: {
        type: String,
        required: true
    },
    Price: {
        type: Number,
        required: true
    },
    ratingsAverage: {
        type: Number,
        default: 4.5,
        min: [1, 'cannot be less than 1'],
        max: 5
    },
    ratingsQuantity: {
        type: Number,
        default: 0
    },
    priceDiscount: {
        type: Number,
        default: 0
    },
    Summary: {
        type: String,
        trim: true,
        required : true
    },
    description: {
        type: String,
        trim: true
    },
    ImageCover: {
        type: String,
        required: true
    },
    images: [String],
    createdAt: {
        type: Date,
        default: Date.now()
    }
});

const product = mongoose.model('Product',ProductSchema);

//now we have created our model in separate file therefore we have to export it

module.exports = product;