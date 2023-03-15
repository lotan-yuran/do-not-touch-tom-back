const getValuesToAdd = (existsValues, defaultValues) => {
  return existsValues
    ? defaultValues
        .map(item => (existsValues.find(existsItem => existsItem.id === item.id) ? undefined : item))
        .filter(all => all !== undefined)
    : defaultValues;
};

const getValuesToUpdate = (existsValues, defaultValues, dynamicValField) => {
  return existsValues
    ? defaultValues
        .map(item =>
          existsValues.find(i => i.id === item.id && i[dynamicValField] !== item[dynamicValField])
            ? item
            : undefined
        )
        .filter(all => all !== undefined)
    : [];
};

const getValuesToDelete = (existsValues, defaultValues) => {
  return existsValues
    ? existsValues
        .map(item => (defaultValues.map(defItem => defItem.id).indexOf(item.id) === -1 ? item : undefined))
        .filter(all => all !== undefined)
    : [];
};

module.exports = {
  getValuesToAdd,
  getValuesToUpdate,
  getValuesToDelete
};
