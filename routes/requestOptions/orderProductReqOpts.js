let currentURL = process.env.URL;

export function orderProductReqOpts (dataMain) {
  const res = {
    url: `${currentURL}/api/v1/orderProduct`,
    method: 'POST',
    json: {
      "orderID": null,
      "title": null,
      "quantity": null
    },
  };
  return res;
}