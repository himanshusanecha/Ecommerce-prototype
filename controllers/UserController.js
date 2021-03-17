const User = require('./../models/usermodel');

exports.getAllusers = async (req,res) => {
    try{
        const users = await User.find();
    }
    catch(err)
    {
        console.log(err);
    }
}
exports.CreateUser = async (req,res) => {
    try{
        const newUser = await User.create(req.body);
    }
    catch(err)
    {
        console.log(err);
    }
}
exports.getUser = async (req,res) => {
    try{
        const user = await User.findById(req.params.id);
    }
    catch(err)
    {
        console.log(err);
    }
}
exports.UpdateUser = async (req,res) => {
    try{
        const user = await User.findByIdAndUpdate(req.params.id,req.body, {
            new:true
        });
    }
    catch(err)
    {
        console.log(err);
    }
}
exports.DeleteUser = async (req,res) => {
    try{
        await User.findByIdAndDelete(req.params.id);
    }
    catch(err)
    {
        console.log(err);
    }
}
