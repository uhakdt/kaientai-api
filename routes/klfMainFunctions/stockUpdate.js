import request from 'request-promise';
import { HostUrl } from '../../auxillary/globalVariables';
import db from '../../db';

export async function decreaseProductsStockNewOrder (orderProducts) {
  const updateProductStock = async item => {
    let oldProduct = await db.query('SELECT * FROM public."Product" WHERE "extID"=$1', [item.extID.toString()]);
    let oldProductStock = oldProduct.rows[0].stock;
    
    if(oldProduct.rowCount > 0) {
      const res = {
        url: `${HostUrl}/product/stock`,
        method: 'PUT',
        json: {
          "stock": oldProductStock - item.quantity,
          "id": oldProduct.rows[0].id
        },
      };
      await request(res)
      .catch(function(error) {
        console.log(error.statusCode)
      });
    }
  };

  const updateProductsStock = async () => {
    return Promise.all(orderProducts.map(item => updateProductStock(item)))
  };

  updateProductsStock()
  .catch(function(error) {
    console.log(error);
  });
}

// export async function increaseProductsStockCancelledOrder (orderProducts) {
//   const updateProductStock = async item => {
//     let oldProductStock = await db.query('SELECT quantity FROM publc."Product" WHERE id=$1', [item.productID]);
//     oldProductStock = oldProductStock.rows[0].stock;

//     const res = {
//       url: `${HostUrl}/product/stock`,
//       method: 'PUT',
//       json: {
//         "stock": oldProductStock + item.quantity,
//         "id": item.productID
//       },
//     };
//     request(res);
//   };

//   const updateProductsStock = async () => {
//     return Promise.all(orderProducts.map(item => updateProductStock(item)))
//   };

//   updateProductsStock().then(response => {
//     console.log(response)
//   }).catch(error => {
//     console.log(error);
//   });
// }

// export async function decreaseProductsStock (orderProduct) {
//   let result;
//   const res = {
//     url: `${HostUrl}/product/stock`,
//     method: 'PUT',
//     json: {
//       "orderProductID": item.id,
//       "productID": item.productID,
//       "quantity": item.quantity
//     },
//   };
//   request(res, (error, resp, body) => {
//     console.log(resp)
//   })

//   return result;
// }