import express from 'express';
import db from '../db';
import request from 'request';
import { productCheckIfEnoughStock } from '../auxillary/product';

const router = express.Router();
let currentURL = process.env.URL;

// GET ORDER PRODUCTS
router.get('/api/v1/orderProducts/:orderID', async (req, res) => {
  try {
    const results = await db.query(`SELECT * FROM public."OrderProduct" WHERE "orderID" = $1;`, [
      req.params.orderID
    ])
    if(results.rowCount > 0){
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
    console.log(error);
  }
});

// GET ORDER PRODUCT
router.get('/api/v1/orderProduct/:id', async (req, res) => {
  try {
    const result = await db.query(
      'SELECT * FROM public."OrderProduct" WHERE id = $1;', [
      req.params.id
    ])
    if (result.rowCount > 0) {
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
    console.log(error);
  }
});

// CREATE ORDER PRODUCT
router.post('/api/v1/orderProduct', async (req, res) => {
  try {
    // Check if Order Product already exists
    const resultOrderProductExists = await db.query(
    'SELECT * FROM public."OrderProduct" WHERE "orderID"=$1 and "productID"=$2;', [
      req.body.orderID,
      req.body.productID
    ])
    if(resultOrderProductExists.rowCount > 0) {
      let orderProductUpdateOptsRes = {
        url: `${currentURL}/api/v1/orderProduct/stock`,
        method: 'PUT',
        json: {
          "orderProductID": resultOrderProductExists.rows[0].id,
          "productID": resultOrderProductExists.rows[0].productID,
          "quantity": req.body.quantity
        },
      };
      request(orderProductUpdateOptsRes, (error, resOrderUpdate, body) => {
        res.status(201).json({
          status: "Order Product already exists. Updating existing one.",
          data: {
            orderProduct: resultOrderProductExists.rows[0]
          }
        })
      })
    } else {
      const result = await db.query(
        'INSERT INTO public."OrderProduct" ("orderID", quantity, "productID") VALUES ($1, $2, $3) returning *', [
        req.body.orderID,
        req.body.productID,
        req.body.quantity
      ])
      
      if(result.rowCount > 0) {
        res.status(201).json({
          status: "OK",
          data: {
            orderProduct: result.rows[0]
          }
        })
      } else {
        res.status(500).json({
          status: "Not sure what happened."
        })
      }
    }
  } catch (error) {
    console.log(error);
  }
});

// UPDATE ORDER PRODUCT + STOCK
router.put('/api/v1/orderProduct/stock', async (req, res) => {
  try {
    const newProductStock = await productCheckIfEnoughStock(req.body)

    // Check if stock is not negative
    if(newProductStock >= 0){
      
      // Update quantity of Order Product
      const newOrderProductResult = await db.query(
        'UPDATE public."OrderProduct" SET quantity=$1 WHERE id=$2 returning *', [
        req.body.quantity,
        req.body.orderProductID
      ])

      // Update stock of Product
      const newProductResult = await db.query('UPDATE public."Product" SET stock=$1 WHERE id=$2 returning *', [
        newProductStock,
        req.body.productID
      ])
  
      if(newOrderProductResult.rowCount > 0) {
        if(newProductResult.rowCount > 0){
          res.status(201).json({
            status: "OK",
            data: {
              product: newProductResult.rows[0]
            }
          })
        } else {
          res.status(500).json({
            status: "Not sure what happened. Something went wrong with updating Product stock."
          })
        }
      } else {
        res.status(500).json({
          status: "Not sure what happened. Something went wrong with updating Order Product quantity."
        })
      }
    } else {
      res.status(400).json({
        status: "Not enough stock."
      })
    }
    
  } catch (error) {
    console.log(error);
  }
});

// DELETE ORDER PRODUCT
router.delete('/api/v1/orderProduct/:id', async (req, res) => {
  try {
    const resultGET = await db.query(
      'SELECT * FROM public."OrderProduct" WHERE id = $1;', [
      req.params.id
    ])
    await db.query(
      'DELETE FROM public."OrderProduct" WHERE id = $1',[
      req.params.id
    ])
    if (resultGET.rowCount > 0) {
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
    console.log(error);
  }
});

// DELETE ORDER PRODUCTS FROM ORDER
router.delete('/api/v1/orderProducts/:orderID', async (req, res) => {
  try {
    const resultGET = await db.query(
      'SELECT * FROM public."OrderProduct" WHERE "orderID" = $1;', [
      req.params.orderID
    ])
    await db.query(
      'DELETE FROM public."OrderProduct" WHERE "orderID" = $1',[
      req.params.orderID
    ])
    if (resultGET.rowCount > 0) {
      res.status(200).json({
        status: "OK",
        data: {
          orderProducts: resultGET.rows
        }
      })
    } else {
      res.status(204).json({
        status: "ID did not match."
      });
    }
  } catch (error) {
    console.log(error);
  }
});

export default router;