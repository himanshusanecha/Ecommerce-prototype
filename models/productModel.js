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
        required: true
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
    }
});

const product = mongoose.model('Product',ProductSchema);

//now we have created our model in separate file therefore we have to export it

module.exports = product;