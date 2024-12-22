const bcrypt = require("bcrypt");
const express = require("express");
const router = express.Router();
const User = require("../models/usersDB");
const Customer = require("../models/customerDB");
const Order = require("../models/ordersDB");
const jwtManager = require("../controllers/jwtManager");
const { OAuth2Client } = require("google-auth-library");
const updateInventory = require("../utils/stockMaster").updateInventory;

// Middleware function to ensure the user is authenticated
/*function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect('/login');  // Redirect to login if not authenticated
}*/
const clientId = process.env.GOOGLE_CLIENT_ID;
const client = new OAuth2Client(clientId);

// Register a new user
router.post("/register", async (req, res) => {
  const user = req.body;

  // Check for required fields
  if (
    !user.username ||
    !user.password ||
    !user.phone ||
    !user.businessName ||
    !user.email
  ) {
    return res
      .status(400)
      .json({ message: "Missing required fields", type: "error" });
  }

  try {
    // Convert username and email to lowercase for consistency
    const username = user.username.toLowerCase();
    const email = user.email.toLowerCase();

    // Check if the username or email already exists
    let existingUser = await User.findOne({ $or: [{ username }, { email }] });

    if (existingUser) {
      // If user has logged in with Google and now wants to set up username/password
      if (existingUser.googleId && !existingUser.password) {
        // Hash the new password
        const hashedPassword = await bcrypt.hash(
          user.password,
          Number(process.env.SALT_ROUNDS)
        );

        // Update user with username and hashed password
        existingUser.username = username;
        existingUser.password = hashedPassword;
        existingUser.phone = user.phone;
        existingUser.businessName = user.businessName;
        existingUser.loginMethod = "google+standard"; // Indicate they have both login methods

        // Save updated user
        await existingUser.save();

        // Generate JWT for the updated user
        const accessToken = jwtManager(existingUser);

        return res.status(200).json({
          message: "User updated with username and password",
          type: "success",
          user: existingUser,
          accessToken: accessToken,
        });
      }

      // If there's a conflict with an existing standard user or duplicate username/email
      const conflictField =
        existingUser.username === username ? "Username" : "Email";
      return res.status(200).json({
        message: `${conflictField} already in use. Please choose another one!`,
        type: "failed",
      });
    }

    // If no user exists, create a new one as usual
    const hashedPassword = await bcrypt.hash(
      user.password,
      Number(process.env.SALT_ROUNDS)
    );

    // Create the new user
    const newUser = new User({
      username,
      email,
      password: hashedPassword,
      phone: user.phone,
      businessName: user.businessName,
      googleId: user.loginMethod === "google" ? user.googleId : undefined, // Only set googleId if loginMethod is Google
      loginMethod: "standard",
    });

    const accessToken = jwtManager(newUser);
    const savedUser = await newUser.save();

    return res.status(200).json({
      message: "New user added",
      type: "success",
      user: savedUser,
      accessToken: accessToken,
    });
  } catch (err) {
    console.error("Error saving user:", err);
    res.status(500).json({ message: "Database error", type: "error" });
  }
});

// Login route
router.post("/login", async (req, res) => {
  const { username, password } = req.body;
  console.log(req.body);

  try {
    const foundUser = await User.findOne({ username: username.toLowerCase() });
    if (!foundUser) {
      return res.status(401).send("Invalid username or password.");
    }

    bcrypt.compare(password, foundUser.password, (err, result) => {
      if (err) {
        console.error("Error during password comparison:", err);
        return res.status(500).send("Internal server error");
      }

      if (result) {
        // Successful login
        console.log("Successful login");
        console.log(foundUser.businessName);

        // res.send('home');
        const accessToken = jwtManager(foundUser);
        //success response...
        res.status(200).json({
          status: "Success",
          message: "User logged in successfully!",
          accessToken: accessToken,
          username: username,
          businessName: foundUser.businessName,
        });
      } else {
        return res.status(401).send("Invalid username or password.");
      }
    });
  } catch (error) {
    console.error("Error during login:", error);
    res.status(500).send("Error during login");
  }
});
/*// Protected route (example)
router.get('/dashboard', ensureAuthenticated, (req, res) => {
    res.json({ message: "Welcome to the dashboard!", user: req.user });
});*/
const allowedEmails = process.env.ALLOWED_EMAILS.split(",");

router.post("/google-login", async (req, res) => {
  const { googleToken } = req.body;

  if (!googleToken) {
    console.error("Google token missing");
    return res.status(400).json({ error: "Google token is missing" });
  }

  try {
    const ticket = await client.verifyIdToken({
      idToken: googleToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { sub, email, name } = payload;

    console.log("Verified Google User:", { email, sub });

    if (!allowedEmails.includes(email)) {
      console.error("Access denied for email:", email);
      return res
        .status(403)
        .json({ error: "Access denied: Unauthorized email" });
    }

    let user = await User.findOne({ googleId: sub });

    if (!user) {
      // Check if the user exists by email but does not have a googleId yet
      user = await User.findOne({ email });

      if (user) {
        // Update the user to include googleId
        user.googleId = sub;
        user.loginMethod =
          user.loginMethod === "standard" ? "google+standard" : "google";
        await user.save();
      } else {
        // Create a new user if no user with this googleId or email exists
        user = new User({
          googleId: sub,
          username: name,
          email: email,
          loginMethod: "google",
        });
        await user.save();
      }
    }

    const accessToken = jwtManager(user);
    res.status(200).json({ accessToken, message: "Google login successful" });
  } catch (error) {
    console.error("Error verifying Google token:", error);
    res.status(401).json({ error: "Invalid Google token" });
  }
});

router.post("/confirm-order", async (req, res) => {
  const { formData, foundProducts, total } = req.body;
  let totalOrderPrice = 0;
  let cart = [];
  console.log("Form Data:", formData);
  const { customerId, fullName, shopName, phoneNumber, location } = formData;
  console.log(customerId);
  try {
    // Check if the customer already exists
    let customer = await Customer.findOne({ customerId });

    if (!customer) {
      // If the customer does not exist, create a new one
      customer = new Customer({
        customerId,
        fullName,
        shopName,
        phoneNumber,
        location,
      });
      await customer.save();
      console.log("A new Customer has join the party!");
    } else {
      // If the customer exists, update the existing record
      customer.customerId = customerId;
      customer.fullName = fullName;
      customer.shopName = shopName;
      customer.phoneNumber = phoneNumber;
      customer.location = location;

      await customer.save();
    }
  } catch (error) {
    console.error("Error saving customer data:", error);
  }

  if (Array.isArray(foundProducts)) {
    foundProducts.forEach((product) => {
      const { sku, product: productName, amount, priceForOne, image } = product;
      cart.push({
        sku,
        productName,
        amount,
        priceForOne,
      });
      totalOrderPrice = totalOrderPrice + amount * priceForOne;
      // Check if sku and amount are defined
      if (sku !== undefined && amount !== undefined) {
        updateInventory(sku, amount);
      } else {
        console.error(
          `SKU or amount is undefined for product: ${JSON.stringify(product)}`
        );
      }
    });
  } else {
    console.log("foundProducts is not an array");
  }
  // Create a new order
  console.log(cart);
  let status = "בטיפול";
  newOrder = new Order({
    status,
    customerId,
    fullName,
    shopName,
    phoneNumber,
    location,
    cart,
    totalOrderPrice,
    date: new Date(),
  });
  await newOrder.save(); // Save the order to the database
  console.log("Order saved successfully!");
  console.log(totalOrderPrice);
  res.status(200).json({ message: "success!" });
});

module.exports = router;
