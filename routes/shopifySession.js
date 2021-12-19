import express from 'express';
import db from '../db';
import { ConvertStringDateAndTimeToMs, DaysInMs, GetDateAndTimeNow, GetDateAndTimeNowInMs } from '../auxillary/dateAndTimeNow';

const router = express.Router();

// GET SHOPIFY SESSION BY SUPPLIERID
router.get('/api/v1/shopifySession/:supplierID', async (req, res) => {
  try {
    const result = await db.query(`SELECT * FROM public."ShopifySession" WHERE "supplierID"=$1;`, [req.params.supplierID])
    
    if (result.rowCount > 0) {
      res.status(200).json({
        status: "OK",
        data: {
          shopifySession: result.rows[0]
        }
      })
    } else {
      res.status(204).json({ status: "ID did not match." });
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// CHECK SHOPIFY SESSION EXPIRY
router.get('/api/v1/shopifySession/checkExpiry/:supplierID', async (req, res) => {
  try {
    const result = await db.query(`SELECT * FROM public."ShopifySession" WHERE "supplierID"=$1;`, [req.params.supplierID])
    if (result.rowCount > 0) {
      if(ConvertStringDateAndTimeToMs(result.rows[0].dateAndTime) + DaysInMs(7) >= GetDateAndTimeNowInMs()) {
        res.status(200).json({
          status: "OK",
          data: {
            shopifySession: result.rows[0]
          }
        })
      } else {
        res.status(401).json({ status: "Expired Token." })
      }
    } else {
      res.status(204).json({ status: "ID did not match." });
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// CREATE SHOPIFY SESSION
router.post('/api/v1/shopifySession', async (req, res) => {
  try {
    const result = await db.query(
      'INSERT INTO public."ShopifySession"(domain, "accessToken", "isOnline", scope, "supplierID", "dateAndTime") VALUES ($1, $2, $3, $4, $5, $6) returning *', [
      req.body.domain,
      req.body.accessToken,
      req.body.isOnline,
      req.body.scope,
      req.body.supplierID,
      GetDateAndTimeNow()
    ])

    if(result.rowCount > 0){
      res.status(201).json({
        status: "OK",
        data: {
          shopifySession: result.rows[0]
        }
      })
    } else {
      res.status(500).json({ status: "Not sure what happened." })
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// UPDATE TOKEN & DATE
router.put('/api/v1/shopifySession/:id', async (req, res) => {
  try {
    const result = await db.query(
      'UPDATE public."ShopifySession" SET "accessToken"=$2, "dateAndTime"=$3 WHERE id=$1 returning *',[
      req.params.id,
      req.body.accessToken,
      GetDateAndTimeNow()
    ])
    if (result.rowCount > 0) {
      res.status(200).json({
        status: "OK",
        data: {
          shopifySession: result.rows[0]
        }
      })
    } else {
      res.status(204).json({ status: "ID did not match." });
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// DELETE SHOPIFY SESSION
router.delete('/api/v1/shopifySession/:id', async (req, res) => {
  try {
    const resultGET = await db.query(
      'SELECT * FROM public."ShopifySession" WHERE id = $1;', [
      req.params.id
    ])
    await db.query(
      'DELETE FROM public."ShopifySession" WHERE id = $1',[
      req.params.id
    ])
    if (resultGET.rowCount > 0) {
      res.status(200).json({ status: "OK" })
    } else {
      res.status(204).json({ status: "ID did not match." })
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

export default router;