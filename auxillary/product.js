import db from '../db';
import request from 'request-promise';

let currentURL = process.env.URL;

export function productFormatOrderProductsShopify (orderProducts) {
  // Variable declarations
  let listOfOrderProducts = []
  for (let i = 0; i < orderProducts.length; i++) {
    const e = orderProducts[i];
    let orderProduct = {
      extID: e.variant_id,
      price: e.price,
      quantity: e.quantity,
    }
    listOfOrderProducts.push(orderProduct);
  }
  console.log(listOfOrderProducts)
  return listOfOrderProducts;
}

export function productFormatOrderProductsWooCommerce (orderProducts) {
  let listOfOrderProducts = []
  console.log(orderProducts)
  for (let i = 0; i < orderProducts.length; i++) {
    const e = orderProducts[i];
    let orderProduct = {
      extID: e.product_id,
      price: e.price,
      quantity: e.quantity,
    }
    listOfOrderProducts.push(orderProduct);
  }
  return listOfOrderProducts;
}

export async function productCheckIfEnoughStock (orderProduct) {
  let result = -1;

  // Product Stock
  const oldProductStockTemp = await db.query('SELECT stock FROM public."Product" WHERE id=$1', [orderProduct.productID]);
  const oldProductStock = oldProductStockTemp.rows[0].stock;

  // Order Product Quantities
  const oldOrderProductQtyTemp = await db.query('SELECT quantity FROM public."OrderProduct" WHERE id=$1', [orderProduct.orderProductID]);
  if(oldOrderProductQtyTemp.rows === 0){
    res.status(204).json({
      status: "ID did not match."
    });
  }
  const oldOrderProductQty = oldOrderProductQtyTemp.rows[0].quantity;
  const newOrderProductQty = orderProduct.quantity;

  const orderProductQtyDiff = newOrderProductQty - oldOrderProductQty;

  // When diff is +ve => take away from stock
  if(orderProductQtyDiff > 0) {
    console.log(oldProductStock - orderProductQtyDiff)
    // Check when taking away from stock - it doesnt go into -ve
    if(oldProductStock - orderProductQtyDiff < 0) {
      return result
    }
    result = oldProductStock - orderProductQtyDiff
  } else {
    result = oldProductStock + (Math.abs(orderProductQtyDiff))
  }
  return result;
}

export async function updateOrderProductsFromOrder (orderProducts, orderID) {
  let result = {
    orderProducts: []
  };
  const oldOrderProductsResult = await db.query('SELECT * FROM public."OrderProduct" WHERE "orderID" = $1', [orderID]);

  const oldOrderProducts = oldOrderProductsResult.rows;
  const newOrderProducts = orderProducts;

  // Use Delete Order Product by also updating stock
  if(oldOrderProducts.length > newOrderProducts.length) {
    let orderProductIDsToDelete = []
  
    oldOrderProducts.forEach(oldOrderProduct => {
      newOrderProducts.forEach(newOrderProduct => {
        if(oldOrderProduct.id != newOrderProduct.orderProductID) {
          orderProductIDsToDelete.push(oldOrderProduct.id)
        }
      })
    });

    const deleteOrderProduct = async item => {
      await db.query('DELETE FROM public."OrderProduct" WHERE id=$1', [item])
    };
    const deleteOrderProducts = async () => {
      return Promise.all(orderProductIDsToDelete.map(item => deleteOrderProduct(item)))
    };
    deleteOrderProducts().then(response => {
      console.log(response)
    }).catch(error => {
      console.log(error);
    });

  } else if(oldOrderProducts.length < newOrderProducts.length) {
    let orderProductsToAdd = []
  
    newOrderProducts.forEach(newOrderProduct => {
      oldOrderProducts.forEach(oldOrderProduct => {
        if(oldOrderProduct.id != newOrderProduct.orderProductID) {
          orderProductsToAdd.push(newOrderProduct)
        }
      })
    });

    const addOrderProduct = async item => {
      const res = {
        url: `${currentURL}/api/v1/orderProduct`,
        method: 'POST',
        json: {
          "orderID": orderID,
          "productID": item.productID,
          "quantity": item.quantity
        },
      };
      await request(res)
      .catch(err => {
        console.log(err)
      })
    };
    const addOrderProducts = async () => {
      return Promise.all(orderProductsToAdd.map(item => addOrderProduct(item)))
    };
    addOrderProducts().then(response => {
      console.log(response)
    }).catch(error => {
      console.log(error);
    });
  } else {
    let orderProductsToUpdate = []
  
    oldOrderProducts.forEach(oldOrderProduct => {
      newOrderProducts.forEach(newOrderProduct => {
        if(oldOrderProduct.id === newOrderProduct.orderProductID) {
          orderProductsToUpdate.push(oldOrderProduct)
        }
      })
    });

    const updateOrderProduct = async item => {
      const res = {
        url: `${currentURL}/api/v1/orderProduct/stock`,
        method: 'PUT',
        json: {
          "orderProductID": item.id,
          "productID": item.productID,
          "quantity": item.quantity
        },
      };
      await request(res)
      .catch(err => {
        console.log(err)
      })
    };
    const updateOrderProducts = async () => {
      return Promise.all(orderProductsToUpdate.map(item => updateOrderProduct(item)))
    };
    updateOrderProducts().then(response => {
      console.log(response)
    }).catch(error => {
      console.log(error);
    });
  }

  return result;
}