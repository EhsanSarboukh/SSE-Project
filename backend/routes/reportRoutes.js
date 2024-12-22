const express= require('express');
const multer = require('multer');
const Report= require('../models/reportsDB');
const router = express.Router();
const Order = require('../models/ordersDB');
const Customer = require('../models/customerDB');

const storage= multer.memoryStorage(); // Configure multer for file uploads (store in memory)
const upload = multer({ storage: storage }); // Create multer instance with storage configuration
router.post('/uploadReport', upload.single('analysis'), async (req, res) => {
    try {
        // Extract fields like date from the request body
        const { date } = req.body;

        // Create a new report and store the uploaded PDF as Buffer
        const newReport = new Report({
            date: new Date(date),
            analysis: {
                data: req.file.buffer,      // PDF stored as Buffer
                contentType: req.file.mimetype // Store the MIME type (application/pdf)
            }
        });

        // Save the report to MongoDB
        await newReport.save();
        res.json({ message: "Report saved successfully", report: newReport });
    } catch (error) {
        res.status(500).json({ error: "Failed to upload PDF and save report", details: error.message });
    }
});

router.get('/pullOrderReportData/:year/:month', async (req, res) => {
    const { year, month } = req.params;
    // Calculate start and end of the month
    const startOfMonth = new Date(year, month - 1, 1); // month is 0-indexed
    const endOfMonth = new Date(year, month, 0, 23, 59, 59, 999);
    try {
        const orders = await Order.find({
          date: { $gte: startOfMonth, $lt: endOfMonth },
        });
        res.json(orders);
      } catch (err) {
        res.status(500).json({ error: "Failed to fetch orders" });
      }
});
router.get('/pullAllOrdersReportData', async (req, res) => {

    try {
        const orders = await Order.find({});
        res.json(orders);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch orders" });
    }
});
router.get('/pullAllCustomers', async(req,res)=>{
    try {
        const customers = await Customer.find({});
        res.json(customers);


    } catch (error) {
        res.status(500).json({ error: "Failed to fetch customers" });

        
    }
})


// Update order status by ID
router.put("/:orderId/status", async (req, res) => {
    const { orderId } = req.params; // MongoDB document ID
    const { status } = req.body; // New status
  
    try {
      const order = await Order.findById(orderId); // Find order by ID
  
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }
  
      order.status = status; // Update the status
      await order.save(); // Save the changes
  
      res.status(200).json({ message: "Status updated successfully", order });
    } catch (error) {
      console.error("Error updating status:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
module.exports= router;
