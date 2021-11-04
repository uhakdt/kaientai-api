const express = require('express');
const db = require('../db');

const router = express.Router();

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
    console.log(error)
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
    console.log(error)
  }
});

// CREATE ORDER PRODUCT
router.post('/api/v1/orderProduct', async (req, res) => {
  try {
    const result = await db.query(
      'INSERT INTO public."OrderProduct" ("orderID", title, quantity) VALUES ($1, $2, $3) returning *', [
      req.body.orderID,
      req.body.title,
      req.body.quantity,
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
  } catch (error) {
    console.log(error);
  }
});

// UPDATE ORDER PRODUCT + STOCK + CHECK IF CAN BE DONE
router.put('/api/v1/orderProduct/stock', async (req, res) => {
  try {
    // Old Product Stock + Old Order Product Stock
    const oldProductStock = await db.query('SELECT stock FROM public."Product" WHERE title=$1', [
      req.body.title
    ])
    const oldOrderProductStock = await db.query('SELECT quantity FROM public."OrderProduct" WHERE id=$1', [
      req.body.id
    ])

    // Calculate => newProductStock = oldProductStock - (newOrderProductStock - newOrderProductStock)
    const newProductStock = oldProductStock.rows[0].stock - (req.body.quantity - oldOrderProductStock.rows[0].quantity);
    
    // Check if there is enough stock if OrderProduct quantity new > old
    if(newProductStock >= 0){
      // Update quantity of Order Product
      const newOrderProductResult = await db.query(
        'UPDATE public."OrderProduct" SET quantity=$1 WHERE id=$2 returning *', [
        req.body.quantity,
        req.body.id
      ])
      // Update stock of Product
      const newProductResult = await db.query('UPDATE public."Product" SET stock=$1 WHERE title=$2 returning *', [
        newProductStock,
        req.body.title
      ])
  
      if(newOrderProductResult.rowCount > 0) {
        if(newProductResult.rowCount > 0){
          res.status(201).json({
            status: "OK",
            data: {
              orderProduct: newProductResult.rows[0]
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
    console.log(error)
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
          orderProducts: resultGET.rows[0]
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