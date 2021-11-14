const express = require('express');
const db = require('../db');

const router = express.Router();

// GET ADDRESSES
router.get('/api/v1/addresses', async (req, res) => {
  try {
    const results = await db.query(`SELECT * FROM public."Address";`)

    if (results.rowCount > 0) {
      res.status(200).json({
        status: "OK",
        data: {
          addresses: results.rows
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

// GET ADDRESS
router.get('/api/v1/address/:id', async (req, res) => {
  try {
    const result = await db.query(
      'SELECT * FROM public."Address" WHERE id = $1;', [
      req.params.id
    ])
    
    if (result.rowCount > 0) {
      res.status(200).json({
        status: "OK",
        data: {
          address: result.rows[0]
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

// CREATE ADDRESS
router.post('/api/v1/address', async (req, res) => {
  try {
    const result = await db.query(
      'INSERT INTO public."Address"(address1, address2, city, county, country, postcode) VALUES ($1, $2, $3, $4, $5, $6) returning *', [
      req.body.address1,
      req.body.address2,
      req.body.city,
      req.body.county,
      req.body.country,
      req.body.postcode
    ])
    if(result.rowCount > 0) {
      res.status(201).json({
        status: "OK",
        data: {
          address: result.rows[0]
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

// UPDATE ADDRESS
router.put('/api/v1/address', async (req, res) => {
  try {
    const result = await db.query(
      'UPDATE public."Address" SET address1=$2, address2=$3, city=$4, county=$5, country=$6, postcode=$7 WHERE id = $1 returning *',[
      req.body.id,
      req.body.address1,
      req.body.address2,
      req.body.city,
      req.body.county,
      req.body.country,
      req.body.postcode
    ])
    if (result.rowCount > 0) {
      res.status(200).json({
        status: "OK",
        data: {
          address: result.rows[0]
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

// DELETE ADDRESS
router.delete('/api/v1/address/:id', async (req, res) => {
  try {
    const resultGET = await db.query(
      'SELECT * FROM public."Address" WHERE id = $1;', [
      req.params.id
    ])
    await db.query(
      'DELETE FROM public."Address" WHERE id = $1',[
      req.params.id
    ])
    if (resultGET.rows.length > 0) {
      res.status(200).json({
        status: "OK",
        data: {
          address: resultGET.rows[0]
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