const customResErrors = {
  generic: {
    status: 500,
    message: "",
    details: "An unknown error occurred"
  },
  parametersValidation: {
    status: 400,
    message: "",
    details: "Parameters validation failed"
  },
  user: {
    userInfoValidationFailed: {
      status: 500,
      message: "",
      details: "User {userId} with fullName {fullName} info invalid"
    },
    userNotFound: {
      status: 404,
      message: "",
      details: "User {userId} not exists anywhere"
    },
    userClickNotExists: {
      status: 500,
      message: "",
      details: "User {userId} has no click - MYIDF user"
    }
  },
  notFound: {
    status: 404,
    message: "",
    details: "The requested resource could not be found"
  },
  badRequest: {
    status: 400,
    message: "",
    details: "Bad request"
  },
  forbidden: {
    status: 403,
    message: "אין באפשרותך לבצע פעולה זאת",
    details: "User not allowed to perform the request"
  },
  appointment: {
    timeValidation: {
      status: 500,
      message: "",
      details: "Appointment requested datetime {startDatetime} is not valid"
    },
    appointmentExists: {
      status: 500,
      message: "",
      details: "User {userId} has already has appointment in the requested time"
    },
    exceededMaxAppointments: {
      status: 500,
      message:
        "לא ניתן לבצע יותר מ-{maxPossibleAppointments} הזמנות ביום. אפשר להזמין עמדה ליום אחר או לבטל את אחת ההזמנות של יום זה",
      details:
        "User {userId} has reached the maximum number of appointments for day = {day}, complexId = {complexId}, maximum = {maxPossibleAppointments}"
    },
    noAvailableStation: {
      status: 409,
      message: "לא נמצאה עמדה פנויה בזמן המבוקש, אפשר לבחור זמן אחר ולנסות שוב",
      details: "Not found available station to allocate"
    }
  },
  station: {
    noStationMatch: {
      status: 500,
      message: "",
      details: "Station type does not exists or there are no stations of the typeId = {stationTypeId}"
    }
  }
};

const getResponseErrorObject = ({ error, params }) => {
  let { status, message, details } = error;

  if (params instanceof Object) {
    for (let [key, value] of Object.entries(params)) {
      const reg = new RegExp(`{${key}}`, "g");
      message = message.replace(reg, value);
      details = details.replace(reg, value);
    }
  }

  return {
    status,
    message,
    details
  };
};

module.exports = { customResErrors, getResponseErrorObject };

// getErrorMessage(failures.appointment.noAvailableStation, { userId: 3 });
