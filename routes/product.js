import express from 'express';
import db from '../db';

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
    console.log(error);
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
    console.log(error);
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
    console.log(error);
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
    console.log(error);
  }
});

// CREATE PRODUCTS
router.post('/api/v1/products', async (req, res) => {
  try {
    let results = [];
    const listOfProducts = req.body.products;

    const addProducts = async () => {
      // Go through all products from the request body
      for (let i = 0; i < listOfProducts.length; i++) {
        const product = listOfProducts[i];
        
        // check if the product is already in the db
        let checkIfProductExists = await db.query('SELECT * FROM public."Product" WHERE "extID" = $1;', [
          product.extID
        ])
        if(checkIfProductExists.rowCount === 0) {
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
    addProducts();
  } catch (error) {
    console.log(error);
  }
});

// UPDATE PRODUCT
router.put('/api/v1/product', async (req, res) => {
  try {
    const result = await db.query(
      'UPDATE public."Product" SET "supplierID"=$2, title=$3, "imageUrl"=$4, price=$5, stock=$6, "extID"=$7, "weightInGrams"=$8 WHERE id=$1 returning *', [
      req.body.id,
      req.body.supplierID,
      req.body.title,
      req.body.imageUrl,
      req.body.price,
      req.body.stock,
      req.body.extID,
      req.body.weightInGrams
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
    console.log(error);
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
    console.log(error);
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
    console.log(error);
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
    console.log(error);
  }
});

export default router;