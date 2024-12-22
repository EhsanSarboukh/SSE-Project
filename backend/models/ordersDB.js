var mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    status : String,
    customerId: String,
    fullName: String,
    shopName: String,
    phoneNumber: String,
    location: String,
    cart: [
        {
            sku: { type: String, required: true },
            productName: { type: String, required: true },
            amount: { type: Number, required: true },
            priceForOne: { type: Number, required: true },
        }
    ],
    totalOrderPrice: Number,
    date : { type: Date, default: Date.now }, 
});

module.exports = mongoose.model('Order', orderSchema);
