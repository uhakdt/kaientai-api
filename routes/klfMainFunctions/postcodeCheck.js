import request from 'request-promise';
import { HostUrl } from '../../auxillary/globalVariables.js';

export async function checkPostcodeNewOrder(dataMain) {
  let res = {
    url: `${HostUrl}/postcode/check`,
    method: 'POST',
    json: {
      "supplierID": dataMain.supplierID,
      "code": dataMain.postcode
    },
  };
  let result = await request(res)
  .catch(function(error) {
    console.log(error)
  });
  return result.local;
}