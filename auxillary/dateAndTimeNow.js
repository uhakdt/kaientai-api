Date.prototype.addHours = function(h) {
  this.setTime(this.getTime());
  return this;
}

export function GetDateAndTimeNow () {
  let dt = new Date().addHours(1).toISOString().replace('T', ' ').replace();
  dt = dt.substring(0, dt.length - 5);
  return dt;
}