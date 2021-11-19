export function productFormatOrderProductsShopify (orderProducts) {
  // Variable declarations
  let listOfOrderProducts = []
  for (let i = 0; i < orderProducts.length; i++) {
    const e = orderProducts[i];
    let orderProduct = {
      title: e.variant_title === "" || e.variant_title === null ? e.title: e.title + " - " + e.variant_title,
      price: e.price,
      imageUrl: null,
      quantity: e.quantity,
    }
    listOfOrderProducts.push(orderProduct);
  }
  return listOfOrderProducts;
}

export function productFormatOrderProductsShopifyWooCommerce (orderProducts) {
  let listOfOrderProducts = []
  for (let i = 0; i < orderProducts.length; i++) {
    const e = orderProducts[i];
    let orderProduct = {
      title: e.name,
      price: e.price,
      imageUrl: null,
      quantity: e.quantity,
    }
    listOfOrderProducts.push(orderProduct);
  }
  return listOfOrderProducts;
}

export function productCheckIfEnoughStock (orderProducts, listOfProduct) {
  let orderToBeFulfilledCount = 0;
  let orderToBeFulfilled = false;
  // ORDER ITEMS QUANTITY <= STOCK ITEMS QUANTITY
  orderProducts.forEach(orderItem => {
    for (let i = 0; i < listOfProduct.length; i++) {
      let stockItem = listOfProduct[i];
      if(stockItem.title.toLowerCase() === orderItem.title.toLowerCase() && orderItem.quantity <= stockItem.stock){
        orderToBeFulfilledCount += 1;
        break;
      }
    }
  })
  if(orderToBeFulfilledCount === orderProducts.length){
    orderToBeFulfilled = true;
  }
  return orderToBeFulfilled;
}