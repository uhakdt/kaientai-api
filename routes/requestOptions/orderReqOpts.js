let currentURL = process.env.URL;

export function orderCheckExtExistsReqOpts (dataMain) {
  const res = {
    url: `${currentURL}/api/v1/order/ext/${dataMain.extOrderID}`,
    method: 'GET'
  }
  return res;
}

export function orderAddReqOpts (dataMain) {
  const res = {
    url: `${currentURL}/api/v1/order`,
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
      "city": dataMain.city,
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
    url: `${currentURL}/api/v1/order`,
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
      "city": dataMain.city,
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