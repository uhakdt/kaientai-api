// Dependencies
import "dotenv/config.js";
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { FrontendUrl, BackendUrl } from "./auxillary/globalVariables.js";

// Express Setup
const app = express();
app.use(cors({
  origin: '*'
  // origin:[FrontendUrl, FrontendUrl + '/*', BackendUrl, BackendUrl + '/*', 'https://kaientai.loca.lt', 'https://kaientai.loca.lt/*'],
}));
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
import shopifySession from './routes/shopifySession.js';

app.use(klf);
app.use(order);
app.use(orderProduct);
app.use(product);
app.use(user);
app.use(postcode);
app.use(supplier);
app.use(shopifySession);

export default app;