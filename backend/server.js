const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config();
const cors = require('cors');
const User = require('./models/usersDB');
const userRoutes = require('./routes/userRoutes');
const productRoutes = require('./routes/productRoutes');
const reportRoutes = require('./routes/reportRoutes');
const { OAuth2Client } = require('google-auth-library');
const cart= require('./routes/cart');


const app = express();
const port = 5000;

// Connect to MongoDB
mongoose
    .connect(process.env.mongodb_url, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(async () => {
        console.log("Connected To MongoDB...");

        // Drop and recreate googleId index with sparse and unique constraints
        try {
            // Attempt to remove any existing index on the googleId field
            await User.collection.dropIndex("googleId_1");
            console.log("Dropped googleId index");
             // Create a new index on googleId with unique and sparse constraints
            // unique: Ensures googleId is unique across documents (no duplicates)
            // sparse: Allows multiple documents with a null googleId (only non-null values are unique)
            await User.collection.createIndex({ googleId: 1 }, { unique: true, sparse: true });
            console.log("Recreated googleId index with sparse and unique constraints");
        } catch (error) {
            // Log any error that occurs during index setup
            console.error("Error setting up indexes:", error);
        }
    })
    .catch((err) => console.log("Error connecting to MongoDB:", err));



app.use(express.json());
app.use(cors()); 


app.use('/userRoutes', userRoutes); 
app.use('/productRoutes', productRoutes);
app.use('/api/reportRoutes', reportRoutes);
app.use('/cart', cart);
// Middleware to set security headers for Cross-Origin policies
app.use((req, res, next) => {
    // Sets the Cross-Origin-Opener-Policy header to "same-origin"
    // This prevents cross-origin resources from accessing this document,
    // blocking resources from other domains from opening in the same window.
    res.setHeader("Cross-Origin-Opener-Policy", "same-origin");
    // Sets the Cross-Origin-Embedder-Policy header to "require-corp"
    // This enforces that all resources loaded by this page (e.g., images, scripts)
    // are either from the same origin or have appropriate CORS headers.
    // It’s required for advanced security features like SharedArrayBuffers.
    res.setHeader("Cross-Origin-Embedder-Policy", "require-corp");
    next();// Passes control to the next middleware
});
// CORS configuration to allow cross-origin requests
app.use(cors({
    // Specifies the origin allowed to access the server. Here, only requests
    // from http://localhost:3000 are allowed (e.g., frontend running locally).
    origin: "http://localhost:3000", 
    // Allows credentials (such as cookies, authorization headers) to be included
    // in requests from the specified origin. Necessary for user authentication.
    credentials: true // Allow credentials if needed
}));







app.get('/auth/google-client-id', (req, res) => {
    res.json({ clientId: process.env.GOOGLE_CLIENT_ID });
  });
  
// Test route
app.get('/', (req, res) => {
    res.json({ message: "Hello, I am in the backend" });
});




app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
