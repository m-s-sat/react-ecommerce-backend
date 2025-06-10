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
exports.createCategory = (req,res)=>{
    const product = new Category(req.body);
    product.save().then((doc)=>{
        console.log(doc)
        res.status(201).json(doc);
    }).catch((err)=>{
        console.log(err);
        res.status(400).json(err);
    });
}