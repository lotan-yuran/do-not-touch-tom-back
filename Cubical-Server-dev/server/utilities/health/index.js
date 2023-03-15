const healthConfig = {
  http: false,
  redis: false,
  db: false
};

const checkHealth = () => Object.values(healthConfig).every(x => x === true);
const setHealth = (k, v) => (healthConfig[k] = v);

module.exports = {
  checkHealth,
  setHealth
};
