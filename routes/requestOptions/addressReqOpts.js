let currentURL = process.env.URL_PROD;

export function addressAddReqOpts (dataMain) {
  let res = {
    url: `${currentURL}/api/v1/address`,
    method: 'POST',
    json: {
      "address1": dataMain.address1,
      "address2": dataMain.address2,
      "city": dataMain.city,
      "county": dataMain.county,
      "country": dataMain.country,
      "postcode": dataMain.postcode
    },
  };
  return res;
}