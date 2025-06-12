require('dotenv').config();
const express = require('express');
const server = express();
const mongoose = require('mongoose');
const productRouters = require('./routes/Products');
const categoriesRouter = require('./routes/Category');
const brandsRouter = require('./routes/Brand');
const usersRouter = require('./routes/User');
const authRouter = require('./routes/Auth');
const cartRouter = require('./routes/Cart');
const orderRouter = require('./routes/Order');
const cors = require('cors');

const port = process.env.PORT;

server.use(express.json());
server.use(cors({
    exposedHeaders:['X-Total-Count']
}));
server.use('/products', productRouters.router);
server.use('/category',categoriesRouter.router);
server.use('/brands',brandsRouter.router);
server.use('/users',usersRouter.router);
server.use('/auth',authRouter.router);
server.use('/cart',cartRouter.router);
server.use('/orders',orderRouter.router);

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