const express = require('express');
const db = require("../db");

const router = express.Router();


// GET PRODUCT VARIANT OPTIONS
router.get('/api/v1/productVariantOptions', async (req, res) => {
  try {
    const results = await db.query(`SELECT * FROM public."ProductVariantOption";`)
    
    if (results.rows.length > 0) {
      res.status(200).json({
        status: "OK",
        data: {
          productVariantOptions: results.rows
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

// GET PRODUCT VARIANT OPTION
router.get('/api/v1/productVariantOption', async (req, res) => {
  try {
    const result = await db.query(`SELECT * FROM public."ProductVariantOption" WHERE id=$1;`,[
      req.body.id
    ])
    if(result.rows.length > 0) {
      res.status(200).json({
        status: "OK",
        data: {
          productVariantOption: result.rows[0]
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

// CREATE PRODUCT VARIANT OPTION
router.post('/api/v1/productVariantOption', async (req, res) => {
  try {
    const result = await db.query(
      'INSERT INTO public."ProductVariantOption"("productVariantID", name, price, stock, "specificDescription", "productRatingID", active, "supplierID") VALUES ($1, $2, $3, $4, $5, $6, $7, $8) returning *', [
      req.body.productVariantID,
      req.body.name,
      req.body.price,
      req.body.stock,
      req.body.specificDescription,
      req.body.productRatingID,
      req.body.active,
      req.body.supplierID,
    ])
    res.status(201).json({
      status: "OK",
      data: {
        productVariantOption: result.rows[0]
      }
    })
  } catch (error) {
    console.log(error);
  }
});

// UPDATE PRODUCT VARIANT OPTION
router.put('/api/v1/productVariantOption', async (req, res) => {
  try {
    const result = await db.query(
      'UPDATE public."ProductVariantOption" SET "productVariantID"=$2, name=$3, price=$4, stock=$5, "specificDescription"=$6, "productRatingID"=$7, active=$8, "supplierID"=$9 WHERE id=$1 returning *', [
      req.body.id,
      req.body.productVariantID,
      req.body.name,
      req.body.price,
      req.body.stock,
      req.body.specificDescription,
      req.body.productRatingID,
      req.body.active,
      req.body.supplierID,
    ])
    if (result.rows.length > 0) {
      res.status(200).json({
        status: "OK",
        data: {
          productVariantOption: result.rows[0]
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

// UPDATE STOCK
router.put('/api/v1/productVariantOption/stock', async (req, res) => {
  try {
    const result = await db.query('UPDATE public."ProductVariantOption" SET stock=$2 WHERE id=$1;', [
      req.body.id,
      req.body.stock
    ])
    if(result.rows.length > 0) {
      res.status(200).json({
        status: "OK",
        data: {
          productVariantOption: result.rows[0]
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

// DELETE PRODUCT VARIANT OPTION
router.delete('/api/v1/productVariantOption', async (req, res) => {
  try {
    const resultGET = await db.query(
      'SELECT * FROM public."ProductVariantOption" WHERE id = $1;', [
      req.body.id
    ])
    await db.query(
      'DELETE FROM public."ProductVariantOption" WHERE id = $1',[
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