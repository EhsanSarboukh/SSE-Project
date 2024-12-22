const mongoose = require('mongoose');

var customerSchema = mongoose.Schema({
    customerId : { type: String, unique: true, required: true },
    fullName : String,
    shopName : String,
    phoneNumber : String,
    location : String,
});

var Customer = mongoose.model("Customer", customerSchema);
module.exports = Customer;