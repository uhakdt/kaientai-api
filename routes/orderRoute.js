const express = require('express');
const db = require('../db');
const request = require('request');

const router = express.Router();


// GET ORDERS
router.get('/api/v1/orders', async (req, res) => {
  try {
    const results = await db.query(`SELECT * FROM public."Order";`)

    if (results.rowCount > 0) {
      res.status(200).json({
        status: "OK",
        data: {
          orders: results.rows
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

// GET ORDERS BY SUPPLIERID
router.get('/api/v1/orders/perSupplier/:supplierID', async (req, res) => {
  try {
    const results = await db.query('SELECT * FROM public."Order" WHERE "supplierID"=$1;', [
      req.params.supplierID
    ])

    if (results.rowCount > 0) {
      res.status(200).json({
        status: "OK",
        data: {
          orders: results.rows
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

// GET ORDER
router.get('/api/v1/order/:id', async (req, res) => {
  try {
    const result = await db.query(
      'SELECT * FROM public."Order" WHERE id = $1 ;', [
      req.params.id
    ])
    if (result.rowCount > 0) {
      res.status(200).json({
        status: "OK",
        data: {
          order: result.rows[0]
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

// CHECK EXTERNAL ORDER EXISTS
router.get('/api/v1/order/ext/:id', async (req, res) => {
  try {
    const result = await db.query(
      'SELECT * FROM public."Order" WHERE "extOrderID" = $1 ;', [
      req.params.id
    ])
    if (result.rowCount > 0) {
      res.status(200).json({
        status: "OK",
        data: {
          order: result.rows[0]
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
})

// CREATE ORDER
router.post('/api/v1/order', async (req, res) => {
  try {
    // Create Order
    const resultCreateOrder = await db.query(
      'INSERT INTO public."Order"("dateAndTime", "statusID", "supplierID", "userID", "totalAmount", "contactName", "contactEmail", "contactPhone", address1, address2, city, county, country, postcode, "offerID", "extOrderID") VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16) returning *', [
      req.body.dateAndTime,
      req.body.statusID,
      req.body.supplierID,
      req.body.userID,
      req.body.totalAmount,
      req.body.contactName,
      req.body.contactEmail,
      req.body.contactPhone,
      req.body.address1,
      req.body.address2,
      req.body.city,
      req.body.county,
      req.body.country,
      req.body.postcode,
      req.body.offerID,
      req.body.extOrderID
    ])
    res.status(201).json({
      status: "OK",
      data: {
        order: result.rows[0]
      }
    })
  } catch (error) {
    console.log(error);
  }
});

// UPDATE ORDER
router.put('/api/v1/order', async (req, res) => {
  try {
    const result = await db.query(
      'UPDATE public."Order" SET "dateAndTime"=$2, "statusID"=$3, "supplierID"=$4, "userID"=$5, "totalAmount"=$6, "contactName"=$7, "contactEmail"=$8, "contactPhone"=$9, address1=$10, address2=$11, city=$12, county=$13, country=$14, postcode=$15, "offerID"=$16, "extOrderID"=$17 WHERE id = $1 returning *',[
      req.body.id,
      req.body.dateAndTime,
      req.body.statusID,
      req.body.supplierID,
      req.body.userID,
      req.body.totalAmount,
      req.body.contactName,
      req.body.contactEmail,
      req.body.contactPhone,
      req.body.address1,
      req.body.address2,
      req.body.city,
      req.body.county,
      req.body.country,
      req.body.postcode,
      req.body.offerID,
      req.body.extOrderID
    ])
    if (result.rowCount > 0) {
      res.status(200).json({
        status: "OK",
        data: {
          order: result.rows[0]
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

// DELETE ORDER
router.delete('/api/v1/order', async (req, res) => {
  try {
    const resultGET = await db.query(
      'SELECT * FROM public."Order" WHERE id = $1;', [
      req.body.id
    ])
    await db.query(
      'DELETE FROM public."Order" WHERE id = $1',[
      req.body.id
    ])
    if (resultGET.rows.length > 0) {
      res.status(200).json({
        status: "OK"
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