const express = require("express");
const { appointment } = require("../controllers");
const router = express.Router();
const userController = require("../controllers").user;
const responseHandler = require("../utilities").responseHandler;
const { userInfoLimiter, adminUserInfoLimiter } = require("../utilities/").rateLimit;

router.post("/getUserInfo", userInfoLimiter, (req, res) => {
  let appointmentUserId = req.body.userId;
  if (userController.isUserAdmin(req.user)) {
    appointmentUserId = req.body.appointmentUserId;
  }

  userController
    .getUserInfo(appointmentUserId)
    .then(data => responseHandler.json(res, data))
    .catch(err => {
      responseHandler.error(res, err, req);
    });
});

//withput limiter,just for admins
// userInfoLimiter - to-do
router.post("/getUsersNames", adminUserInfoLimiter, (req, res) => {
  const { users } = req.body;
  userController
    .getUsersName(users)
    .then(data => responseHandler.json(res, data))
    .catch(err => {
      responseHandler.error(res, err, req);
    });
});

router.post("/getUserPhone", (req, res) => {
  const { userId } = req.body;
  userController
    .getUserPhone(userId)
    .then(data => responseHandler.json(res, data))
    .catch(err => {
      responseHandler.error(res, err, req);
    });
});

router.post("/getServiceType", (req, res) => {
  const { userId } = req.body;
  userController
    .getServiceType(userId)
    .then(data => responseHandler.json(res, data))
    .catch(err => {
      responseHandler.error(res, err, req);
    });
});

module.exports = router;
