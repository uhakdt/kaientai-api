import { GetDateAndTimeNow } from './dateAndTimeNow';

export function klfDataMainDecleration (dataBody, listOfOrderProducts, supplierID, type, orderID) {
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
    dateAndTime: GetDateAndTimeNow()
  }
  return res;
}