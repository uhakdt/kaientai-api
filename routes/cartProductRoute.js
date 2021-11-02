const express = require('express');
const db = require('../db');

const router = express.Router();

// GET CART PRODUCTS
router.get('/api/v1/cartProducts/:email', async (req, res) => {
  try {
    const results = await db.query(`SELECT * FROM public."CartProduct" WHERE email = $1;`, [
      req.params.email
    ])

    if (results.rows.length > 0) {
      res.status(200).json({
        status: "OK",
        data: {
          cartProducts: results.rows
        }
      });
    } else {
      res.status(204).json({
        status: "No Results."
      });
    }
  } catch (error) {
    console.log(error)
  }
});

// GET CART PRODUCT
router.get('/api/v1/cartProduct/:id', async (req, res) => {
  try {
    const result = await db.query(`SELECT * FROM public."CartProduct" WHERE id=$1;`,[
      req.params.id
    ])
    if(result.rows.length > 0) {
      res.status(200).json({
        status: "OK",
        data: {
          cartProduct: result.rows[0]
        }
      })
    } else {
      res.status(204).json({
        status: "ID did not match."
      })
    }
  } catch (error) {
    console.log(error)
  }
});

// CREATE CART PRODUCT
router.post('/api/v1/cartProduct', async (req, res) => {
  try {
    // Check if Cart Product of same product already exists (to add instead of create new one if yes)
    console.log("running /cartProduct");
    const result = await db.query('SELECT * FROM public."CartProduct" WHERE email = $1 and title = $2;', [
      req.body.email,
      req.body.title
    ])
    if(result.rows.length > 0){
      console.log("cart product exists");
      const finalResult = await db.query('UPDATE public."CartProduct"	SET quantity=$1	WHERE email = $2 and title = $3 returning *;', [
        req.body.quantity + result.rows[0].quantity,
        req.body.email,
        req.body.title
      ])
      console.log("finalResult: ", finalResult);
      const oldStock = await db.query('SELECT * FROM public."Product" WHERE title=$1;', [
        req.body.title
      ])
      console.log("result oldStock: ", oldStock);
      const resutlUpdateProduct = await db.query('UPDATE public."Product" SET stock=$1 WHERE title=$2 returning *', [
        oldStock.rows[0].stock - req.body.quantity,
        req.body.title
      ])
      console.log("result UpdateProduct: ", resutlUpdateProduct);
      res.status(200).json({
        status: "Updated Successfully.",
        data: {
          cartProduct: finalResult.rows[0]
        }
      })
    } else {
      console.log("cart product doesnt exist");
      const finalResult = await db.query(
        'INSERT INTO public."CartProduct"("userID", title, price, "imageUrl", quantity, email) VALUES ($1, $2, $3, $4, $5, $6) returning *', [
        req.body.userID,
        req.body.title,
        req.body.price,
        req.body.imageUrl,
        req.body.quantity,
        req.body.email
      ])
      const oldStock = await db.query('SELECT * FROM public."Product" WHERE title = $1;', [
        req.body.title
      ])
      await db.query('UPDATE public."Product" SET stock=$2 WHERE title=$1;', [
        req.body.title,
        oldStock.rows[0].stock - req.body.quantity
      ])
      res.status(201).json({
        status: "Cart Product Added.",
        data: {
          cartProduct: finalResult.rows[0]
        }
      })
    }

  } catch (error) {
    console.log(error);
  }
});

// UPDATE CART PRODUCT QUANTITY AND STOCK
router.put('/api/v1/cartProduct/stock', async (req, res) => {
  try {
    const currentStockOfProduct = await db.query('SELECT stock FROM public."Product" WHERE title = $1', [
      req.body.title
    ])
    const currentCartProductQuantity = await db.query('SELECT * FROM public."CartProduct" WHERE title = $1', [
      req.body.title
    ])
    let cartProductQty = currentCartProductQuantity.rows[0].quantity;
    let oldStock = currentStockOfProduct.rows[0].stock;
    let newStock;

    // Check the Operator and check if stock is available
    if(req.body.operator === "-" && oldStock >= cartProductQty){
      // Check if quantity of cart is going negative
      console.log(cartProductQty)
      if(cartProductQty - 1 > 0){
        newStock = oldStock + 1
        const resultProduct = await db.query(
          `UPDATE public."Product" SET stock=$1 WHERE title=$2 returning *;`, [
          newStock,
          req.body.title
        ])
        const resultCartProduct = await db.query(
          `UPDATE public."CartProduct" SET quantity=$1 WHERE id=$2 returning *;`, [
          cartProductQty - 1,
          req.body.id
        ])
        let result = [];
        result.push(resultProduct.rows[0])
        result.push(resultCartProduct.rows[0])
        console.log(result)
        if(result.rowCount > 0) {
          res.status(200).json({
            status: "OK",
            data: {
              product: result.rows[0]
            }
          })
        } else {
        }
      } else {
        await db.query(
          `DELETE FROM public."CartProduct" WHERE id=$1 returning *;`, [
          req.body.id
        ])
        res.status(204).json({
          status: "Deleted Cart Product."
        })
      }
    } else if(req.body.operator === "+"){
      newStock = oldStock - 1
      const resultProduct = await db.query(
        `UPDATE public."Product" SET stock=$1 WHERE title=$2 returning *;`, [
        newStock,
        req.body.title
      ])
      const resultCartProduct = await db.query(
        `UPDATE public."CartProduct" SET quantity=$1 WHERE id=$2 returning *;`, [
        cartProductQty + 1,
        req.body.id
      ])
      let result = [];
      result.push(resultProduct.rows[0])
      result.push(resultCartProduct.rows[0])
      if(result.rowCount > 0) {
        res.status(200).json({
          status: "OK",
          data: {
            product: result.rows[0]
          }
        })
      } else {
        res.status(204).json({
          status: "ID does not match."
        })
      }
    } else {
      res.status(400).json({
        status: "Out of Stock or something else is wrong."
      })
    }


  } catch (error) {
    console.log(error)
  }
});

// DELETE CART PRODUCT
router.delete('/api/v1/cartProduct/:id', async (req, res) => {
  try {
    const resultGET = await db.query(
      'SELECT * FROM public."Product" WHERE id = $1;', [
      req.params.id
    ])
    await db.query(
      'DELETE FROM public."Product" WHERE id = $1',[
      req.params.id
    ])
    if (resultGET.rowCount > 0) {
      res.status(200).json({
        status: "OK",
        data: {
          cartProduct: resultGET.rows[0]
        }
      })
    } else {
      res.status(204).json({
        status: "ID did not match."
      })
    }
  } catch (error) {
    console.log(error)
  }
});

// DELETE CART PRODUCTS BY USER
router.delete('/api/v1/cartProducts/:userID', async (req, res) => {
  try {
    const resultGET = await db.query(
      'SELECT * FROM public."CartProduct" WHERE "userID" = $1;', [
      req.params.userID
    ])
    await db.query(
      'DELETE FROM public."CartProduct" WHERE "userID" = $1',[
      req.params.userID
    ])
    if (resultGET.rowCount > 0) {
      res.status(200).json({
        status: "OK",
        data: {
          cartProducts: resultGET.rows[0]
        }
      })
    } else {
      res.status(204).json({
        status: "ID did not match."
      })
    }
  } catch (error) {
    console.log(error)
  }
});


module.exports = router;