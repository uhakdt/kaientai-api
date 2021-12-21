import express from 'express';
import db from '../db';
import request from 'request';
import { updateOrderProductsFromOrder } from '../auxillary/product';
import { HostUrl } from '../auxillary/globalVariables';
// import { orderProductsUpdate } from '../auxillary/product';

const router = express.Router();

const reqOptDeleteOrderProducts = {
  url: `${HostUrl}/orderProducts/`,
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
    res.status(400).json({ error: error.message });
  }
});

// GET ORDERS BY SUPPLIERID
router.get('/api/v1/orders/perSupplier/:supplierID', async (req, res) => {
  try {
    const results = await db.query('SELECT * FROM public."Order" WHERE "supplierID"=$1 order by id desc;', [
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
    res.status(400).json({ error: error.message });
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
    res.status(400).json({ error: error.message });
  }
});

// GET ORDERS BY SUPPLIER DOMAIN
router.get('/api/v1/orders/perSupplierDomain/:domain', async (req, res) => {
  try {
    const supplierResult = await db.query(`SELECT * FROM public."Supplier" WHERE domain=$1;`, [
      req.params.domain
    ])
    if(supplierResult.rowCount > 0) {
      const results = await db.query('SELECT * FROM public."Order" WHERE "supplierID"=$1;', [
        supplierResult.rows[0].id
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
    } else {
      res.status(204).json({
        status: "No Results found with that domain."
      });
    }

  } catch (error) {
    res.status(400).json({ error: error.message });
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
    res.status(400).json({ error: error.message });
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
    res.status(400).json({ error: error.message });
  }
})

// CREATE ORDER
router.post('/api/v1/order', async (req, res) => {
  try {
    // Check if Order by ExtOrderID already exists
    const resultExtExists = await db.query('SELECT * FROM public."Order" WHERE "extOrderID" = $1', [req.body.extOrderID])
    if(resultExtExists.rowCount === 0) {

      // Create Order
      const resultCreateOrder = await db.query(
        'INSERT INTO public."Order"("dateAndTime", "supplierID", "userID", "totalAmount", "contactName", "contactEmail", "contactPhone", address1, address2, country, postcode, "extOrderID", status) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13) returning *', [
        req.body.dateAndTime,
        req.body.supplierID,
        req.body.userID,
        req.body.totalAmount,
        req.body.contactName,
        req.body.contactEmail,
        req.body.contactPhone,
        req.body.address1,
        req.body.address2,
        req.body.country,
        req.body.postcode,
        req.body.extOrderID,
        req.body.status
      ])
      if(resultCreateOrder.rowCount > 0){

        // Create Order Products from Order Products
        const createOrderProduct = async item => {
          const prodID = await db.query('SELECT id FROM public."Product" WHERE "extID"=$1', [item.extID]);
          if(prodID.rowCount > 0) {
            await db.query(
              'INSERT INTO public."OrderProduct" ("orderID", "productID", quantity) VALUES ($1, $2, $3) returning *', [
              resultCreateOrder.rows[0].id,
              prodID.rows[0].id,
              item.quantity
            ])
          }
        };
        const getCreateOrderProductsData = async () => {
          return Promise.all(req.body.orderProducts.map(item => createOrderProduct(item)))
        };
        getCreateOrderProductsData()
        .catch(error => {
          console.log(error);
        });
  
        res.status(201).json({
          status: "OK",
          data: {
            order: resultCreateOrder.rows[0]
          }
        });
      };
    } else { 
      res.status(403).json({
        status: "Order already exists by checking External Order ID.",
        data: {
          order: resultExtExists.rows[0]
        }
      });
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  };
});

// UPDATE ORDER
router.put('/api/v1/order', async (req, res) => {
  try {
    const resultUpdateOrder = await db.query(
      'UPDATE public."Order" SET "dateAndTime"=$2, "supplierID"=$3, "userID"=$4, "totalAmount"=$5, "contactName"=$6, "contactEmail"=$7, "contactPhone"=$8, address1=$9, address2=$10, country=$11, postcode=$12, "extOrderID"=$13, status=$14 WHERE id = $1 returning *',[
      req.body.id,
      req.body.dateAndTime,
      req.body.supplierID,
      req.body.userID,
      req.body.totalAmount,
      req.body.contactName,
      req.body.contactEmail,
      req.body.contactPhone,
      req.body.address1,
      req.body.address2,
      req.body.country,
      req.body.postcode,
      req.body.extOrderID,
      req.body.status
    ])
    if (resultUpdateOrder.rowCount > 0) {
      // Check if length of order products has changed
      // Another variable also returns = if more, less or same number of OrderProducts
      await updateOrderProductsFromOrder(req.body.orderProducts, req.body.id);

      // If more now => add new
      // else if (oldOrderProductsNum < newOrderProductsNum) {
      //   const orderProductIDsToAdd = newOrderProductsIDsList.filter(x => !oldOrderProductsIDsList.includes(x))

      //   const res = {
      //     url: `${HostUrl}/orderProduct`,
      //     method: 'POST',
      //     json: {
      //       "orderID": req.body.id,
      //       "productID": ,
      //       "quantity": 1
      //     },
      //   };
      // }

      // Update existing order products

      // Update Order Products
      // const orderProductsResult = await orderProductsUpdate(req.body.orderProducts)
      // console.log(orderProductsResult);
      // Check if any Order Products have been deleted


     




      
      res.status(201).json({
        status: "OK",
        data: {
          order: resultUpdateOrder.rows[0]
        }
      });
    } else {
      res.status(204).json({
        status: "ID did not match."
      });
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
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

    request(reqOptDeleteOrderProducts, (error, resDeleteOrderProducts, body) => {
      console.log(error);
      if(!error){
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
    res.status(400).json({ error: error.message });
  }
});

export default router;