import express from 'express';
import db from '../db';
import { GetDateAndTimeNow } from '../auxillary/dateAndTimeNow';

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
    res.status(400).json({ error: error.message });
  }
});

// GET POSTCODE
router.get('/api/v1/postcode/:id', async (req, res) => {
  try {
    const result = await db.query(`SELECT * FROM public."Postcode" WHERE id=$1;`, [req.params.id])

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
    res.status(400).json({ error: error.message });
  }
});

// CHECK POSTCODE
router.post('/api/v1/postcode/check', async (req, res) => {
  try {
    // Remove spaces
    let customerPostcode = req.body.code;
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
            postcode: customerPostcode
          },
          local: 'yes'
        })
      } else {
        const nonLocalPostcodeResult = await db.query('INSERT INTO public."PostcodeNonLocal" ("supplierID", postcode, "dateAndTime") VALUES ($1, $2, $3) returning *', [
          req.body.supplierID,
          customerPostcode,
          GetDateAndTimeNow()
        ])
        // HTTP Code 204: Empty Response
        res.status(200).json({
          status: "We do not cover this Postcode area yet.",
          data: {
            postcode: nonLocalPostcodeResult.rows[0],
          },
          local: 'no'
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
    res.status(400).json({ error: error.message });
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
    res.status(400).json({ error: error.message });
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
    res.status(400).json({ error: error.message });
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
    res.status(400).json({ error: error.message });
  }
});

export default router;