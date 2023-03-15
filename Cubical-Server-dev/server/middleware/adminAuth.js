const responseHandler = require("../utilities").responseHandler;
const { isUserAdmin } = require("../controllers").user;

const adminAuth = async (req, res, next) => {
  try {
    const userId = req?.user || req?.body?.userId || req?.query?.userId;

    if (!userId) {
      return responseHandler.unauthorized(res);
    }

    const user = await isUserAdmin(userId);

    if (user?.isAdmin) {
      const defaultComplexId = user?.complexesId[0];
      // authentication and authorization successful
      if (!req.body.complexId) {
        req.body.complexId = defaultComplexId;
      }

      if (!req.query.complexId) {
        req.query.complexId = defaultComplexId;
      }
      //check if user is admin of the complex
      if (
        !user.complexesId.find(i => i == req.body.complexId) ||
        !user.complexesId.find(i => i == req.query.complexId)
      ) {
        return responseHandler.unauthorized(res);
      }

      return next();
    }

    return responseHandler.unauthorized(res);
  } catch (err) {
    console.error({ message: `admin authorize error - ${err}` });
    return responseHandler.unauthorized(res);
  }
};

module.exports = adminAuth;
