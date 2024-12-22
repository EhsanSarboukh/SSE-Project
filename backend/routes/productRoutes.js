const express = require("express");
const multer = require("multer");
const Product = require("../models/productsDB");
const router = express.Router();
const storage = multer.memoryStorage(); // Configure multer for file uploads (store in memory)
const upload = multer({ storage: storage }); // Create multer instance with storage configuration

router.post("/upload", upload.single("image"), async (req, res) => {
  try {
    const { expirationDate, status, name, sku, price, amount } = req.body;
    const newProduct = new Product({
      expirationDate: new Date(expirationDate),
      status,
      name,
      sku,
      price,
      amount,
      image: {
        data: req.file.buffer, // Image stored as Buffer
        contentType: req.file.mimetype, // Store the MIME type
      },
    });
    await newProduct.save();
    res.json({ message: "Product saved successfully", product: newProduct });
  } catch (error) {
    res.status(500).json({
      error: "Failed to upload image and save product",
      details: error.message,
    });
  }
});

router.get("/getProducts", async (req, res) => {
  try {
    const products = await Product.find({});
    const productsWithBase64Images = products.map((product) => {
      return {
        ...product._doc, // Spread the existing product details
        image: product.image
          ? `data:${
              product.image.contentType
            };base64,${product.image.data.toString("base64")}`
          : null, // Convert the image to base64 string
      };
    });

    res.json(productsWithBase64Images);
  } catch (error) {
    res
      .status(500)
      .json({ error: "Failed to fetch products", details: error.message });
  }
});

// Update a product by SKU via FormData
router.put("/update", upload.single("image"), async (req, res) => {
  try {
    const { sku, name, status, amount, expirationDate, price } = req.body;

    // Find the product by SKU and update the product details
    const updatedProductData = {
      name,
      status,
      amount: parseInt(amount),
      expirationDate: new Date(expirationDate),
      price: parseFloat(price),
    };

    if (req.file) {
      updatedProductData.image = {
        data: req.file.buffer,
        contentType: req.file.mimetype,
      };
    }

    // Update product in the database
    const updatedProduct = await Product.findOneAndUpdate(
      { sku: sku }, // Find by SKU
      updatedProductData,
      { new: true } // Return the updated product
    );

    if (!updatedProduct) {
      return res.status(404).json({ error: "Product not found" });
    }

    res.json({
      message: "Product updated successfully",
      product: updatedProduct,
    });
  } catch (error) {
    res
      .status(500)
      .json({ error: "Failed to update product", details: error.message });
  }
});

router.delete("/delete", async (req, res) => {
  const { sku } = req.query; // Get the SKU from the query string

  try {
    const deletedItem = await Product.findOneAndDelete({ sku });
    if (!deletedItem) {
      return res.status(404).json({ error: "Item not found" });
    }
    res.json({ message: "Item deleted successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ error: "Failed to delete item", details: error.message });
  }
});

module.exports = router;
