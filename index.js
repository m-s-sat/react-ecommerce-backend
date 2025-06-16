require('dotenv').config();
const express = require('express');
const server = express();
const mongoose = require('mongoose');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const express_session = require('express-session');
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const productRouters = require('./routes/Products');
const categoriesRouter = require('./routes/Category');
const brandsRouter = require('./routes/Brand');
const usersRouter = require('./routes/User');
const authRouter = require('./routes/Auth');
const cartRouter = require('./routes/Cart');
const orderRouter = require('./routes/Order');
const cors = require('cors');
const { User } = require('./model/User');
const { isAuth, sanitizeUser } = require('./services/common');

const port = process.env.PORT;

const SECRET_KEY = process.env.SECRET_KEY;
const opts = {};
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
opts.secretOrKey = SECRET_KEY;

server.use(express.json());
server.use(cors({
    exposedHeaders:['X-Total-Count']
}));
server.use(express_session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: false
}));
server.use(passport.authenticate('session'));
server.use('/products',isAuth(),productRouters.router);
server.use('/category',isAuth(),categoriesRouter.router);
server.use('/brands',isAuth(),brandsRouter.router);
server.use('/users',isAuth(),usersRouter.router);
server.use('/auth',authRouter.router);
server.use('/cart',isAuth(),cartRouter.router);
server.use('/orders',isAuth(),orderRouter.router);

passport.use('local',new LocalStrategy(
    {usernameField:'email'},
    async function (email, password, done){
        try{
            const user = await User.findOne({email:email});
            if(!user) done(null, false, {message:'no such user email'});
            crypto.pbkdf2(password,user.salt,310000,32,'sha256',async function(err,hashedPassword){
                if(!crypto.timingSafeEqual(user.password, hashedPassword)){
                    return done(null, false, {message:'invalid credentials'});
                }
                const token = jwt.sign(sanitizeUser(user),SECRET_KEY);
                done(null, token);
            })
        }
    catch(err){
        done(err);
    }
    }
));

passport.use('jwt',new JwtStrategy(opts,async function(jwt_payload,done){
    try{
        const user = await User.findOne({id:jwt_payload.sub});
        if(user) return done(null,sanitizeUser(user));
        else return done(null,false);
    }
    catch(err){
        return done(err,false);
    }
       
        
    })
);
// this create session variable req.user on being called from callback
passport.serializeUser(function(user,cb){
    process.nextTick(function(){
        return cb(null,user);
    });
});
// this creates session variable req.user when called from authorized request
passport.deserializeUser(function(user,cb){
    process.nextTick(function(){
        return cb(null,{id:user.id, role:user.role});
    });
});

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