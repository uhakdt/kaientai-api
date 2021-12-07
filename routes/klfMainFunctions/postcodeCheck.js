import request from 'request-promise';

let currentURL = process.env.URL;

export async function checkPostcodeNewOrder(dataMain) {
  let res = {
    url: `${currentURL}/api/v1/postcode/check`,
    method: 'POST',
    json: {
      "supplierID": dataMain.supplierID,
      "code": dataMain.postcode
    },
  };
  let result = await request(res)
  .catch(function(err) {
    console.log(err)
  });
  return result.local;
}