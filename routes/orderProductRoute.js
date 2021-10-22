const e = require('express');
const express = require('express');
const request = require('request');
const db = require("../db");

const router = express.Router();


// GET ORDER PRODUCTS
router.get('/api/v1/orderProducts', async (req, res) => {
  try {
    const results = await db.query(`SELECT * FROM public."OrderProduct" WHERE "orderID" = $1;`, [
      req.body.orderID
    ])
    if(results.rows.length > 0){
      res.status(200).json({
        status: "OK",
        data: {
          orderProducts: results.rows
        }
      })
    } else {
      res.status(204).json({
        status: "No Results."
      })
    }
  } catch (error) {
    console.log(error)
  }
});

// GET ORDER PRODUCT
router.get('/api/v1/orderProduct', async (req, res) => {
  try {
    const result = await db.query(
      'SELECT * FROM public."OrderProduct" WHERE id = $1;', [
      req.body.id
    ])
    if (result.rows.length > 0) {
      res.status(200).json({
        status: "OK",
        data: {
          orderProduct: result.rows[0]
        }
      })
    } else {
      res.status(204).json({
        status: "ID did not match."
      });
    }
  } catch (error) {
    console.log(error)
  }
});

// CREATE ORDER PRODUCT
router.post('/api/v1/orderProduct', async (req, res) => {
  try {
    const result = await db.query(
      'INSERT INTO public."OrderProduct"("orderID", "productVariantOptionID", quantity) VALUES ($1, $2, $3) returning *', [
      req.body.orderID,
      req.body.productVariantOptionID,
      req.body.quantity,
    ])
    res.status(201).json({
      status: "OK",
      data: {
        orderProduct: result.rows[0]
      }
    })
  } catch (error) {
    console.log(error);
  }
});

// NEEDS SORTING!!!
function NEEDSFIXINGUpdateOrderProductAndStock() {
  // UPDATE ORDERPRODUCT + STOCK
  // router.put('/api/v1/orderProduct', async (req, res) => {
  //   try {
  //     let stockOld;
  //     let stockNew;
  //     let orderProductQuantityOld;
  //     let orderProductQuantityNew = req.body.quantity;
  //     const reqOptGetProductVariantOption = {
  //       url: 'http://localhost:9973/api/v1/productVariantOption',
  //       method: 'GET',
  //       json: {
  //         "id": req.body.productVariantOptionID
  //       },
  //     };
  //     const reqOptGetOrderProduct = {
  //       url: 'http://localhost:9973/api/v1/orderProduct',
  //       method: 'GET',
  //       json: {
  //         "id": req.body.id
  //       },
  //     };
  //     request(reqOptGetProductVariantOption, (err, res, body) => {
  //       stockOld = res.body.data.productVariantOption.stock;
  //     })
  //     request(reqOptGetOrderProduct, (err, res, body) => {
  //       orderProductQuantityOld = res.body.data.orderProduct.quantity;
  //     })
  
  //     const result = await db.query(
  //       'UPDATE public."OrderProduct" SET "orderID"=$2, "productVariantOptionID"=$3, quantity=$4 WHERE id = $1 returning *',[
  //       req.body.id,
  //       req.body.orderID,
  //       req.body.productVariantOptionID,
  //       req.body.quantity,
  //     ])
  
  //     const reqOptUpdateStock = {
  //       url: 'http://localhost:9973/api/v1/productVariantOption/stock',
  //       method: 'PUT',
  //       json: {
  //         "id": result.rows[0].productVariantOptionID,
  //         "stock": stockNew
  //       },
  //     };
  //     stockNew = stockOld + (orderProductQuantityOld - orderProductQuantityNew);
  //     console.log("---------------------------------")
  //     console.log("---------------------------------")
  //     console.log(stockOld)
  //     console.log("---------------------------------")
  //     console.log(orderProductQuantityOld)
  //     console.log("---------------------------------")
  //     console.log(orderProductQuantityNew)
  //     console.log("---------------------------------")
  //     console.log("---------------------------------")
  //     console.log(stockNew);
  
  //     // request(reqOptUpdateStock, (err, res, body) => {
  //     //   console.log("UPDATING STOCK")
  //     // })
  //     if (result.rows.length > 0) {
  //       res.status(200).json({
  //         status: "OK",
  //         data: {
  //           orderProduct: result.rows[0]
  //         }
  //       })
  //     } else {
  //       res.status(204).json({
  //         status: "ID did not match."
  //       });
  //     }
  //   } catch (error) {
  //     console.log(error)
  //   }
  // });
}

// DELETE ORDER PRODUCT
router.delete('/api/v1/orderProduct', async (req, res) => {
  try {
    const resultGET = await db.query(
      'SELECT * FROM public."OrderProduct" WHERE id = $1;', [
      req.body.id
    ])
    await db.query(
      'DELETE FROM public."OrderProduct" WHERE id = $1',[
      req.body.id
    ])
    if (resultGET.rows.length > 0) {
      res.status(200).json({
        status: "OK",
        data: {
          orderProduct: resultGET.rows[0]
        }
      })
    } else {
      res.status(204).json({
        status: "ID did not match."
      });
    }
  } catch (error) {
    console.log(error)
  }
});


module.exports = router;