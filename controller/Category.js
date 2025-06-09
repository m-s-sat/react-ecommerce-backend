const { Category } = require("../model/Category")

exports.fetchCategories = async(req,res)=>{
    try{
        const categories = await Category.find({}).exec();
        res.status(200).json(categories);
    }
    catch(err){
        res.status(400).json(err);
    }
}