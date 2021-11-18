const express = require('express');
const db = require('../db');
const request = require('request');
const email = require('../auxillary/email');
const GetDateAndTimeNow = require('../auxillary/dateAndTimeNow');

const router = express.Router();


let currentURL = process.env.URL_PROD;

if(process.env.NODE_ENV === 'Development') {
  currentURL = process.env.URL_DEV
}

const reqOptGetProducts = {
  url: `${currentURL}/api/v1/products/all`,
  method: 'GET'
};


router.post('/api/v1/klf/shopify/:supplierID', async (req, res) => {
  try {
    const dataBody = req.body.data;

    // Variable declarations
    let listOfOrderProducts = []
    for (let i = 0; i < dataBody.line_items.length; i++) {
      const e = dataBody.line_items[i];
      let orderProduct = {
        title: e.variant_title != "" ? e.title + " - " + e.variant_title : e.title,
        price: e.price,
        imageUrl: null,
        quantity: e.quantity,
      }
      listOfOrderProducts.push(orderProduct);
    }
    console.log("---------------------------------")
    console.log("ALL ORDER PRODUCTS: \n", listOfOrderProducts)
    console.log("---------------------------------")

    let dataMain = {
      orderID: null,
      name: dataBody.customer.first_name + " " + dataBody.customer.last_name,
      email: dataBody.customer.email,
      phone: dataBody.customer.phone,
      address1: dataBody.shipping_address.address1,
      address2: dataBody.shipping_address.address_2,
      city: dataBody.shipping_address.city,
      county: dataBody.shipping_address.province,
      country: dataBody.shipping_address.country,
      postcode: dataBody.shipping_address.zip,
      intUserID: null,
      extUserID: dataBody.customer.id,
      orderProducts: listOfOrderProducts,
      totalAmount: dataBody.total_price,
      extOrderID: dataBody.id,
      supplierID: req.params.supplierID,
      supplierContactName: dataBody.supplierContactName,
      supplierContactEmail: dataBody.supplierContactEmail,
      dateAndTime: GetDateAndTimeNow()
    }
    
    const reqOptPostCodeCheck = {
      url: `${currentURL}/api/v1/postcode/check`,
      method: 'POST',
      json: {
        "supplierID": dataMain.supplierID,
        "code": dataMain.postcode
      },
    };

    const reqOptAddAddress = {
      url: `${currentURL}/api/v1/address`,
      method: 'POST',
      json: {
        "address1": dataMain.address1,
        "address2": dataMain.address2,
        "city": dataMain.city,
        "county": dataMain.county,
        "country": dataMain.country,
        "postcode": dataMain.postcode
      },
    };

    const reqOptAddUser = {
      url: `${currentURL}/api/v1/user`,
      method: 'POST',
      json: {
        "name": dataMain.name,
        "email": dataMain.email,
        "phone": dataMain.phone,
        "addressID": null,
        "dateAndTimeSignUp": dataMain.dateAndTime,
        "profileImageUrl": null,
        "extUserID": dataMain.extUserID
      },
    };

    const reqOptCheckExtOrderExists = {
      url: `${currentURL}/api/v1/order/ext/${dataMain.extOrderID}`,
      method: 'GET'
    }

    const reqOptAddOrder = {
      url: `${currentURL}/api/v1/order`,
      method: 'POST',
      json: {
        "dateAndTime": dataMain.dateAndTime,
        "statusID": 1,
        "supplierID": dataMain.supplierID,
        "userID": null,
        "totalAmount": dataMain.totalAmount,
        "contactName": dataMain.name,
        "contactEmail": dataMain.email,
        "contactPhone": dataMain.phone,
        "address1": dataMain.address1,
        "address2": dataMain.address2,
        "city": dataMain.city,
        "county": dataMain.county,
        "country": dataMain.country,
        "postcode": dataMain.postcode,
        "offerID": null,
        "extOrderID": dataMain.extOrderID,
        "cartProducts": dataMain.orderProducts
      },
    };

    const reqOptAddOrderProduct = {
      url: `${currentURL}/api/v1/orderProduct`,
      method: 'POST',
      json: {
        "orderID": null,
        "title": null,
        "quantity": null
      },
    };

    const reqOptUpdateStock = {
      url: `${currentURL}/api/v1/product/stock`,
      method: 'PUT',
      json: {
        "id": null,
        "stock": null
      },
    };

    // CHECK POSTCODE
    request(reqOptPostCodeCheck, (error, resPostCodeCheck, body) => {
      if (error) {
        console.log(error);
      } else if (resPostCodeCheck.body.local === 'yes') {
        
        // ADD ADDRESS
        request(reqOptAddAddress, (error, resAddAddress, body) => {
          if(error){
            console.log(error);
          } else if (resAddAddress.statusCode === 201) {
            let addressID = resAddAddress.body.data.address.id;
            reqOptAddUser.json.addressID = addressID;
            // ADD USER
            request(reqOptAddUser, (error, resAddUser, body) => {
              reqOptAddOrder.json.userID = resAddUser.body.data.user.id;
              dataMain.intUserID = resAddUser.body.data.user.id;
              if(reqOptAddOrder.json.userID != null && dataMain.intUserID != null){
                CheckOrderFulfilment(reqOptCheckExtOrderExists, reqOptAddOrder, reqOptAddOrderProduct, reqOptUpdateStock, dataMain, res);
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

let CheckOrderFulfilment = async (reqOptCheckExtOrderExists, reqOptAddOrder, reqOptAddOrderProduct, reqOptUpdateStock, dataMain, res) =>  {
  // CHECK IF ORDER CAN BE FULFILED
  let orderToBeFulfilledCount = 0;
  let orderToBeFulfilled = false;
  request(reqOptGetProducts, (error, resGetProducts, body) => {
    let listOfProduct = JSON.parse(body);
    listOfProduct = listOfProduct.data.products;

    // ORDER ITEMS QUANTITY <= STOCK ITEMS QUANTITY
    dataMain.orderProducts.forEach(orderItem => {
      for (let i = 0; i < listOfProduct.length; i++) {
        let stockItem = listOfProduct[i];
        if(stockItem.title.toLowerCase() === orderItem.title.toLowerCase() && orderItem.quantity <= stockItem.stock){
          orderToBeFulfilledCount += 1;
          break;
        }
      }
    })
    if(orderToBeFulfilledCount === dataMain.orderProducts.length){
      orderToBeFulfilled = true;
    }
    if(orderToBeFulfilled){

      // CHECK IF ORDER EXISTS
      request(reqOptCheckExtOrderExists, (error, resCheckExtOrderExists, body) => {
        let bool;
        if(body.includes("order")){
          bool = true
        } else {
          bool = false;
        }
        if(!bool) {
          // ADDING ORDER
          request(reqOptAddOrder, (error, resAddOrder, body) => {
            dataMain.orderID = resAddOrder.body.data.order.id;
            //ITERATE OVER ORDER ITEMS
            for (let i = 0; i < dataMain.orderProducts.length; i++) {
              const orderItem = dataMain.orderProducts[i];
              // ITERATE OVER STOCK ITEMS
              for (let i = 0; i < listOfProduct.length; i++) {
                const stockItem = listOfProduct[i];
                // UPDATE STOCK = STOCK - ORDER
                reqOptUpdateStock.json.id = stockItem.id
                reqOptUpdateStock.json.stock = stockItem.stock - orderItem.quantity;
                if(orderItem.title.toLowerCase() === stockItem.title.toLowerCase()){
                  request(reqOptUpdateStock, (error, resUpdateStock, body) => {
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

module.exports = router;