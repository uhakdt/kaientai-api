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
import klf from './routes/klf.js';
import order from './routes/order.js';
import orderProduct from './routes/orderProduct.js';
import product from './routes/product.js';
import user from './routes/user.js';
import postcode from './routes/postcode.js';
import supplier from './routes/supplier.js';

app.use(klf);
app.use(order);
app.use(orderProduct);
app.use(product);
app.use(user);
app.use(postcode);
app.use(supplier);

export default app;