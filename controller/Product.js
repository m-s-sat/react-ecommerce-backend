const { Product } = require("../model/Product")

exports.createProduct = (req,res)=>{
    const product = new Product(req.body);
    product.save().then((doc)=>{
        console.log(doc)
        res.status(201).json(doc);
    }).catch((err)=>{
        console.log(err);
        res.status(400).json(err);
    });
}
exports.fetchAllProducts = async(req,res)=>{
    let query = Product.find({});
    let totalProductsQuery = Product.find({});
    if(req.query.category){
        query = await query.find({category:req.query.category});
        totalDocs = await query.find({category:req.query.category});
    }
    if(req.query.brand){
        query = await query.find({brand:req.query.brand});
        totalDocs = await query.find({brand:req.query.brand});
    }
    if(req.query._sort && req.query._order){
        query = await query.sort({[req.query._sort]:req.query._order});
    }
    const totalDocs = await totalProductsQuery.countDocuments().exec();
    if(req.query._page && req.query._limit){
        const pageSize = req.query._limit;
        const page = req.query._page;
        query = query.skip(pageSize*(page-1)).limit(pageSize);
    }
    try{
        const docs = await query.exec();
        res.set('X-Total-Count',totalDocs);
        res.status(200).json(docs);
    }
    catch(err){
        res.status(400).json(err);
    }
}
exports.fetchProductsById = async(req,res)=>{
    const {id} = req.params;
    try{
        const product = await Product.findById(id);
        res.status(200).json(product);
    }
    catch(err){
        res.status(400).json(err);
    }
}
exports.updateProduct = async(req,res)=>{
    const {id} = req.params;
    try{
        const product = await Product.findByIdAndUpdate(id,req.body,{new: true});
        res.status(200).json(product)
    }
    catch(err){
        res.status(400).json(err);
    }
}