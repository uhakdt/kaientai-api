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
    console.log(error)
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
    console.log(error)
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
    console.log(error)
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
    console.log(error)
  }
});

// UPDATE SUPPLIER
router.put('/api/v1/supplier', async (req, res) => {
  try {
    const result = await db.query(
      'UPDATE public."Supplier" SET name=$2, "legalName"=$3, "contractStatus"=$4, "dateAndTimeContractSigned"=$5, "kaientaiLocalFulfilment"=$6, "contactName"=$7, "contactEmail"=$8, "contactPhone"=$9, "addressID"=$10, "bankDetailID"=$11, "registrationNumber"=$12 WHERE id=$1 returning *',[
      req.body.id,
      req.body.name,
      req.body.legalName,
      req.body.contractStatus,
      req.body.dateAndTimeContractSigned,
      req.body.kaientaiLocalFulfilment,
      req.body.contactName,
      req.body.contactEmail,
      req.body.contactPhone,
      req.body.addressID,
      req.body.bankDetailID,
      req.body.registrationNumber,
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
    console.log(error)
  }
});

// CREATE SUPPLIER
router.post('/api/v1/supplier', async (req, res) => {
  try {
    const resultAddress = await db.query(
      'INSERT INTO public."Address"(address1, address2, city, county, country, postcode) VALUES ($1, $2, $3, $4, $5, $6) returning *', [
      req.body.address1,
      req.body.address2,
      req.body.city,
      req.body.county,
      req.body.country,
      req.body.postcode
    ])
    if(resultAddress.rowCount > 0){
      const result = await db.query(
        'INSERT INTO public."Supplier" (name, "legalName", "contractStatus", "dateAndTimeContractSigned", "kaientaiLocalFulfilment", "contactName", "contactEmail", "contactPhone", "addressID", "bankDetailID", "registrationNumber", platform, "extID", active) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14) returning *', [
          req.body.name,
          req.body.legalName,
          req.body.contractStatus,
          req.body.dateAndTimeContractSigned,
          req.body.kaientaiLocalFulfilment,
          req.body.contactName,
          req.body.contactEmail,
          req.body.contactPhone,
          resultAddress.rows[0].id,
          req.body.bankDetailID,
          req.body.registrationNumber,
          req.body.platform,
          req.body.extID,
          req.body.active
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