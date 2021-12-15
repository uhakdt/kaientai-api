import express from 'express';
import request from 'request';
import * as email from '../auxillary/email.js';

const router = express.Router();

// Request Options
import { productUpdateStockReqOpts } from './requestOptions/productReqOpts.js';
import { orderUpdateReqOpts } from './requestOptions/orderReqOpts.js';

import { productFormatOrderProductsShopify } from '../auxillary/product.js';
import { klfDataMainDeclerationShopify } from '../auxillary/dataDeclaration.js';
import { checkPostcodeNewOrder } from './klfMainFunctions/postcodeCheck.js';
import { decreaseProductsStockNewOrder } from './klfMainFunctions/stockUpdate.js';
import { createNewOrder } from './klfMainFunctions/createNewOrder.js';
import { checkEnoughStock } from './klfMainFunctions/stockEnoughCheck.js'
import { addUserNewOrder } from './klfMainFunctions/userAdd.js'

// New Order
router.post('/api/v1/klf/shopify/:supplierID', async (req, res) => {
  try {
    // 0. Variable declarations
    const listOfOrderProducts = productFormatOrderProductsShopify(req.body.data.line_items);
    let dataMain = klfDataMainDeclerationShopify(req.body.data, listOfOrderProducts, req.params.supplierID, "add", null, "In Progress");

    // 1. Check Postcode within Area
    const postcodeCheckResult = await checkPostcodeNewOrder(dataMain);
    if(postcodeCheckResult === "yes") {

      // 2. Check Stock availability
      const enoughStock = await checkEnoughStock(dataMain);
      if(enoughStock === true) {

        // 3.1 Add User
        await addUserNewOrder(dataMain);

        // 3.2 Update Stock
        await decreaseProductsStockNewOrder(dataMain.orderProducts);

        // 3.3 Create Order + Order Products
        const newOrderCreate = await createNewOrder(dataMain);

        if(newOrderCreate.status === "OK") {

          // 4. Send Emails + Response
          email.SendEmailToKaientai(dataMain);
          res.status(200).json({
            status: "OK."
          })
        } else if (newOrderCreate.status === "Order already exists by checking External Order ID.") {
          res.status(204).json({
            status: "Cannot fulfil request as order already exists."
          })
        }
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

// ORDER UPDATE
router.put('/api/v1/klf/shopify/:supplierID/:orderID', async (req, res) => {
  try {
    // Variable declarations
    const listOfOrderProducts = productFormatOrderProductsShopify(req.body.data.line_items);
    let dataMain = klfDataMainDeclerationShopify(req.body.data, listOfOrderProducts, req.params.supplierID, "update", req.params.orderID, "In Progress");

    const orderUpdateReqOptsRes = orderUpdateReqOpts(dataMain);
    const productUpdateStockReqOptsRes = productUpdateStockReqOpts(dataMain);

    CheckOrderFulfilmentUpdate(orderUpdateReqOptsRes, productUpdateStockReqOptsRes, dataMain, res);

  } catch (error) {
    res.status(400).json({ error: error.message });
  }
})

let CheckOrderFulfilmentUpdate = async (orderUpdateReqOptsRes, productUpdateStockReqOptsRes, dataMain, res) =>  {
  request(productGetReqOptsRes, (error, resGetProducts, body) => {
    let listOfProduct = JSON.parse(body);
    listOfProduct = listOfProduct.data.products;
    // CHECK If order can be fulfiled
    const orderToBeFulfilled = productsCheckIfEnoughStock(dataMain.orderProducts, listOfProduct)
    if(orderToBeFulfilled){
      // UPDATING ORDER
      request(orderUpdateReqOptsRes, (error, resUpdateOrder, body) => {
        dataMain.orderID = resUpdateOrder.body.data.order.id;
        //ITERATE OVER ORDER ITEMS
        for (let i = 0; i < dataMain.orderProducts.length; i++) {
          const orderItem = dataMain.orderProducts[i];
          // ITERATE OVER STOCK ITEMS
          for (let i = 0; i < listOfProduct.length; i++) {
            const stockItem = listOfProduct[i];
            // UPDATE STOCK = STOCK - ORDER
            productUpdateStockReqOptsRes.json.id = stockItem.id
            productUpdateStockReqOptsRes.json.stock = stockItem.stock - orderItem.quantity;
            if(orderItem.title.toLowerCase() === stockItem.title.toLowerCase()){
              console.log("Updating stock")
              request(productUpdateStockReqOptsRes, (error, resUpdateStock, body) => {
              })
            }
          }
        }
        email.SendEmailToKaientaiOrderUpdate(dataMain);
        res.status(200).json({
          status: "OK."
        })
      })
    } else {
      res.status(406).json({
        status: "Order cannot be fulfiled."
      })
      console.log("Order cannot be fulfiled.")
    }
  })
}

// ORDER CANCELLED
router.put('/api/v1/klf/shopify/cancellation/:supplierID/:orderID', async (req, res) => {
  try {
    // Variable declarations
    const listOfOrderProducts = productFormatOrderProductsShopify(req.body.data.line_items);
    let dataMain = klfDataMainDeclerationShopify(req.body.data, listOfOrderProducts, req.params.supplierID, "cancelled", req.params.orderID, "Cancelled");

    const orderUpdateReqOptsRes = orderUpdateReqOpts(dataMain);
    const productUpdateStockReqOptsRes = productUpdateStockReqOpts(dataMain);

    orderFulfillmentCancelled(orderUpdateReqOptsRes, productUpdateStockReqOptsRes, dataMain, res);

  } catch (error) {
    res.status(400).json({ error: error.message });
  }
})

let orderFulfillmentCancelled = async (orderUpdateReqOptsRes, productUpdateStockReqOptsRes, dataMain, res) => {
  request(productGetReqOptsRes, (error, resGetProducts, body) => {
    let listOfProduct = JSON.parse(body);
    listOfProduct = listOfProduct.data.products;

    // UPDATING ORDER
    request(orderUpdateReqOptsRes, (error, resUpdateOrder, body) => {
      dataMain.orderID = resUpdateOrder.body.data.order.id;

      //ITERATE OVER ORDER ITEMS
      for (let i = 0; i < dataMain.orderProducts.length; i++) {
        const orderItem = dataMain.orderProducts[i];

        // ITERATE OVER STOCK ITEMS
        for (let i = 0; i < listOfProduct.length; i++) {
          const stockItem = listOfProduct[i];

          // UPDATE STOCK = STOCK + ORDER
          productUpdateStockReqOptsRes.json.id = stockItem.id
          productUpdateStockReqOptsRes.json.stock = stockItem.stock + orderItem.quantity;
          if(orderItem.title.toLowerCase() === stockItem.title.toLowerCase()){
            console.log("Updating stock")
            request(productUpdateStockReqOptsRes, (error, resUpdateStock, body) => {
            })
          }
        }
      }
      email.SendEmailToKaientaiOrderCancelled(dataMain);
      email.SendEmailToSupplierOrderCancelled(dataMain);
      res.status(200).json({
        status: "OK."
      })
    })
  })
}

export default router;