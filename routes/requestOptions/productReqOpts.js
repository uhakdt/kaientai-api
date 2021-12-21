import { HostUrl } from "../../auxillary/globalVariables";

export function productUpdateStockReqOpts () {
  const res = {
    url: `${HostUrl}/product/stock`,
    method: 'PUT',
    json: {
      "id": null,
      "stock": null
    },
  };
  return res;
}