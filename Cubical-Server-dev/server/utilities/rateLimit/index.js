const chalk = require("chalk");
const { setHealth } = require("../../utilities/health/index");
const customResErrors = require("../../constants").customError.customResErrors;

const redis = require("redis");
const rateLimit = require("express-rate-limit");
const RedisStore = require("rate-limit-redis");

let RedisClient = null;

// Add your cache name and access key.
RedisClient = redis.createClient(6380, process.env.REDIS_HOST, {
  auth_pass: process.env.REDIS_PASSWORD,
  tls: { servername: process.env.REDIS_HOST }
});

RedisClient.on("connect", function () {
  console.log(chalk.bgGreen.whiteBright("[Redis] Connection established"));
  setHealth("redis", true);
});

RedisClient.on("error", function (err) {
  chalk.bgRed.whiteBright(`[Redis] Connection failed: ${err.message}`);
});

const rateLimitIpDebug = req => {
  console.log(`req.rateLimit ${JSON.stringify(req.rateLimit)}`);
  console.log(`req.ip ${req.ip}`);
  console.log(`req.ips ${req.ips}`);
  console.log(`req.connection.remoteAddress ${req.connection.remoteAddress}`);
};

const customHandler = function (req, res /*next*/) {
  if (process.env.DEBUG && process.env.DEBUG.includes("rateLimitIp")) {
    rateLimitIpDebug(req);
  }
  const body = JSON.stringify(req.body);
  console.info(`ratelimit|${req.ip}|${req.body.userId}|${body}`);

  res.status(404).json(customResErrors.user.userNotFound);
};

const customKeyGenerator = req => {
  return req.ip.split(":")[0];
};

const userInfoLimiter = rateLimit({
  // windowMs: 60 * 1000 * process.env.RATE_LIMIT_WINDOWMS_MINUTES, //miliseconds
  max: 2 * process.env.RATE_LIMIT_MAX_REQ,
  message: customResErrors.user.userNotFound,
  handler: customHandler,
  headers: false,
  statusCode: 404,
  store: new RedisStore({
    client: RedisClient,
    expiry: 60 * process.env.RATE_LIMIT_WINDOWMS_MINUTES, //seconds
    prefix: "userInfo:"
  }),
  keyGenerator: customKeyGenerator
});

const adminUserInfoLimiter = rateLimit({
  // windowMs: 60 * 1000 * process.env.RATE_LIMIT_WINDOWMS_MINUTES, //miliseconds
  max: 10 * process.env.RATE_LIMIT_MAX_REQ,
  message: customResErrors.user.userNotFound,
  handler: customHandler,
  headers: false,
  statusCode: 404,
  store: new RedisStore({
    client: RedisClient,
    expiry: 60 * process.env.RATE_LIMIT_WINDOWMS_MINUTES, //seconds
    prefix: "userInfoAdmin:"
  }),
  keyGenerator: customKeyGenerator
});

module.exports = { adminUserInfoLimiter, userInfoLimiter };
