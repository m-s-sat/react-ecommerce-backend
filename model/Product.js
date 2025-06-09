const mongoose = require('mongoose');
const {Schema} = mongoose;

const productSchema = new Schema({
    title:{type:String, required: true, unique: true},
    description:{type:String, required:true},
    discountPercentage:{type:Number,max:[100,"Discount cannot be greater than 100"]},
    price:{type:Number,min:[0,'wrong min price']},
    rating:{type:Number,min:[1,'rating cannot be less than 1'],max:[5,'rating cannot be greater than 5'],default:0},
    stock:{type:Number,min:[0,'stock cannot be less than 0'],default:0},
    brand:{type:String, required:true},
    category:{type:String, required:true},
    thumbnail:{type:String,required:true},
    images:{type:[String],required:true},
    deleted:{type:Boolean, default:false}
})

const virtual = productSchema.virtual('id');
virtual.get(function(){
    return this._id;
})
productSchema.set('toJSON',{
    virtuals: true,
    versionKey: false,
    transform: function (doc,ret){delete ret._id}
})
exports.Product = mongoose.model('Product',productSchema);