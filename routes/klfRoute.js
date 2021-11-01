const express = require('express');
const db = require('../db');
const request = require('request');
const email = require('../auxillary/email');

const router = express.Router();


// ---------------------------------------------------------
// ---------------------
// -----KLF REQUEST-----
// ---------------------
Date.prototype.addHours = function(h) {
  this.setTime(this.getTime() + (h*60*60*1000));
  return this;
}

let currentURL = process.env.URL_PROD;

if(process.env.NODE_ENV === 'Development') {
  currentURL = process.env.URL_DEV
}

const reqOptGetProductVariantOptions = {
  url: `${currentURL}/api/v1/productVariantOptions`,
  method: 'GET'
};


router.post('/api/v1/klf', async (req, res) => {
  try {
    let dt = new Date().addHours(1).toISOString().replace('T', ' ').replace();
    dt = dt.substring(0, dt.length - 5);

    // Variable declarations
    let dataMain = {
      orderID: null,
      name: req.body.name,
      email: req.body.email,
      phone: req.body.phone,
      address1: req.body.address1,
      address2: req.body.address2,
      city: req.body.city,
      county: req.body.county,
      country: req.body.country,
      postcode: req.body.postcode,
      intUserID: null,
      extUserID: req.body.extUserID,
      orderProducts: req.body.orderProducts,
      totalAmount: req.body.totalAmount,
      extOrderID: req.body.extOrderID,
      supplierID: req.body.supplierID,
      supplierContactName: req.body.supplierContactName,
      supplierContactEmail: req.body.supplierContactEmail,
      dateAndTime: dt
    }

    const reqOptPostCodeCheck = {
      url: `${currentURL}/api/v1/postcode/check`,
      method: 'GET',
      json: {
        "supplierID": dataMain.supplierID,
        "code": dataMain.postcode
      },
    };
    
    const reqOptUserCheck = {
      url: `${currentURL}/api/v1/user/ext`,
      method: 'GET',
      json: {
        "id": dataMain.extUserID
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
        "cartProductsID": null,
        "extUserID": dataMain.extUserID
      },
    };

    const reqOptCheckExtOrderExists = {
      url: `${currentURL}/api/v1/order/ext`,
      method: 'GET',
      json: {
        "id": dataMain.extOrderID
      }
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
        "extOrderID": dataMain.extOrderID
      },
    };

    const reqOptAddOrderProduct = {
      url: `${currentURL}/api/v1/orderProduct`,
      method: 'POST',
      json: {
        "orderID": null,
        "productVariantOptionID": null,
        "quantity": null
      },
    };

    const reqOptUpdateStock = {
      url: `${currentURL}/api/v1/productVariantOption/stock`,
      method: 'PUT',
      json: {
        "id": null,
        "stock": null
      },
    };

    // CHECK POSTCODE
    request(reqOptPostCodeCheck, (err, resPostCodeCheck, body) => {
      if (err) {
        console.log(err);
      } else if (resPostCodeCheck.statusCode === 200) {
        
        // CHECK USER IS ALREADY REGISTERED
        request(reqOptUserCheck, (err, resUserCheck, body) => {
          
          if (err) {
            console.log(err);
          }
          // USER EXISTS
          else if(resUserCheck.statusCode === 200) {
            reqOptAddOrder.json.userID = resUserCheck.body.data.user.id;
            dataMain.intUserID = resUserCheck.body.data.user.id;
            console.log("ADD USER");
            CheckOrderFulfilment(reqOptCheckExtOrderExists, reqOptAddOrder, reqOptAddOrderProduct, reqOptUpdateStock, dataMain);
          }
          // USER DOES NOT EXIST
          else if(resUserCheck.statusCode === 204) {
            // ADD ADDRESS
            request(reqOptAddAddress, (err, resAddAddress, body) => {
              if(err){
                console.log(err);
              } else if (resAddAddress.statusCode === 201) {
                let addressID = resAddAddress.body.data.address.id;
                reqOptAddUser.json.extUserID = dataMain.extUserID;
                reqOptAddUser.json.addressID = addressID;
                console.log(addressID);
                // ADD USER
                request(reqOptAddUser, (err, resAddUser, body) => {
                  reqOptAddOrder.json.userID = resAddUser.body.data.user.id;
                  dataMain.intUserID = resAddUser.body.data.user.id;
                  CheckOrderFulfilment(reqOptCheckExtOrderExists, reqOptAddOrder, reqOptAddOrderProduct, reqOptUpdateStock, dataMain);
                })
              }
            })

          } else {
            console.log(resUserCheck);
          }
        })

      } else if(resPostCodeCheck.statusCode === 204) {
        console.log("We do not cover this postcode area.");
      } else {
        console.log("Wrong Postcode input.");
      }
    });

    res.status(200).json({
      status: "If Kaientai can fulfil it, we will send you a confirmation email."
    })
  } catch (error) {
    console.log(error)
  }
})


