const express = require('express');
const db = require('../db');
const request = require('request');
const email = require('../auxillary/email');

const router = express.Router();


Date.prototype.addHours = function(h) {
  this.setTime(this.getTime());
  return this;
}

let currentURL = process.env.URL_PROD;

if(process.env.NODE_ENV === 'Development') {
  currentURL = process.env.URL_DEV
}

const reqOptGetProducts = {
  url: `${currentURL}/api/v1/products`,
  method: 'GET'
};


router.post('/api/v1/klf/woocommerce/:supplierID', async (req, res) => {
  try {
    let dt = new Date().addHours(1).toISOString().replace('T', ' ').replace();
    dt = dt.substring(0, dt.length - 5);

    // Variable declarations
    let listOfOrderProducts = []
    let orderProduct = {
      userID: null,
      title: null,
      price: null,
      imageUrl: null,
      quantity: null,
      email: null
    }
    for (let i = 0; i < req.body.dataBody.line_items.length; i++) {
      const e = req.body.dataBody.line_items[i];
      orderProduct.title = e.name;
      orderProduct.price = e.price;
      orderProduct.quantity = e.quantity;
      orderProduct.email = req.body.dataBody.billing.email;
      listOfOrderProducts.push(orderProduct);
    }

    let dataMain = {
      orderID: null,
      name: req.body.dataBody.shipping.first_name + req.body.dataBody.shipping.last_name,
      email: req.body.dataBody.billing.email,
      phone: req.body.dataBody.billing.phone,
      address1: req.body.dataBody.shipping.address_1,
      address2: req.body.dataBody.shipping.address_2,
      city: req.body.dataBody.shipping.city,
      county: "",
      country: req.body.dataBody.shipping.country,
      postcode: req.body.dataBody.shipping.postcode,
      intUserID: null,
      extUserID: req.body.dataBody.customer_id,
      orderProducts: listOfOrderProducts,
      totalAmount: req.body.dataBody.total,
      extOrderID: req.body.dataBody.id,
      supplierID: req.params.supplierID,
      supplierContactName: "Friendly Soaps",
      supplierContactEmail: "mierdluffy@gmail.com",
      dateAndTime: dt
    }

    const reqOptPostCodeCheck = {
      url: `${currentURL}/api/v1/postcode/check`,
      method: 'POST',
      json: {
        "supplierID": dataMain.supplierID,
        "code": dataMain.postcode
      },
    };
    
    const reqOptUserCheck = {
      url: `${currentURL}/api/v1/user/ext/${dataMain.extUserID}`,
      method: 'POST'
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
  request(reqOptGetProducts, (err, resGetProducts, body) => {
    let listOfProduct = JSON.parse(body);
    listOfProduct = listOfProduct.data.products;

    // ORDER ITEMS QUANTITY <= STOCK ITEMS QUANTITY
    dataMain.orderProducts.forEach(orderItem => {
      for (let i = 0; i < listOfProduct.length; i++) {
        let stockItem = listOfProduct[i];
        // console.log("StockItem: ", stockItem)
        // console.log("Qty: ", stockItem.quantity)
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
      request(reqOptCheckExtOrderExists, (err, resCheckExtOrderExists, body) => {
        let bool;
        if(body.includes("order")){
          bool = true
        } else {
          bool = false;
        }
        if(!bool) {
          // ADDING ORDER
          request(reqOptAddOrder, (err, resAddOrder, body) => {
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
                  request(reqOptUpdateStock, (err, resUpdateStock, body) => {
                    console.log("Updating stock")
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