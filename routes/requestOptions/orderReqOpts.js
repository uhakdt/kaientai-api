import { HostUrl } from "../../auxillary/globalVariables";

export function orderCheckExtExistsReqOpts (dataMain) {
  const res = {
    url: `${HostUrl}/order/ext/${dataMain.extOrderID}`,
    method: 'GET'
  }
  return res;
}

export function orderAddReqOpts (dataMain) {
  const res = {
    url: `${HostUrl}/order`,
    method: 'POST',
    json: {
      "dateAndTime": dataMain.dateAndTime,
      "statusID": 1,
      "supplierID": dataMain.supplierID,
      "userID": null,
      "totalAmount": dataMain.totalAmount,
      "contactName": dataMain.name,
      "contactEmail": dataMain.email,
      "contactPhone": dataMain.phone,
      "address1": dataMain.address1,
      "address2": dataMain.address2,
      "county": dataMain.county,
      "country": dataMain.country,
      "postcode": dataMain.postcode,
      "offerID": null,
      "extOrderID": dataMain.extOrderID,
      "cartProducts": dataMain.orderProducts,
      "status": dataMain.status
    },
  };
  return res;
}

export function orderUpdateReqOpts (dataMain) {
  const res = {
    url: `${HostUrl}/order`,
    method: 'PUT',
    json: {
      "id": dataMain.orderID,
      "dateAndTime": dataMain.dateAndTime,
      "statusID": 1,
      "supplierID": dataMain.supplierID,
      "userID": null,
      "totalAmount": dataMain.totalAmount,
      "contactName": dataMain.name,
      "contactEmail": dataMain.email,
      "contactPhone": dataMain.phone,
      "address1": dataMain.address1,
      "address2": dataMain.address2,
      "county": dataMain.county,
      "country": dataMain.country,
      "postcode": dataMain.postcode,
      "offerID": null,
      "extOrderID": dataMain.extOrderID,
      "cartProducts": dataMain.orderProducts,
      "status": dataMain.status
    },
  };
  return res;
}