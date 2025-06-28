require('dotenv').config();
const express = require('express');
const server = express();
const mongoose = require('mongoose');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const express_session = require('express-session');
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const cookieParser = require('cookie-parser');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const productRouters = require('./routes/Products');
const categoriesRouter = require('./routes/Category');
const brandsRouter = require('./routes/Brand');
const usersRouter = require('./routes/User');
const authRouter = require('./routes/Auth');
const cartRouter = require('./routes/Cart');
const orderRouter = require('./routes/Order');
const nodemailer = require('nodemailer');
const cors = require('cors');
const path = require('path')
const { User } = require('./model/User');
const { isAuth, sanitizeUser, cookieExtractor } = require('./services/common');
const { Order } = require('./model/Order');

// Email



const endpointSecret = process.env.ENDPOINT_SECRET_KEY;

server.post('/webhook',express.raw({type: 'application/json'}), async(request, response) => {
  let event = request.body;
  // Only verify the event if you have an endpoint secret defined.
  // Otherwise use the basic event deserialized with JSON.parse
  if (endpointSecret) {
    // Get the signature sent by Stripe
    const signature = request.headers['stripe-signature'];
    try {
      event = stripe.webhooks.constructEvent(
        request.body,
        signature,
        endpointSecret
      );
    } catch (err) {
      console.log(`⚠️  Webhook signature verification failed.`, err.message);
      return response.sendStatus(400);
    }
  }

  // Handle the event
  switch (event.type) {
    case 'payment_intent.succeeded':
      const paymentIntent = event.data.object;
      const order = await Order.findById(paymentIntent.metadata.orderId);
      order.paymentStatus = 'received';
      await order.save();
      console.log(`PaymentIntent for ${paymentIntent.amount} was successful!`);
      // Then define and call a method to handle the successful payment intent.
      // handlePaymentIntentSucceeded(paymentIntent);
      break;
    case 'payment_method.attached':
      const paymentMethod = event.data.object;
      // Then define and call a method to handle the successful attachment of a PaymentMethod.
      // handlePaymentMethodAttached(paymentMethod);
      break;
    default:
      // Unexpected event type
      console.log(`Unhandled event type ${event.type}.`);
  }

  // Return a 200 response to acknowledge receipt of the event
  response.send();
});

const port = process.env.PORT;

const SECRET_KEY = process.env.SECRET_KEY;
const opts = {};
opts.jwtFromRequest = cookieExtractor;
opts.secretOrKey = SECRET_KEY;

server.use(express.static(path.join(__dirname,'build')));
server.use(cookieParser());
// server.use();
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
// orders are colliding with the frontend hence i use diff endpoints for the backend
server.use('/orders',isAuth(),orderRouter.router);


server.get(/^(?!\/api).*/, (req, res) => { 
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});
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
                done(null, {id:user.id,role:user.role,token:token});
            })
        }
        catch(err){
            done(err);
        }
    }
));

passport.use('jwt',new JwtStrategy(opts,async function(jwt_payload,done){
    try{
        const user = await User.findById(jwt_payload.id);
        if(user) return done(null,user);
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


const stripe = require("stripe")(process.env.STRIPE_API);

server.use(express.static("public"));


server.post("/create-payment-intent", async (req, res) => {
  const { totalAmount, orderId } = req.body;

  // Create a PaymentIntent with the order amount and currency
  const paymentIntent = await stripe.paymentIntents.create({
    amount: totalAmount*100,
    currency: "usd",
    // In the latest version of the API, specifying the `automatic_payment_methods` parameter is optional because Stripe enables its functionality by default.
    automatic_payment_methods: {
      enabled: true,
    },
    metadata:{
      orderId: orderId
    }
  });

  res.send({
    clientSecret: paymentIntent.client_secret,
  });
});
async function main(){
    mongoose.connect(process.env.MONGODB_URL);
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