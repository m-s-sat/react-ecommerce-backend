const { Brand } = require("../model/Brand")

exports.fetchBrands = async(req,res)=>{
    try{
        const brands = await Brand.find({}).exec();
        res.status(200).json(brands);
    }
    catch(err){
        res.status(400).json(err);
    }
}
exports.createBrand = (req,res)=>{
    const product = new Brand(req.body);
    product.save().then((doc)=>{
        console.log(doc)
        res.status(201).json(doc);
    }).catch((err)=>{
        console.log(err);
        res.status(400).json(err);
    });
}