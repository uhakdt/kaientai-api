let currentURL = process.env.URL_PROD;

export function userAddReqOpts (dataMain) {
  const res = {
    url: `${currentURL}/api/v1/user`,
    method: 'POST',
    json: {
      "name": dataMain.name,
      "email": dataMain.email,
      "phone": dataMain.phone,
      "addressID": null,
      "dateAndTimeSignUp": dataMain.dateAndTime,
      "profileImageUrl": null,
      "extUserID": dataMain.extUserID
    },
  };
  return res;
}