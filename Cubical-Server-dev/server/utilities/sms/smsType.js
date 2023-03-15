const DEFAULT_LINK = process.env.SMS_CUBICAL_APP_LINK;
const moment = require("moment");

// const smsTexts = {
//     1: "היי {firstName}, אנחנו נאלצים לבטל לצערנו את הזמנת עמדת חדר דיונים שהזמנת ליום {fullDay} בשעה {fullHour}. ניתן לקבוע הזמנה חדה במקום ההזמנה שבוטלה בלינק: {link}."
// }

const smsTypes = {
  APPOINTMENT_CANCELED: {
    id: 1,
    text: ({ name, stationType, appointmentDatetime, link = DEFAULT_LINK }) => {
      return getSmsText(
        "היי {name}, לצערנו אנחנו נאלצים לבטל את הזמנת עמדת {stationType} שהזמנת ליום {fullDay} בשעה {fullHour}. ניתן לקבוע הזמנה חדשה במקום ההזמנה שבוטלה בלינק: {link}.",
        {
          name,
          stationType,
          fullDay: moment(appointmentDatetime).utc().tz("Israel").format("DD/MM/YYYY"),
          fullHour: moment(appointmentDatetime).utc().tz("Israel").format("HH:mm"),
          link
        }
      );
    }
  },
  APPOINTMENT_BY_ANOTHER: {
    id: 2,
    text: ({ name, nameAnother, stationType, appointmentDatetime, link = DEFAULT_LINK }) => {
      return getSmsText(
        `היי {name}, לידיעתך עמדת {stationType} הוזמנה בשבילך ע"י {nameAnother} ליום {fullDay} בשעה {fullHour}. ניתן לצפות בהזמנות שלך בלינק: {link}.`,
        {
          name,
          stationType,
          nameAnother,
          fullDay: moment(appointmentDatetime).utc().tz("Israel").format("DD/MM/YYYY"),
          fullHour: moment(appointmentDatetime).utc().tz("Israel").format("HH:mm"),
          link
        }
      );
    }
  }
};

const getSmsText = (text, params) => {
  if (params instanceof Object) {
    for (let [key, value] of Object.entries(params)) {
      const reg = new RegExp(`{${key}}`, "g");
      text = text.replace(reg, value);
    }
  }

  return text;
};

module.exports = { smsTypes };
