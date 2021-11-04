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
app.use(require('./routes/klfRoute.js'));
app.use(require('./routes/klfWooCommerceRoute.js'));
app.use(require('./routes/orderRoute.js'));
app.use(require('./routes/orderProductRoute.js'));
app.use(require('./routes/productRoute.js'));
app.use(require('./routes/addressRoute.js'));
app.use(require('./routes/userRoute.js'));
app.use(require('./routes/postcodeRoute.js'));
app.use(require('./routes/supplierRoute.js'));
app.use(require('./routes/cartProductRoute.js'));

module.exports = app;