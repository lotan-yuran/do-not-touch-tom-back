const isNullOrUndefinedOrEmpty = (...args) => {
  return args.length === 0 || args.some(value => value === null || value === undefined || value === "");
};

const isNotObject = (...args) => {
  return (
    args.length === 0 ||
    args.some(value => value === undefined || value === null || value.constructor !== Object)
  );
};

const isObjectContainsEmptyNullOrUndefined = obj => {
  return Object.values(obj).some(
    x =>
      x === null ||
      x === "" ||
      x === undefined ||
      (typeof x === "object" && isObjectContainsEmptyNullOrUndefined(x))
  );
};

module.exports = { isNullOrUndefinedOrEmpty, isNotObject, isObjectContainsEmptyNullOrUndefined };
