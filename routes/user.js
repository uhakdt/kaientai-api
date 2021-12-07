import express from 'express';
import db from '../db';

const router = express.Router();

// GET USERS
router.get('/api/v1/users', async (req, res) => {
  try {
    const results = await db.query(`SELECT * FROM public."User";`)

    if(results.rowCount > 0){
      res.status(200).json({
        status: "OK",
        data: {
          users: results.rows
        }
      })
    } else {
      res.status(204).json({
        status: "No Results.",
      })
    }
  } catch (error) {
    console.log(error);
  }
});

// GET USER
router.get('/api/v1/user/:id', async (req, res) => {
  try {
    const result = await db.query(
      'SELECT * FROM public."User" WHERE id = $1;', [
      req.params.id
    ])
    if(result.rowCount > 0){
      res.status(200).json({
        status: "OK",
        data: {
          user: result.rows[0]
        }
      })
    } else {
      res.status(204).json({
        status: "ID did not match.",
      })
    }
  } catch (error) {
    console.log(error);
  }
});

// GET USER BY EMAIL
router.get('/api/v1/user/email/:email', async (req, res) => {
  try {
    const result = await db.query(
      'SELECT * FROM public."User" WHERE email = $1;', [
      req.params.email
    ])
    if(result.rowCount > 0){
      res.status(200).json({
        status: "OK",
        data: {
          user: result.rows[0]
        }
      })
    } else {
      res.status(204).json({
        status: "ID did not match.",
      })
    }
  } catch (error) {
    console.log(error);
  }
});

// GET USERID BY EMAIL
router.get('/api/v1/userID/email/:email', async (req, res) => {
  try {
    const result = await db.query(
      'SELECT id FROM public."User" WHERE email = $1;', [
      req.params.email
    ])
    if(result.rowCount > 0){
      res.status(200).json({
        status: "OK",
        data: {
          user: result.rows[0]
        }
      })
    } else {
      res.status(204).json({
        status: "ID did not match.",
      })
    }
  } catch (error) {
    console.log(error);
  }
});

// CREATE USER
router.post('/api/v1/user', async (req, res) => {
  try {
    const existingUser = await db.query(
      'SELECT * FROM public."User" WHERE email = $1;', [
      req.body.email
    ])

    if(existingUser.rowCount > 0){
      res.status(422).json({
        status: "User already exists.",
        data: {
          user: existingUser.rows[0] 
        }
      })
    } else {
      const result = await db.query(
        'INSERT INTO public."User"(name, email, phone, "dateAndTimeSignUp", "extUserID", "isAdmin", "supplierID", address1, address2, country, postcode) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) returning *', [
        req.body.name,
        req.body.email,
        req.body.phone,
        req.body.dateAndTimeSignUp,
        req.body.extUserID,
        req.body.isAdmin,
        req.body.supplierID,
        req.body.address1,
        req.body.address2,
        req.body.country,
        req.body.postcode
      ])
      res.status(201).json({
        status: "OK",
        data: {
          user: result.rows[0]
        }
      })
    }
  } catch (error) {
    console.log("Heloooo")
    console.log(error);
  }
});

// UPDATE USER
router.put('/api/v1/user', async (req, res) => {
  try {
    const result = await db.query(
      'UPDATE public."User" SET name=$2, email=$3, phone=$4, "dateAndTimeSignUp"=$5, "extUserID"=$6, "isAdmin"=$7, "supplierID"=$8, address1=$9, address2=$10, country=$11, postcode=$12 WHERE id = $1 returning *',[
      req.body.id,
      req.body.name,
      req.body.email,
      req.body.phone,
      req.body.dateAndTimeSignUp,
      req.body.extUserID,
      req.body.isAdmin,
      req.body.supplierID,
      req.body.address1,
      req.body.address2,
      req.body.country,
      req.body.postcode
    ])
    if (result.rowCount > 0) {
      res.status(200).json({
        status: "OK",
        data: {
          user: result.rows[0]
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

// DELETE USER
router.delete('/api/v1/user/:id', async (req, res) => {
  try {
    const resultGET = await db.query(
      'SELECT * FROM public."User" WHERE id = $1;', [
      req.params.id
    ])
    await db.query(
      'DELETE FROM public."User" WHERE id = $1',[
      req.params.id
    ])
    if (resultGET.rows.length > 0) {
      res.status(200).json({
        status: "OK",
        data: {
          user: resultGET.rows[0]
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

export default router;