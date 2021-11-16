// Dependencies
require("dotenv").config();
const express = require('express');
const cors = require("cors");
const morgan = require("morgan");

// Express Setup
const app = express();
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

// Routes
app.use(require('./routes/klfWooCommerce.js'));
app.use(require('./routes/klfShopify.js'));
app.use(require('./routes/order.js'));
app.use(require('./routes/orderProduct.js'));
app.use(require('./routes/product.js'));
app.use(require('./routes/address.js'));
app.use(require('./routes/user.js'));
app.use(require('./routes/postcode.js'));
app.use(require('./routes/supplier.js'));
app.use(require('./routes/cartProduct.js'));

module.exports = app;