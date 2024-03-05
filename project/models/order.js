const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    userId :{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        require:true,
    },
    items:[{
        product:{
            type:mongoose.Schema.Types.ObjectId,
            ref:"products",
            require:true
        },
        price:{
            type:Number,
            default:0,
        },
        quantity:{
            type:Number,
            require:true
        },   
    }
    ],
    totalPrice:{
        type:Number,
        default:0,
    },
    billingDetails: {
        name: String,
        address: String,
        street: String,
        city: String,
        state: String,
        zip: String,
        country: String,
        phone: String,
        email: String
    },
    paymentStatus: {
        type: String,
        default: 'pending'
    },
    orderStatus: {
        type: String,
        default: 'pending'
    },
    orderDate: {
        type: Date,
        default: Date.now,
    }
});



module.exports = mongoose.model('order', orderSchema);