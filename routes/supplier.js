const express = require('express');
const db = require('../db');

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

module.exports = router;