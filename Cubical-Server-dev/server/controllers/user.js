const DAL = require("../DAL");
const { Sequelize, Op } = require("sequelize");
// const { serviceTypes } = require("../constants");
const HttpError = require("../utilities").HttpError;
const userMDL = require("../../database/models").User;
const { trackException } = require("../utilities/logs");
const { isNullOrUndefinedOrEmpty } = require("../helpers");
const adminMDL = require("../../database/models").Complex_Admin;
const { customResErrors } = require("../constants").customError;
const { getCustomObjClickUser } = require("../utilities").msGraph;
const { getServiceTypeById, getPhoneByPersonalId, getBasicInfoByPersonalId } = require("../utilities/user");

const USER_UNKNOWN_NAME = "לא הוזן";

const userExists = async userId => {
  return await DAL.FindOne(userMDL, {
    attributes: ["id", "phone", "first_name", "last_name"],
    where: { id: userId }
  });
};
const usersName = async userIdArr => {
  return await DAL.Find(userMDL, {
    attributes: ["id", "first_name", "last_name"],
    raw: true,
    where: {
      id: userIdArr
    }
  });
};
const createUser = async user => {
  await DAL.Create(userMDL, user);
};

const getUserFullName = ({ first_name, last_name }) => {
  if (isNullOrUndefinedOrEmpty(first_name, last_name)) return USER_UNKNOWN_NAME;
  return `${first_name} ${last_name}`;
};

module.exports = {
  async isUserAdmin(userId) {
    if (!userId) {
      throw new HttpError({ error: customResErrors.parametersValidation });
    }

    const user = await DAL.Find(adminMDL, {
      attributes: ["user_id", "complex_id"],
      raw: true,
      where: { user_id: userId }
    });

    if (user) {
      const complexesId = user.map(i => i.complex_id);
      return { isAdmin: true, complexesId: complexesId };
    }

    return { isAdmin: false, complexId: null };
  },

  async findOrCreateUserFromClick(userId) {
    if (!userId) {
      throw new HttpError({ error: customResErrors.parametersValidation });
    }

    const userExistsInfo = await userExists(userId);
    if (userExistsInfo) {
      const { first_name, last_name } = userExistsInfo;
      return { fullName: getUserFullName({ first_name, last_name }) };
    }
    const clickUser = await getCustomObjClickUser(userId);

    if (!clickUser) {
      throw new HttpError({ error: customResErrors.user.userClickNotExists, params: { userId } });
    }
    const phoneFromCookie = await getPhoneByPersonalId(userId);
    if (!phoneFromCookie) {
      throw new Error("phone number not found");
    }
    const user = { ...clickUser, phone: phoneFromCookie };
    await createUser(user);
    const { first_name, last_name } = user;
    return { fullName: getUserFullName({ first_name, last_name }) };
  },

  async getUsersName(userIdArr) {
    const usersFirstLastName = await usersName(userIdArr);
    const fullNames = usersFirstLastName.map(user => {
      return {
        id: user.id,
        fullName: user.first_name + " " + user.last_name
      };
    });
    return fullNames;
  },

  async getUserInfo(userId) {
    if (!userId) {
      throw new HttpError({ error: customResErrors.parametersValidation });
    }

    const [user, userFromCookie] = await Promise.all([userExists(userId), getBasicInfoByPersonalId(userId)]);
    if (user) {
      return { phone: user.phone, fullName: getUserFullName(user) };
    }

    if (!userFromCookie) {
      const ERROR = new HttpError({ error: "user not found", params: { userId } });
      trackException(ERROR, { name: "user doesnt exist in cookie", function: "getUserInfo", userId });
    }

    // if (
    //   ![...serviceTypes.HOVA, ...serviceTypes.KEVA, ...serviceTypes.MILOEEM, ...serviceTypes.AHAZIM].includes(
    //     userFromCookie.service_type
    //   )
    // ) {
    //   const ERROR = new HttpError({ error: customResErrors.forbidden, params: { userId } });
    //   trackException(ERROR, {
    //     name: "user forbidden",
    //     function: "getUserInfo",
    //     userId,
    //     userServiceType: userFromCookie.service_type
    //   });

    //   throw ERROR;
    // }

    const clickUser = await getCustomObjClickUser(userId);

    if (!clickUser && !userFromCookie) {
      throw new HttpError({ error: customResErrors.user.userClickNotExists, params: { userId } });
    }

    const fullName = clickUser
      ? getUserFullName(clickUser)
      : getUserFullName({ first_name: userFromCookie.first_name, last_name: userFromCookie.last_name });

    return {
      phone: userFromCookie.cellphone_num,
      fullName
    };
  },

  async getUserPhone(userId) {
    if (!userId) {
      throw new HttpError({ error: customResErrors.parametersValidation });
    }

    const user = await userExists(userId);
    if (user) {
      return { phone: user.phone };
    }

    const userFromCookie = await getBasicInfoByPersonalId(userId);

    if (!userFromCookie) {
      const ERROR = new HttpError({ error: customResErrors.user.userNotFound, params: { userId } });
      trackException(ERROR, { name: "user doesnt exist in cookie", function: "getUserPhone", userId });

      throw ERROR;
    }

    return {
      phone: userFromCookie.cellphone_num
    };
  },
  async getServiceType(userId) {
    return await getServiceTypeById(userId);
  },

  async deleteUsers(transaction) {
    await DAL.Delete(userMDL, {
      where: {
        id: { [Op.notIn]: Sequelize.literal(`(SELECT "user_id" FROM "Appointment")`) }
      },
      transaction
    });
  }
};
