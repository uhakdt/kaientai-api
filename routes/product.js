import express from 'express';
import db from '../db';
import { productsFormatShopify } from '../auxillary/product.js'

const router = express.Router();

// GET PRODUCTS
router.get('/api/v1/products', async (req, res) => {
  try {
    const results = await db.query(`SELECT * FROM public."Product";`)
    
    if (results.rowCount > 0) {
      res.status(200).json({
        status: "OK",
        data: {
          products: results.rows
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

// GET PRODUCTS PER SUPPLIER
router.get('/api/v1/products/:supplierID', async (req, res) => {
  try {
    const results = await db.query(`SELECT * FROM public."Product" WHERE "supplierID"=$1;`,[req.params.supplierID])
    
    if (results.rowCount > 0) {
      res.status(200).json({
        status: "OK",
        data: {
          products: results.rows
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

// GET PRODUCTS IN STOCK
router.get('/api/v1/products/inStock', async (req, res) => {
  try {
    const results = await db.query(`SELECT * FROM public."Product" WHERE stock != 0;`)
    
    if (results.rowCount > 0) {
      res.status(200).json({
        status: "OK",
        data: {
          products: results.rows
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

// GET PRODUCT
router.get('/api/v1/product/:id', async (req, res) => {
  try {
    const result = await db.query(`SELECT * FROM public."Product" WHERE id=$1;`,[
      req.params.id
    ])
    if(result.rowCount > 0) {
      res.status(200).json({
        status: "OK",
        data: {
          product: result.rows[0]
        }
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

// CREATE PRODUCT
router.post('/api/v1/product', async (req, res) => {
  try {
    const result = await db.query(
      'INSERT INTO public."Product"("supplierID", title, "imageUrl", price, stock, "extID") VALUES ($1, $2, $3, $4, $5, $6) returning *', [
      req.body.supplierID,
      req.body.title,
      req.body.imageUrl,
      req.body.price,
      req.body.stock,
      req.body.extID
    ])
    if(result.rowCount > 0){
      res.status(201).json({
        status: "OK",
        data: {
          product: result.rows[0]
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

// CREATE PRODUCTS
router.post('/api/v1/products/:supplierID/:platform', async (req, res) => {
  try {
    let results = [];
    const listOfProducts = req.params.platform === 'shopify' ? productsFormatShopify(req.body.listOfProducts, req.params.supplierID) : req.body;
    // Go through all products from the request body
    for (let i = 0; i < listOfProducts.length; i++) {
      let product = listOfProducts[i];
      
      // check if the product is already in the db
      let checkIfProductExists = await db.query('SELECT * FROM public."Product" WHERE "extID" = $1;', [
        product.extID
      ])
      if(checkIfProductExists.rowCount === 0) {
        let productRes = await db.query(
          'INSERT INTO public."Product" ("supplierID", title, price, stock, "extID", "dimensionsCm", "weightGrams") VALUES ($1, $2, $3, $4, $5, $6, $7) returning *', [
          product.supplierID,
          product.title,
          product.price,
          10000000,
          product.extID,
          product.dimensionsCm,
          product.weightGrams
        ])
        results.push(productRes.rows[0]);
      }
    }
    if(results.length > 0){
      res.status(201).json({
        status: "OK",
        data: {
          products: results
        }
      })
    } else if(results.length === 0) {
      res.status(204).json({
        status: "All Products have already been added."
      })
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// UPDATE PRODUCT
router.put('/api/v1/product', async (req, res) => {
  try {
    const result = await db.query(
      'UPDATE public."Product" SET "supplierID"=$2, title=$3, "imageUrl"=$4, price=$5, stock=$6, "extID"=$7, "dimensionsCm"=$8, "weightGrams"=$9, "stripeID"=$10 WHERE id=$1 returning *', [
      req.body.id,
      req.body.supplierID,
      req.body.title,
      req.body.price,
      req.body.stock,
      req.body.extID,
      req.body.dimensionsCm,
      req.body.weightGrams,
      req.body.stripeID
    ])
    if (result.rowCount > 0) {
      res.status(200).json({
        status: "OK",
        data: {
          product: result.rows[0]
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

// UPDATE PRODUCTS OR ADD EXTRA VARIANTS
router.put('/api/v1/products', async (req, res) => {
  try {
    let results = [];
    const listOfProducts = req.body.products;

    const updateProducts = async () => {
      // Go through all products from the request body
      for (let i = 0; i < listOfProducts.length; i++) {
        const product = listOfProducts[i];
        
        // check if the product is already in the db
        let checkIfProductExists = await db.query('SELECT * FROM public."Product" WHERE "extID" = $1;', [
          product.extID
        ])
        if(checkIfProductExists.rowCount > 0) {
          let productRes = await db.query(
            'UPDATE public."Product" SET title=$1, "imageUrl"=$2, price=$3 WHERE "extID"=$4 returning *', [
            product.title,
            product.imageUrl,
            product.price,
            product.extID
          ])
          results.push(productRes.rows[0]);
        } else if(checkIfProductExists.rowCount === 0) {
          let productRes = await db.query(
            'INSERT INTO public."Product" ("supplierID", title, "imageUrl", price, stock, "extID") VALUES ($1, $2, $3, $4, $5, $6) returning *', [
            product.supplierID,
            product.title,
            product.imageUrl,
            product.price,
            0,
            product.extID
          ])
          results.push(productRes.rows[0]);
        }
      }
      if(results.length > 0){
        res.status(201).json({
          status: "OK",
          data: {
            products: results
          }
        })
      } else if(results.length === 0) {
        res.status(204).json({
          status: "All Products have already been added."
        })
      }
    }
    updateProducts();
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// UPDATE STRIPEID
router.put('/api/v1/product/stripe', async (req, res) => {
  try {
    const result = await db.query(
      'UPDATE public."Product" SET "stripeID"=$2 WHERE id=$1 returning *', [
      req.body.id,
      req.body.stripeID
    ])
    if (result.rowCount > 0) {
      res.status(200).json({
        status: "OK",
        data: {
          product: result.rows[0]
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

// UPDATE STOCK
router.put('/api/v1/product/stock', async (req, res) => {
  try {
    const result = await db.query('UPDATE public."Product" SET stock=$1 WHERE id=$2 returning *', [
      req.body.stock,
      req.body.id
    ])
    if(result.rowCount > 0) {
      res.status(200).json({
        status: "OK",
        data: {
          product: result.rows[0]
        }
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

// DELETE PRODUCT
router.delete('/api/v1/product/:id', async (req, res) => {
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