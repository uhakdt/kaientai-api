let currentURL = process.env.URL_PROD;

export function productGetReqOpts () {
  let res = {
    url: `${currentURL}/api/v1/products/all`,
    method: 'GET'
  };
  return res;
}

export function productUpdateStockReqOpts () {
  const res = {
    url: `${currentURL}/api/v1/product/stock`,
    method: 'PUT',
    json: {
      "id": null,
      "stock": null
    },
  };
  return res;
}