const express = require('express');
const router = express.Router();
const Product = require('../models/productsDB');
router.post('/viewCart', async (req, res) => {
    const { products } = req.body;
    //console.log("i am in the backend in cart.js and this is the list of the products that i got :",products)
   try {
    const foundProducts =[];
    for (const product of products){
       
        const productFound = await Product.findOne({sku: product.sku });
        console.log(productFound);
        if(productFound) {
            foundProducts.push({
                sku: productFound.sku,
                product: productFound.name, 
                amount: product.selectedAmount, 
                totlaPrice: productFound.price * product.selectedAmount,
                priceForOne: productFound.price,
                image: productFound.image
            });
        }
    }
    res.status(200).json({ foundProducts });
   } catch (error) {
    console.error('Error in viewCart route:', error);
      res.status(500).json({ error: 'Failed to fetch cart details' });
   }

});


router.post('/checkUpdateAmount', async(req, res)=>{
    const { quantityToUpdate, sku }= req.body;
    console.log("this is the quantityDifference in the backend",quantityToUpdate);
   try {
    const productToUpdate = await Product.findOne({sku});
    if (!productToUpdate) {
        return res.status(404).json({ message: 'Product not found' });
    }
    console.log(productToUpdate);
    if(productToUpdate.amount>=quantityToUpdate){
        console.log("the productToUpdate.amount in the backend before updating ",productToUpdate.amount)
        productToUpdate.amount=productToUpdate.amount -quantityToUpdate;

        //await productToUpdate.save();//in the view cart i dont want to update the stock, we will update just after filling the customer details
        console.log("the productToUpdate.amount in the backend after updating ",productToUpdate.amount)

        res.status(200).json({ message: 'Update successful' });


    }
    else{
            res.status(400).json({ message: 'Update denied: Insufficient stock' });

        }
    
   

   } catch (error) {
    console.error('Error in checkUpdateAmount route:', error);
    res.status(500).json({ error: 'Failed to update product amount ' });
    
   }
});
module.exports = router;
