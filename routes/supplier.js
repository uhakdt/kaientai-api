import express from 'express';
import db from '../db';

const router = express.Router();

// GET SUPPLIERS
router.get('/api/v1/suppliers', async (req, res) => {
  try {
    const results = await db.query(`SELECT * FROM public."Supplier";`)

    if (results.rowCount > 0) {
      res.status(200).json({
        status: "OK",
        data: {
          suppliers: results.rows
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

// GET SUPPLIER
router.get('/api/v1/supplier/:by/:identifier', async (req, res) => {
  try {
    console.log(req.params)
    let query = req.params.by === 'email' 
      ? `SELECT * FROM public."Supplier" WHERE "contactEmail"=$1;` : req.params.by === 'id' 
      ? `SELECT * FROM public."Supplier" WHERE id=$1;` : 
      `SELECT * FROM public."Supplier" WHERE domain=$1;`
    let result = await db.query(query, [req.params.identifier])

    if (result.rowCount > 0) {
      res.status(200).json({
        status: "OK",
        data: {
          supplier: result.rows[0]
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

// CHECK EXT SUPPLIER EXISTS
router.get('/api/v1/supplier/checkExtExists/:platform/:extID', async (req, res) => {
  try {
    const result = await db.query(`SELECT * FROM public."Supplier" WHERE "extID"=$1 and platform=$2;`, [
      req.params.extID,
      req.params.platform
    ])

    if (result.rowCount > 0) {
      res.status(200).json({
        status: "OK",
        data: {
          supplier: result.rows[0]
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

// UPDATE SUPPLIER
router.put('/api/v1/supplier/:id', async (req, res) => {
  try {
    const result = await db.query(
      'UPDATE public."Supplier" SET name=$2, "contactName"=$3, "contactEmail"=$4, "contactPhone"=$5, "registrationNumber"=$6, platform=$7, "extID"=$8, active=$9, domain=$10, "onBoardingProgress"=$11, address1=$12, address2=$13, country=$14, postcode=$15, "stripeID"=$16 WHERE id=$1 returning *',[
      req.params.id,
      req.body.name,
      req.body.contactName,
      req.body.contactEmail,
      req.body.contactPhone,
      req.body.registrationNumber,
      req.body.platform,
      req.body.extID,
      req.body.active,
      req.body.domain,
      req.body.onBoardingProgress,
      req.body.address1,
      req.body.address2,
      req.body.country,
      req.body.postcode,
      req.body.stripeID
    ])
    if (result.rowCount > 0) {
      res.status(200).json({
        status: "OK",
        data: {
          supplier: result.rows[0]
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

// UPDATE SUPPLIER ONBOARDINGPROGRESS
router.put('/api/v1/supplier/onBoardingProgress', async (req, res) => {
  try {
    const result = await db.query(
      'UPDATE public."Supplier" SET "onBoardingProgress"[$2]=true WHERE id=$1 returning *',[
      req.body.supplierID,
      req.body.step
    ])
    if (result.rowCount > 0) {
      res.status(200).json({
        status: "OK",
        data: {
          supplier: result.rows[0]
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

// UPDATE SUPPLIER STRIPEID
router.put('/api/v1/supplier/stripe', async (req, res) => {
  try {
    const result = await db.query(
      'UPDATE public."Supplier" SET "stripeID"=$2 WHERE id=$1 returning *',[
      req.body.supplierID,
      req.body.stripeID
    ])
    if (result.rowCount > 0) {
      res.status(200).json({
        status: "OK",
        data: {
          supplier: result.rows[0]
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

// UPDATE SUPPLIER SHOPIFY SESSION
router.put('/api/v1/supplier/shopifySession', async (req, res) => {
  try {
    const result = await db.query(
      'UPDATE public."Supplier" SET "shopifySession"=$2 WHERE id=$1 returning *',[
      req.body.supplierID,
      req.body.shopifySession
    ])
    if (result.rowCount > 0) {
      res.status(200).json({
        status: "OK",
        data: {
          supplier: result.rows[0]
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

// CREATE SUPPLIER
router.post('/api/v1/supplier', async (req, res) => {
  try {
    const result = await db.query(
      'INSERT INTO public."Supplier" (name, "contactName", "contactEmail", "contactPhone", "registrationNumber", platform, "extID", active, domain, "onBoardingProgress", address1, address2, country, postcode, "stripeID") VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15) returning *', [
        req.body.name,
        req.body.contactName,
        req.body.contactEmail,
        req.body.contactPhone,
        req.body.registrationNumber,
        req.body.platform,
        req.body.extID,
        false,
        req.body.domain,
        [false, false, false],
        req.body.address1,
        req.body.address2,
        req.body.country,
        req.body.postcode,
        false
    ])

    if(result.rowCount > 0){
      res.status(201).json({
        status: "OK",
        data: {
          supplier: result.rows[0]
        }
      })
    } else {
      res.status(500).json({ status: "Not sure what happened." })
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

export default router;