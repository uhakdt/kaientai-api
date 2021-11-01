const express = require('express');
const db = require('../db');

const router = express.Router();

// GET POSTCODES
router.get('/api/v1/postcodes', async (req, res) => {
  try {
    const results = await db.query(`SELECT * FROM public."Postcode";`)

    if (results.rowCount > 0) {
      res.status(200).json({
        status: "OK",
        data: {
          postcodes: results.rows
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

// GET POSTCODE
router.get('/api/v1/postcode/:id', async (req, res) => {
  try {
    const result = await db.query(`SELECT * FROM public."Postcode" WHERE id=$1;`, [
      req.params.id
    ])

    if (result.rowCount > 0) {
      res.status(200).json({
        status: "OK",
        data: {
          postcode: result.rows[0]
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

// CHECK POSTCODE
router.post('/api/v1/postcode/check', async (req, res) => {
  try {
    // Remove spaces
    let customerPostcode = req.body.postcode;
    customerPostcode = customerPostcode.replace(/\s+/g, '');

    // Take only 1st part of postcode and convert to Upper case
    var arr = customerPostcode.match(/^[a-zA-Z0-9]{2,4}(?=(?:\s*[a-zA-Z0-9]{3})?$)/mg);

    // Check if the Postcode matches standard UK Postcodes
    if(arr !== null){
      customerPostcode = arr[0].toUpperCase();
      const result = await db.query(
        'SELECT * FROM public."Postcode" WHERE postcode = $1;', [
          customerPostcode
        ])
      // Check if we cover this area
      if(result.rowCount > 0) {
        res.status(200).json({
          status: "OK",
          data: {
            postcode: result
          }
        })
      } else {
        await db.query('INSERT INTO public."PostcodeNonLocal"("supplierID", postcode) VALUES ($1, $2);', [
          req.body.supplierID,
          customerPostcode
        ])
        // HTTP Code 204: Empty Response
        res.status(204).json({
          status: "We do not cover this Postcode area yet.",
          data: {
            postcode: customerPostcode
          }
        })
      }
    } else {
      // HTTP Code 400: Wrong Input
      res.status(400).json({
        status: "The Postcode doesn't match the UK postcode standards - please check and try again.",
        data: {
          postcode: customerPostcode
        }
      })
    }
  } catch (error) {
    console.log(error)
  }
});

// CREATE POSTCODE
router.post('/api/v1/postcode', async (req, res) => {
  try {
    const result = await db.query(
      'INSERT INTO public."Postcode" (postcode) SELECT $1 WHERE NOT EXISTS (SELECT id FROM public."Postcode" WHERE postcode = $1) returning *', [
      req.body.postcode,
    ])

    if(result.rowCount > 0){
      res.status(201).json({
        status: "OK",
        data: {
          postcode: result.rows[0]
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

// UPDATE POSTCODE
router.put('/api/v1/postcode', async (req, res) => {
  try {
    const result = await db.query(
      'UPDATE public."Postcode" SET postcode=$2 WHERE id = $1 returning *',[
      req.body.id,
      req.body.postcode
    ])
    if (result.rowCount > 0) {
      res.status(200).json({
        status: "OK",
        data: {
          postcode: result.rows[0]
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

// DELETE POSTCODE
router.delete('/api/v1/postcode/:id', async (req, res) => {
  try {
    const resultGET = await db.query(
      'SELECT * FROM public."Postcode" WHERE id = $1;', [
      req.params.id
    ])
    await db.query(
      'DELETE FROM public."Postcode" WHERE id = $1',[
      req.params.id
    ])
    if (resultGET.rowCount > 0) {
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