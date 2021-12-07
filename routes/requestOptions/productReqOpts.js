let currentURL = process.env.URL;

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