const Product= require('../models/productsDB');


const updateInventory = async (sku, amount) => {
    try {
        const product = await Product.findOne({ sku });

        if (!product) {
            console.error(`Product with SKU ${sku} not found.`);
            return;
        }

        // Update the product's amount (you can adjust the logic as needed)
        if (product.amount - amount < 0) {
            console.error(`Can't go through with order, the order has an excess amount of the item with sku ${sku} than we currently have in the inventory`);
            throw new Error("Can't go through with order, the order has an excess amount of the item with sku ${sku} than we currently have in the inventory")
        }
        product.amount -= amount;

        await product.save(); // Save the updated product back to the database
        console.log(`Updated inventory for SKU: ${sku}, New Amount: ${product.amount}`);
    } catch (error) {
        console.error('Error updating inventory:', error);
    }
};


  module.exports= {updateInventory};