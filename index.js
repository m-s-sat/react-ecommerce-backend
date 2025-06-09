require('dotenv').config();
const express = require('express');
const server = express();
const mongoose = require('mongoose');
const productRouters = require('./routes/Products');
const categoriesRouter = require('./routes/Category');
const brandsRouter = require('./routes/Brand');

const port = process.env.PORT;

server.use(express.json());
server.use('/products', productRouters.router);
server.use('/categories',categoriesRouter.router);
server.use('/brands',brandsRouter.router);

async function main(){
    mongoose.connect('mongodb://127.0.0.1:27017/ecommerce-full-stack-databaase');
}
main().then(()=>{
    console.log("mongodb connected");
}).catch((err)=>{
    console.log(err.message);
})

server.get('/',(req,res)=>{
    res.status(200).json("success")
})


server.listen(port,()=>{
    console.log(`server statred at ${port} port`)
})