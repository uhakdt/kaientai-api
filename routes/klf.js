// Dependencies
import express from 'express';
import * as email from '../auxillary/email.js';

// Data Declerations
import { klfDataMainDeclerationShopify, klfDataMainDeclerationWooCommerce } from '../auxillary/dataDeclaration.js';
import { productFormatOrderProductsShopify, productFormatOrderProductsWooCommerce } from '../auxillary/product.js';

// Main Functions
import { checkPostcodeNewOrder } from './klfMainFunctions/postcodeCheck.js';
import { decreaseProductsStockNewOrder } from './klfMainFunctions/stockUpdate.js';
import { createNewOrder } from './klfMainFunctions/createNewOrder.js';
import { checkEnoughStock } from './klfMainFunctions/stockEnoughCheck.js'
import { addUserNewOrder } from './klfMainFunctions/userAdd.js'

const router = express.Router();

// New Order
router.post('/api/v1/klf/:platform/:supplierID', async (req, res) => {
  try {
    // 0. Data declarations
    let listOfOrderProducts;
    let dataMain;
    if(req.params.platform === "shopify") {
      listOfOrderProducts = productFormatOrderProductsShopify(req.body.data.line_items);
      dataMain = klfDataMainDeclerationShopify(req.body.data, listOfOrderProducts, req.params.supplierID, "add", null, "In Progress");
    } else if(req.params.platform === "woocommerce") {
      listOfOrderProducts = productFormatOrderProductsWooCommerce(req.body.data.line_items);
      dataMain = klfDataMainDeclerationWooCommerce(req.body.data, listOfOrderProducts, req.params.supplierID, "add", null, "In Progress");
    }

    // 1. Check Postcode within Area
    const postcodeCheckResult = await checkPostcodeNewOrder(dataMain);
    if(postcodeCheckResult === "yes") {

      // 2. Check Stock availability
      const enoughStock = await checkEnoughStock(dataMain);
      if(enoughStock === true) {

        // 3 Add User
        await addUserNewOrder(dataMain)
        .then(async (userRes) => {

          // 4.1 Update Stock
          await decreaseProductsStockNewOrder(dataMain.orderProducts);

          // 4.2 Create Order + Order Products
          dataMain.userID = userRes.data.user.id;
          await createNewOrder(dataMain)
          .then(async (orderRes) => {
            if(orderRes.status === 'OK') {
              dataMain.orderID = orderRes.data.order.id;

              // 5. Send Email to us + Response
              email.SendEmailToKaientai(dataMain);
              res.status(200).json({
                status: "OK."
              })
            } else if(orderRes.status === 'Order already exists by checking External Order ID.') {
              res.status(403).json({
                status: "Order cannot be fulfiled. Same Order ID."
              })
            } else {
              res.status(500).json({
                status: "Not sure what happened :|"
              })
            }
          })
          .catch((error) => {
            res.status(400).json({ error: error });
          });
        })
        .catch((error) => {
          res.status(403).json({
            error: error,
            status: "Order cannot be fulfiled. Same Order ID."
          })
        });
      } else if(enoughStock === false) {
        res.status(406).json({
          status: "Order cannot be fulfiled. Not enough stock."
        })
      } else {
        res.status(500).json({
          status: "Not sure what happened :|"
        })
      }
    } else if (postcodeCheckResult === "no") {
      res.status(204).json({
        status: "Not within Kaientai's postcode area."
      })
    } else {
      res.status(400).json({
        status: "Incorrect Postcode."
      })
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
})

export default router;