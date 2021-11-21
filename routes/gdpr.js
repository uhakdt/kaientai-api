import express from 'express';
import db from '../db';

const router = express.Router();

// SHOPIFY GET CUSTOMERS DATA REQUEST
router.post('/api/v1/shopify/customers/dataRequest', async (req, res) => {
  try {
    let orderResults = [];
    if(req.body.orders_requested.length > 0) {
      for (let i = 0; i < req.body.orders_requested.length; i++) {
        const e = req.body.orders_requested[i];
        let tempResult = await db.query(`SELECT * FROM public."Order" WHERE "extOrderID" = $1;`, [
          e
        ])
        tempResult.rowCount > 0 ? orderResults.push(tempResult.rows[0]) : null
      }
    }
    if(req.body.customer.email != null) {
      let userRes = await db.query('SELECT * FROM public."User" WHERE email=$1;', [
        req.body.customer.email
      ])
      if(userRes.rowCount > 0){
        let addressResult = await db.query('SELECT * FROM public."Address" WHERE id=$1', [
          userRes.rows[0].addressID
        ])

        let user = userRes.rows[0]
        let address = addressResult.rows[0]
        let userResult = {
          name: user.name,
          email: user.email,
          phone: user.phone,
          address1: address.address1,
          address2: address.address2,
          city: address.city,
          county: address.county,
          country: address.country,
          dateAndTimeSignUp: user.dateAndTimeSignUp,
          userID: user.extUserID
        }
        res.status(200).json({
          status: "OK",
          data: {
            orders: orderResults,
            user: userResult
          }
        });
      } else {
        res.status(204).json({
          status: "User cannot be found."
        });
      }

    } else {
      res.status(204).json({
        status: "No Data in body."
      });
    }
  } catch (error) {
    console.log(error);
  }
});

// SHOPIFY DELETE CUSTOMER
router.delete('/api/v1/shopify/customers/redact', async (req, res) => {
  try {
    const resultGET = await db.query(
      'SELECT * FROM public."User" WHERE email = $1;', [
      req.body.customer.email
    ])
    await db.query(
      'DELETE FROM public."User" WHERE email = $1',[
      req.body.customer.email
    ])
    if (resultGET.rows.length > 0) {
      res.status(200).json({
        status: "OK",
        data: {
          user: resultGET.rows[0]
        }
      })
    } else {
      res.status(204).json({
        status: "ID did not match."
      })
    }
  } catch (error) {
    console.log(error);
  }
});

// SHOPIFY DELETE SUPPLIER + SUPPLIERS CUSTOMERS DATA
router.delete('/api/v1/shopify/shop/redact', async (req, res) => {
  try {
    const supplierResult = await db.query(
      'SELECT * FROM public."Supplier" WHERE "extID"=$1;', [
        req.body.shop_id
      ]
    )

    if (supplierResult.rowCount > 0) {
      const resultGET = await db.query(
        'SELECT * FROM public."User" WHERE "supplierID" = $1;', [
        supplierResult.rows[0].id
      ])
      await db.query(
        'DELETE FROM public."User" WHERE "supplierID" = $1',[
        supplierResult.rows[0].id
      ])
      await db.query(
        'DELETE FROM public."Supplier" WHERE "extID"=$1;',[
        req.body.shop_id
      ])

      if (resultGET.rows.length > 0) {
        res.status(200).json({
          status: "OK",
          data: {
            supplier: supplierResult.rows[0],
            users: resultGET.rows
          }
        })
      } else {
        res.status(204).json({
          status: "ID did not match."
        })
      }
      
    }
  } catch (error) {
    console.log(error);
  }
});

export default router;