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
const joinSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    }
});

const user = mongoose.model('User',joinSchema);

//now we have created our model in separate file therefore we have to export it

module.exports = user;