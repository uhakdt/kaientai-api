// Dependencies
import "dotenv/config.js";
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';

// Express Setup
const app = express();
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

// Routes
import klfWooCommerce from './routes/klfWooCommerce.js';
import klfShopify from './routes/klfShopify.js';
import order from './routes/order.js';
import orderProduct from './routes/orderProduct.js';
import product from './routes/product.js';
import address from './routes/address.js';
import user from './routes/user.js';
import postcode from './routes/postcode.js';
import supplier from './routes/supplier.js';
// import gdpr from './routes/gdpr.js';

app.use(klfWooCommerce);
app.use(klfShopify);
app.use(order);
app.use(orderProduct);
app.use(product);
app.use(address);
app.use(user);
app.use(postcode);
app.use(supplier);
// app.use(gdpr);

export default app;