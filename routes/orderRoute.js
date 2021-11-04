const express = require('express');
const db = require('../db');
const request = require('request');

const router = express.Router();

let currentURL = process.env.URL_DEV;



const reqOptDeleteOrderProducts = {
  url: `${currentURL}/api/v1/orderProducts/`,
  method: 'DELETE'
}



// GET ORDERS
router.get('/api/v1/orders', async (req, res) => {
  try {
    const results = await db.query(`SELECT * FROM public."Order";`)

    if (results.rowCount > 0) {
      res.status(200).json({
        status: "OK",
        data: {
          orders: results.rows
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

// GET ORDERS BY SUPPLIERID
router.get('/api/v1/orders/perSupplier/:supplierID', async (req, res) => {
  try {
    const results = await db.query('SELECT * FROM public."Order" WHERE "supplierID"=$1;', [
      req.params.supplierID
    ])

    if (results.rowCount > 0) {
      res.status(200).json({
        status: "OK",
        data: {
          orders: results.rows
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

// GET ORDERS BY USER EMAIL
router.get('/api/v1/orders/perUserEmail/:email', async (req, res) => {
  try {
    const results = await db.query('SELECT * FROM public."Order" WHERE "contactEmail"=$1;', [
      req.params.email
    ])

    if (results.rowCount > 0) {
      res.status(200).json({
        status: "OK",
        data: {
          orders: results.rows
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

// GET ORDER
router.get('/api/v1/order/:id', async (req, res) => {
  try {
    const result = await db.query(
      'SELECT * FROM public."Order" WHERE id = $1 ;', [
      req.params.id
    ])
    if (result.rowCount > 0) {
      res.status(200).json({
        status: "OK",
        data: {
          order: result.rows[0]
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

// CHECK EXTERNAL ORDER EXISTS
router.get('/api/v1/order/ext/:id', async (req, res) => {
  try {
    const result = await db.query(
      'SELECT * FROM public."Order" WHERE "extOrderID" = $1 ;', [
      req.params.id
    ])
    if (result.rowCount > 0) {
      res.status(200).json({
        status: "OK",
        data: {
          order: result.rows[0]
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
})

// CREATE ORDER
router.post('/api/v1/order', async (req, res) => {
  try {
    // Create Order
    const resultCreateOrder = await db.query(
      'INSERT INTO public."Order"("dateAndTime", "statusID", "supplierID", "userID", "totalAmount", "contactName", "contactEmail", "contactPhone", address1, address2, city, county, country, postcode, "offerID", "extOrderID") VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16) returning *', [
      req.body.dateAndTime,
      req.body.statusID,
      req.body.supplierID,
      req.body.userID,
      req.body.totalAmount,
      req.body.contactName,
      req.body.contactEmail,
      req.body.contactPhone,
      req.body.address1,
      req.body.address2,
      req.body.city,
      req.body.county,
      req.body.country,
      req.body.postcode,
      req.body.offerID,
      req.body.extOrderID
    ])
    if(resultCreateOrder.rowCount > 0){
      // Create Order Products from Cart Products
      
      const createOrderProducts = async item => {
        const reqOptCreateOrderProduct = {
          url: `${currentURL}/api/v1/orderProduct`,
          method: 'POST',
          json: {
            "orderID": resultCreateOrder.rows[0].id,
            "title": item.title,
            "quantity": item.quantity
          }
        }
        request(reqOptCreateOrderProduct, (err, resCreatOrderProduct, body) => {
          console.log(resCreatOrderProduct);
          if(body === undefined){
            console.log(err);
          } else {
            return body;
          };
        });
      };
      const getCreateOrderProductsData = async () => {
        return Promise.all(req.body.cartProducts.map(item => createOrderProducts(item)))
      };
      getCreateOrderProductsData().then(data => {
      }).catch(error => {
        console.log(error);
      });

      // Delete Cart Products
      const deleteCartProducts = async item => {
        const reqOptDeleteCartProducts = {
          url: `${currentURL}/api/v1/cartProducts/userEmail/${req.body.contactEmail}`,
          method: 'DELETE'
        }
        request(reqOptDeleteCartProducts, (err, resDeleteCartProducts, body) => {
          console.log(resDeleteCartProducts);
          if(body === undefined){
            console.log(err);
          } else {
            return body
          };
        });
      };
      deleteCartProducts(req.body.cartProducts[0]).then(data => {
      }).catch(error => {
        console.log(error);
      });

      res.status(201).json({
        status: "OK",
      });
    };
  } catch (error) {
    console.log(error);
  };
});

// UPDATE ORDER
router.put('/api/v1/order', async (req, res) => {
  try {
    const result = await db.query(
      'UPDATE public."Order" SET "dateAndTime"=$2, "statusID"=$3, "supplierID"=$4, "userID"=$5, "totalAmount"=$6, "contactName"=$7, "contactEmail"=$8, "contactPhone"=$9, address1=$10, address2=$11, city=$12, county=$13, country=$14, postcode=$15, "offerID"=$16, "extOrderID"=$17 WHERE id = $1 returning *',[
      req.body.id,
      req.body.dateAndTime,
      req.body.statusID,
      req.body.supplierID,
      req.body.userID,
      req.body.totalAmount,
      req.body.contactName,
      req.body.contactEmail,
      req.body.contactPhone,
      req.body.address1,
      req.body.address2,
      req.body.city,
      req.body.county,
      req.body.country,
      req.body.postcode,
      req.body.offerID,
      req.body.extOrderID
    ])
    if (result.rowCount > 0) {
      res.status(200).json({
        status: "OK",
        data: {
          order: result.rows[0]
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

// DELETE ORDER
router.delete('/api/v1/order/:id', async (req, res) => {
  try {
    const resultGET = await db.query(
      'SELECT * FROM public."Order" WHERE id = $1;', [
      req.params.id
    ])
    reqOptDeleteOrderProducts.url = reqOptDeleteOrderProducts.url + resultGET.rows[0].id;

    request(reqOptDeleteOrderProducts, (err, resDeleteOrderProducts, body) => {
      console.log(err)
      if(!err){
        db.query(
          'DELETE FROM public."Order" WHERE id = $1',[
          req.params.id
        ])
        if (resultGET.rowCount > 0) {
          res.status(200).json({
            status: "OK",
            data: {
              order: resultGET.rows[0]
            }
          })
        } else {
          res.status(204).json({
            status: "ID did not match."
          })
        }
      } else {
        res.status(500).json({
          status: "Not sure what happened.",
          data: {
            order: resultGET.rows[0]
          }
        })
      }
    })

  } catch (error) {
    console.log(error)
  }
});

module.exports = router;