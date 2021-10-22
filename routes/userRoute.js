const express = require('express');
const db = require("../db");

const router = express.Router();


// GET USERS
router.get('/api/v1/users', async (req, res) => {
  try {
    const results = await db.query(`SELECT * FROM public."User";`)

    if(results.rows.length > 0){
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
    console.log(error)
  }
});

// GET USER
router.get('/api/v1/user', async (req, res) => {
  try {
    const result = await db.query(
      'SELECT * FROM public."User" WHERE id = $1;', [
      req.body.id
    ])
    if(result.rows.length > 0){
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
    console.log(error)
  }
});

// CHECK EXTERNAL USER
router.get('/api/v1/user/ext', async (req, res) => {
  try {
    const result = await db.query(
      'SELECT * FROM public."User" WHERE "extUserID" = $1;', [
      req.body.id
    ])
    if(result.rowCount !== 0){
      res.status(200).json({
        status: "OK",
        data: {
          user: result.rows[0]
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

// CREATE USER
router.post('/api/v1/user', async (req, res) => {
  try {
    const result = await db.query(
      'INSERT INTO public."User"(name, email, phone, "loginDetailID", "addressID", "dateAndTimeSignUp", "profileImageUrl", "extUserID") VALUES ($1, $2, $3, $4, $5, $6, $7, $8) returning *', [
      req.body.name,
      req.body.email,
      req.body.phone,
      req.body.loginDetailID,
      req.body.addressID,
      req.body.dateAndTimeSignUp,
      req.body.profileImageUrl,
      req.body.extUserID,
    ])
    res.status(201).json({
      status: "OK",
      data: {
        user: result.rows[0]
      }
    })
  } catch (error) {
    console.log(error);
  }
});

// UPDATE USER
router.put('/api/v1/user', async (req, res) => {
  try {
    const result = await db.query(
      'UPDATE public."User" SET name=$2, email=$3, phone=$4, "loginDetailID"=$5, "addressID"=$6, "dateAndTimeSignUp"=$7, "profileImageUrl"=$8, "extUserID"=$9 WHERE id = $1 returning *',[
      req.body.id,
      req.body.name,
      req.body.email,
      req.body.phone,
      req.body.loginDetailID,
      req.body.addressID,
      req.body.dateAndTimeSignUp,
      req.body.profileImageUrl,
      req.body.extUserID
    ])
    if (result.rows.length > 0) {
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
    console.log(error)
  }
});

// DELETE USER
router.delete('/api/v1/user', async (req, res) => {
  try {
    const resultGET = await db.query(
      'SELECT * FROM public."User" WHERE id = $1;', [
      req.body.id
    ])
    await db.query(
      'DELETE FROM public."User" WHERE id = $1',[
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