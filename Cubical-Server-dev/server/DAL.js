const { trackException } = require("./utilities/logs");

module.exports = {
  // Getting data from model by filter.
  Find(modelName, options) {
    return new Promise((resolve, reject) => {
      modelName
        .findAll(options)
        .then(data => resolve(data))
        .catch(err => {
          trackException(err, { name: "cant execute Find", modelName, options });
          reject(err);
        });
    });
  },

  FindByPk(modelName, key, options) {
    return new Promise((resolve, reject) => {
      modelName
        .findByPk(key, options)
        .then(data => resolve(data))
        .catch(err => {
          trackException(err, { name: "cant execute FindByPk", modelName, key, options });
          reject(err);
        });
    });
  },

  findOrCreate(modelName, options) {
    return new Promise((resolve, reject) => {
      modelName
        .findOrCreate(options)
        .then(data => resolve(data))
        .catch(err => {
          trackException(err, { name: "cant execute findOrCreate", modelName, options });
          reject(err);
        });
    });
  },

  // Getting data of the first obj from db model by filter.

  FindOne(modelName, options) {
    return new Promise((resolve, reject) => {
      modelName
        .findOne(options)
        .then(data => resolve(data))
        .catch(err => {
          trackException(err, { name: "cant execute FindOne", modelName, options });
          reject(err);
        });
    });
  },

  Create(modelName, modalNewObject, options) {
    return new Promise((resolve, reject) => {
      modelName
        .create(modalNewObject, options)
        .then(isCreated => {
          resolve(isCreated);
        })
        .catch(err => {
          trackException(err, { name: "cant execute Create", modelName, modalNewObject, options });
          reject(err);
        });
    });
  },

  BulkCreate(modelName, modalNewObjects, options) {
    return new Promise((resolve, reject) => {
      modelName
        .bulkCreate(modalNewObjects, options)
        .then(isCreated => resolve(isCreated))
        .catch(err => {
          trackException(err, {
            name: "cant execute BulkCreate",
            modelName,
            options
          });
          reject(err);
        });
    });
  },

  Update(modelName, updateObject, options) {
    return new Promise((resolve, reject) => {
      modelName
        .update(updateObject, options)
        .then(updateAmount => {
          resolve(updateAmount);
        })
        .catch(err => {
          trackException(err, { name: "cant execute Update", modelName, updateObject, options });
          reject(err);
        });
    });
  },
  Delete(modelName, options) {
    return new Promise((resolve, reject) => {
      modelName
        .destroy(options)
        .then(data => {
          resolve(data);
        })
        .catch(err => {
          trackException(err, { name: "cant execute Delete", modelName, options });
          reject(err);
        });
    });
  },
  Upsert(modelName, modalNewObject, options) {
    return new Promise((resolve, reject) => {
      modelName
        .upsert(modalNewObject, options)
        .then(isCreated => {
          resolve(isCreated);
        })
        .catch(err => {
          trackException(err, { name: "cant execute Upsert", modelName, modalNewObject, options });
          reject(err);
        });
    });
  },
  Decrement(modelName, fields, options) {
    return new Promise((resolve, reject) => {
      modelName
        .decrement(fields, options)
        .then(isCreated => {
          resolve(isCreated);
        })
        .catch(err => {
          trackException(err, {
            name: "cant execute Decrement",
            modelName,
            fields,
            options
          });
          reject(err);
        });
    });
  },

  Count(modelName, options) {
    return new Promise((resolve, reject) => {
      modelName
        .count(options)
        .then(count => {
          resolve(count);
        })
        .catch(err => {
          trackException(err, {
            name: "cant execute Count",
            modelName,
            options
          });
          reject(err);
        });
    });
  }
};