let CheckOrderFulfilment = async (reqOptCheckExtOrderExists, reqOptAddOrder, reqOptAddOrderProduct, reqOptUpdateStock, dataMain) =>  {
  // CHECK IF ORDER CAN BE FULFILED
  let orderToBeFulfilledCount = 0;
  let orderToBeFulfilled = false;
  request(reqOptGetProductVariantOptions, (err, resGetProductVariantOptions, body) => {
    let listOfProductVariantOption = JSON.parse(body);
    listOfProductVariantOption = listOfProductVariantOption.data.productVariantOptions;

    // ORDER ITEMS QUANTITY <= STOCK ITEMS QUANTITY
    dataMain.orderProducts.forEach(orderItem => {
      for (let i = 0; i < listOfProductVariantOption.length; i++) {
        let stockItem = listOfProductVariantOption[i];
        if(stockItem.name.toLowerCase() === orderItem.title.toLowerCase() && orderItem.quantity <= stockItem.stock){
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
      request(reqOptCheckExtOrderExists, (err, resCheckExtOrderExists, body) => {
        let bool;
        for(var prop in resCheckExtOrderExists.body.data) {
          if(resCheckExtOrderExists.body.data.hasOwnProperty(prop)){
            bool = false;
          } else {
            bool = true;
          }
        }

        if(!bool) {
          // ADDING ORDER
          request(reqOptAddOrder, (err, resAddOrder, body) => {
            const orderID = resAddOrder.body.data.order.id;
            reqOptAddOrderProduct.json.orderID = orderID;
            dataMain.orderID = orderID;

            // ADDING ORDER PRODUCTS
            //ITERATE OVER ORDER ITEMS
            for (let i = 0; i < dataMain.orderProducts.length; i++) {
              const orderItem = dataMain.orderProducts[i];
              // ITERATE OVER STOCK ITEMS
              for (let i = 0; i < listOfProductVariantOption.length; i++) {
                const stockItem = listOfProductVariantOption[i];
                if(stockItem.name.toLowerCase() === orderItem.title.toLowerCase()){
                  // ADD ORDER PRODUCT
                  reqOptAddOrderProduct.json.productVariantOptionID = stockItem.id;
                  reqOptAddOrderProduct.json.quantity = orderItem.quantity;
  
                  request(reqOptAddOrderProduct, (err, resAddOrderProduct, body) => {
                    console.log("ORDER PRODUCT ADDED: " + stockItem.name);
                    // UPDATE STOCK = STOCK - ORDER
                    reqOptUpdateStock.json.id = stockItem.id
                    reqOptUpdateStock.json.stock = stockItem.stock - orderItem.quantity;
                    request(reqOptUpdateStock, (err, resUpdateStock, body) => {
                      console.log("STOCK UPDATED FOR: " + stockItem.name);
                    })
                  })
                }
              }
            }

            email.SendEmailToKaientai(dataMain);
            email.SendEmailToSupplier(dataMain);
          })
        } else {
          console.log("Order already exists.");
        }
      })
    } else {
      console.log("Order cannot be fulfiled.");
    }
  })
}


module.exports = router;