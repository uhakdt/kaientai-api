export function productFormatOrderProducts (orderProducts) {
  // Variable declarations
  let listOfOrderProducts = []
  for (let i = 0; i < orderProducts.length; i++) {
    const e = orderProducts[i];
    let orderProduct = {
      title: e.variant_title != "" ? e.title + " - " + e.variant_title : e.title,
      price: e.price,
      imageUrl: null,
      quantity: e.quantity,
    }
    listOfOrderProducts.push(orderProduct);
  }
  console.log("---------------------------------")
  console.log("ALL ORDER PRODUCTS: \n", listOfOrderProducts)
  console.log("---------------------------------")
  return listOfOrderProducts;
}