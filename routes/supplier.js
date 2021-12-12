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
    console.log(error);
  }
});

// GET SUPPLIER
router.get('/api/v1/supplier/:id', async (req, res) => {
  try {
    const result = await db.query(`SELECT * FROM public."Supplier" WHERE id=$1;`, [
      req.params.id
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
    console.log(error);
  }
});

// GET SUPPLIER ID BY EMAIL
router.post('/api/v1/supplier/:supplierEmail', async (req, res) => {
  try {
    const result = await db.query(`SELECT * FROM public."Supplier" WHERE "contactEmail"=$1;`, [
      req.params.supplierEmail
    ])

    if (result.rowCount > 0) {
      res.status(200).json({
        status: "OK",
        data: {
          supplierID: result.rows[0].id
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

// GET SUPPLIER ID BY DOMAIN
router.get('/api/v1/supplier/idPerDomain/:domain', async (req, res) => {
  try {
    const result = await db.query(`SELECT * FROM public."Supplier" WHERE domain=$1;`, [
      req.params.domain
    ])

    if (result.rowCount > 0) {
      res.status(200).json({
        status: "OK",
        data: {
          supplierID: result.rows[0].id
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
    console.log(error);
  }
});

// UPDATE SUPPLIER
router.put('/api/v1/supplier', async (req, res) => {
  try {
    const result = await db.query(
      'UPDATE public."Supplier" SET name=$2, "contactName"=$3, "contactEmail"=$4, "contactPhone"=$5, "registrationNumber"=$6, platform=$7, "extID"=$8, domain=$9, "onBoardingProgress"=$10, address1=$11, address=$12, country=$13, postcode=$14 WHERE id=$1 returning *',[
      req.body.id,
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
      req.body.postcode
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
    console.log(error);
  }
});

// CREATE SUPPLIER
router.post('/api/v1/supplier', async (req, res) => {
  try {
    if(resultAddress.rowCount > 0){
      const result = await db.query(
        'INSERT INTO public."Supplier" (name, "contactName", "contactEmail", "contactPhone", "registrationNumber", platform, "extID", active, domain, onBoardingProgress, address1, address2, country, postcode) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14) returning *', [
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
          req.body.postcode
      ])
  
      if(result.rowCount > 0){
        res.status(201).json({
          status: "OK",
          data: {
            supplier: result.rows[0]
          }
        })
      } else {
        res.status(500).json({
          status: "Not sure what happened."
        })
      }
    } else {
      res.status(500).json({
        status: "Cannot add address."
      })
    }
    
  } catch (error) {
    console.log(error);
  }
});

export default router;