import request from 'request-promise';
import { HostUrl } from '../../auxillary/globalVariables';

export async function addUserNewOrder (dataMain) {
  let result;
  const res = {
    url: `${HostUrl}/user`,
    method: 'POST',
    json: {
      "name": dataMain.name,
      "email": dataMain.email,
      "phone": dataMain.phone,
      "dateAndTimeSignUp": dataMain.dateAndTime,
      "extUserID": dataMain.extUserID,
      "isAdmin": false,
      "supplierID": dataMain.supplierID,
      "address1": dataMain.address1,
      "address2": dataMain.addres2,
      "country": dataMain.country,
      "postcode": dataMain.postcode
    },
  };
  await request(res)
  .then(function(res){
    result = res
  })
  .catch(function(error){
    result = error.response.body
  });
  return result
}