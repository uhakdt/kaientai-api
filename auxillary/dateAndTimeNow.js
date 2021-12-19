Date.prototype.addHours = function(h) {
  this.setTime(this.getTime());
  return this;
}

export function GetDateAndTimeNow() {
  let dt = new Date().addHours(1).toISOString().replace('T', ' ');
  dt = dt.substring(0, dt.length - 5);
  return dt;
}

export function GetDateAndTimeNowInMs() {
  let dt = new Date().addHours(1).toISOString().replace('T', ' ');
  dt = dt.substring(0, dt.length - 5);
  return Date.parse(dt);
}

export function ConvertStringDateAndTimeToMs(date) {
  let dt = new Date(date).toISOString().replace('T', ' ');
  dt = dt.substring(0, dt.length - 5);
  return Date.parse(dt);
}

export function DaysInMs(days) {
  return (days * 24 * 60 * 60 * 1000)
}