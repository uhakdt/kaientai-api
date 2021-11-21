import express from 'express';
import request from 'request';
import * as email from '../auxillary/email.js';

const router = express.Router();

// Request Options
import { productGetReqOpts, productUpdateStockReqOpts } from './requestOptions/productReqOpts.js';
import { postcodeCheckReqOpts } from './requestOptions/postcodeReqOpts.js';
import { userAddReqOpts } from './requestOptions/userReqOpts.js';
import { addressAddReqOpts } from './requestOptions/addressReqOpts.js';

import { orderAddReqOpts, orderUpdateReqOpts } from './requestOptions/orderReqOpts.js';
import { orderCheckExtExistsReqOpts } from './requestOptions/orderReqOpts.js';

import { productCheckIfEnoughStock, productFormatOrderProductsShopifyWooCommerce } from '../auxillary/product.js';
import { klfDataMainDeclerationWooCommerce } from '../auxillary/dataDeclaration.js';

let currentURL = process.env.URL;

if(process.env.NODE_ENV === 'Development') {
  currentURL = process.env.URL_DEV
}


const productGetReqOptsRes = productGetReqOpts()

// ORDER CREATE
router.post('/api/v1/klf/woocommerce/:supplierID', async (req, res) => {
  try {
    // Variable declarations
    const listOfOrderProducts = productFormatOrderProductsShopifyWooCommerce(req.body.dataBody.line_items);
    let dataMain = klfDataMainDeclerationWooCommerce(req.body.dataBody, listOfOrderProducts, req.params.supplierID, "add", null, "In Progress");

    const postcodeCheckReqOptsRes = postcodeCheckReqOpts(dataMain);
    const addressAddReqOptsRes = addressAddReqOpts(dataMain);
    const userAddReqOptsRes = userAddReqOpts(dataMain);
    const productUpdateStockReqOptsRes = productUpdateStockReqOpts(dataMain);

    const orderAddReqOptsRes = orderAddReqOpts(dataMain);
    const orderCheckExtExistsReqOptsRes = orderCheckExtExistsReqOpts(dataMain);

    // CHECK POSTCODE
    request(postcodeCheckReqOptsRes, (error, resPostCodeCheck, body) => {
      if (error) {
        console.log(error);
      } else if (resPostCodeCheck.body.local === 'yes') {
        
        // ADD ADDRESS
        request(addressAddReqOptsRes, (error, resAddAddress, body) => {
          if(error){
            console.log(error);
          } else if (resAddAddress.statusCode === 201) {
            let addressID = resAddAddress.body.data.address.id;
            userAddReqOptsRes.json.addressID = addressID;

            // ADD USER
            request(userAddReqOptsRes, (error, resAddUser, body) => {
              orderAddReqOptsRes.json.userID = resAddUser.body.data.user.id;
              dataMain.intUserID = resAddUser.body.data.user.id;
              if(orderAddReqOptsRes.json.userID != null && dataMain.intUserID != null){
                CheckOrderFulfilment(orderCheckExtExistsReqOptsRes, orderAddReqOptsRes, productUpdateStockReqOptsRes, dataMain, res);
              }
            })
          }
        })

      } else if(resPostCodeCheck.statusCode === 204) {
        res.status(204).json({
          status: "Not within Kaientai's postcode area.",
          data: {
            postcode: resPostCodeCheck.body.data.postcode
          }
        })
        console.log("We do not cover this postcode area: ", resPostCodeCheck.body.data.postcode);
      } else {
        res.status(400).json({
          status: "Incorrect Postcode.",
          data: {
            postcode: resPostCodeCheck.body.data.postcode
          }
        })
        console.log("Wrong Postcode input: ", resPostCodeCheck.body.data.postcode);
      }
    });
  } catch (error) {
    console.log(error);
  }
})

let CheckOrderFulfilment = async (orderCheckExtExistsReqOptsRes, orderAddReqOptsRes, productUpdateStockReqOptsRes, dataMain, res) =>  {
  // GET List of Products
  request(productGetReqOptsRes, (error, resGetProducts, body) => {
    let listOfProduct = JSON.parse(resGetProducts.body);
    listOfProduct = listOfProduct.data.products;
    
    // CHECK If order can be fulfiled
    const orderToBeFulfilled = productCheckIfEnoughStock(dataMain.orderProducts, listOfProduct)

    if(orderToBeFulfilled){

      // CHECK if order exists
      request(orderCheckExtExistsReqOptsRes, (error, resCheckExtOrderExists, body) => {
        if(resCheckExtOrderExists.statusCode === 204) {

          // ADDING order
          request(orderAddReqOptsRes, (error, resAddOrder, body) => {
            dataMain.orderID = resAddOrder.body.data.order.id;

            // ITERATE order items
            for (let i = 0; i < dataMain.orderProducts.length; i++) {
              const orderItem = dataMain.orderProducts[i];

              // ITERATE stock items
              for (let i = 0; i < listOfProduct.length; i++) {
                const stockItem = listOfProduct[i];

                // UPDATE stock
                productUpdateStockReqOptsRes.json.id = stockItem.id
                productUpdateStockReqOptsRes.json.stock = stockItem.stock - orderItem.quantity;
                if(orderItem.title.toLowerCase() === stockItem.title.toLowerCase()){
                  request(productUpdateStockReqOptsRes, (error, resUpdateStock, body) => {
                    console.log("Updating stock")
                  })
                }
              }
            }

            email.SendEmailToKaientai(dataMain);
            email.SendEmailToSupplier(dataMain);
            res.status(200).json({
              status: "OK."
            })
          })
        } else {
          res.status(409).json({
            status: "Order already exists."
          })
          console.log("Order already exists.")
        }
      })
    } else {
      res.status(406).json({
        status: "Order cannot be fulfiled."
      })
      console.log("Order cannot be fulfiled.")
    }
  })
}

export default router;