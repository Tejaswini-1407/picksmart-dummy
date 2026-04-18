const express = require("express");
const Razorpay = require("razorpay");
const cors = require("cors");
const crypto = require("crypto");

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static("public")); 

const razorpay = new Razorpay({
  key_id: "rzp_test_SewTQ251C1kJJF",
  key_secret: "tRjTfM9LjL1DcwBbJ4P4SgOp"
});

app.post("/create-order", async (req, res) => {
  try {
    const amount = req.body.amount; 

    const order = await razorpay.orders.create({
      amount: amount, 
      currency: "INR",
      receipt: "receipt_" + Date.now()
    });

    res.json(order);
  } catch (err) {
    console.log(err);
    res.status(500).send("Error creating order");
  }
});

app.post("/verify-payment", (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    } = req.body;

    const generated_signature = crypto
      .createHmac("sha256", "tRjTfM9LjL1DcwBbJ4P4SgOp")
      .update(razorpay_order_id + "|" + razorpay_payment_id)
      .digest("hex");

    if (generated_signature === razorpay_signature) {
      res.json({ success: true });
    } else {
      res.json({ success: false });
    }

  } catch (err) {
    res.status(500).send("Verification error");
  }
});

const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});