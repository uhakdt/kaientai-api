import { GetDateAndTimeNow } from './dateAndTimeNow';

export function klfDataMainDeclerationShopify (dataBody, listOfOrderProducts, supplierID, type, orderID, orderStatus) {
  let res = {
    orderID: type === "add" ? null : orderID,
    name: dataBody.customer.first_name + " " + dataBody.customer.last_name,
    email: dataBody.customer.email,
    phone: dataBody.customer.phone,
    address1: dataBody.shipping_address.address1,
    address2: dataBody.shipping_address.address_2,
    city: dataBody.shipping_address.city,
    county: dataBody.shipping_address.province,
    country: dataBody.shipping_address.country,
    postcode: dataBody.shipping_address.zip,
    intUserID: null,
    extUserID: dataBody.customer.id,
    orderProducts: listOfOrderProducts,
    totalAmount: dataBody.total_price,
    extOrderID: dataBody.id,
    supplierID: supplierID,
    supplierContactName: dataBody.supplierContactName,
    supplierContactEmail: dataBody.supplierContactEmail,
    dateAndTime: GetDateAndTimeNow(),
    status: orderStatus
  }
  return res;
}

export function klfDataMainDeclerationWooCommerce (dataBody, listOfOrderProducts, supplierID, type, orderID, orderStatus) {
  console.log(dataBody.shipping)
  let res = {
    orderID: type === "add" ? null : orderID,
    name: dataBody.shipping.first_name + " " + dataBody.shipping.last_name,
    email: dataBody.billing.email,
    phone: dataBody.billing.phone,
    address1: dataBody.shipping.address_1,
    address2: dataBody.shipping.address_2,
    city: dataBody.shipping.city,
    county: "",
    country: dataBody.shipping.country,
    postcode: dataBody.shipping.postcode,
    intUserID: null,
    extUserID: null,
    orderProducts: listOfOrderProducts,
    totalAmount: dataBody.total,
    extOrderID: dataBody.id,
    supplierID: supplierID,
    supplierContactName: dataBody.supplierContactName,
    supplierContactEmail: "mierdluffy@gmail.com",
    dateAndTime: GetDateAndTimeNow(),
    status: orderStatus
  }
  return res;
}