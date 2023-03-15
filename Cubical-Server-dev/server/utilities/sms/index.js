// debug
const smsDebugLog = require("debug")("smsService:log");
const smsErrorLog = require("debug")("smsService:error");
// bind smsDebugLog prints to console.log (smsErrorLog goes to stderr)
smsDebugLog.log = console.log.bind(console);

// services & utils
const axios = require("axios");
const DAL = require("../../DAL");
const { getAccessToken } = require("../accessToken");
const { isNullOrUndefinedOrEmpty } = require("../../helpers");

// models
const smsLogMDL = require("../../../database/models").SmsLog;

// constants
const { smsStatusCodes } = require("../../constants");
const { smsTypes } = require("./smsType");
const { trackException, trackEvent } = require("../logs");

const isPhoneInvalid = phone => {
  const phonesList = [].concat(phone);
  phonesList.some(i => !i || i.length !== 10);
};

const writeToSmsLog = async (phonesList, smsTypeId, smsText) => {
  try {
    let phonesToSend = null;
    if (process.env.SMS_API_DEBUG === "true") {
      smsDebugLog(
        `SMS_API_DEBUG set to ${process.env.SMS_API_DEBUG}. All SMS messages will be sent to ${process.env.SMS_API_DEBUG_PHONE}`
      );
      phonesToSend = process.env.SMS_API_DEBUG_PHONE;
    } else {
      phonesToSend = phonesList;
    }

    let smsLogList = [];
    if (phonesToSend instanceof Array) {
      smsLogList = phonesToSend.map(phoneToSend => ({
        phone: phoneToSend,
        text: smsText,
        smsSentAt: null,
        smsStatusCode: smsStatusCodes.SMS_NOT_SENT
      }));
    } else {
      smsLogList.push({
        phone: phonesToSend,
        sms_type_id: smsTypeId,
        text: smsText,
        sent_at: null,
        status_code: smsStatusCodes.SMS_NOT_SENT
      });
    }

    return new Promise((resolve, reject) => {
      DAL.BulkCreate(smsLogMDL, smsLogList)
        .then(async result => resolve(result))
        .catch(err => {
          smsErrorLog(err);
          reject(err);
        });
    });
  } catch (err) {
    // smsErrorLog(err);
    throw err;
  }
};

const sendSMS = async (smsText, toMobilePhone) => {
  try {
    if (process.env.SMS_API_ENABLED !== "true") {
      throw new Error(`process.env.SMS_API_ENABLED set to ${process.env.SMS_API_ENABLED}, SMS not sent.`);
    }

    let phoneToSend = "";
    if (process.env.SMS_API_DEBUG === "true") {
      smsDebugLog(
        `SMS_API_DEBUG set to ${process.env.SMS_API_DEBUG}. All SMS messages will be sent to ${process.env.SMS_API_DEBUG_PHONE}`
      );
      phoneToSend = process.env.SMS_API_DEBUG_PHONE;
    } else {
      phoneToSend = toMobilePhone;
    }

    const params = {
      Target: phoneToSend,
      Source: process.env.SMS_API_FROM,
      Message: smsText
    };

    try {
      const accessToken = await getAccessToken(process.env.DIGITAL_SERVICES_SCOPE);

      const headers = {
        "digital-services-key": process.env.DIGITAL_SERVICES_KEY,
        Authorization: `Bearer ${accessToken}`
      };

      trackEvent("about to send sms", { params });
      return await axios.get(process.env.SMS_API_LINK, {
        headers: headers,
        params: params
      });
    } catch (err) {
      throw err;
    }
  } catch (err) {
    trackException(err, { name: "cant send sms", smsText, phoneToSend });
    throw err;
  }
};

const createSMS = async ({ toMobilePhone, typeId, text }) => {
  try {
    if (isNullOrUndefinedOrEmpty(typeId, toMobilePhone, text)) {
      throw new Error(`Parameters validation failed`);
    } else if (isPhoneInvalid(toMobilePhone)) {
      throw new Error(`SMS not sent to ${toMobilePhone} - not valid.`);
    }

    return writeToSmsLog(toMobilePhone, typeId, text);
  } catch (err) {
    // smsErrorLog(err);
    throw err;
  }
};

const canSendNow = () => {
  if (process.env.SMS_API_ENABLED !== "true") {
    return false;
  }

  const currentHour = new Date().getUTCHours();

  // don't send SMS between these hours
  const morningHour = new Date("Mon Apr 13 2020 07:00:00 GMT+0200").getUTCHours();
  const nightHour = new Date("Mon Apr 13 2020 22:00:00 GMT+0200").getUTCHours();

  if (currentHour >= morningHour && currentHour < nightHour) {
    return true;
  } else if (process.env.SMS_API_DEBUG === "true") {
    return true;
  } else {
    return false;
  }
};

const setSmsErrorDetails = (smsObj, smsReturnedAck) => {
  const smsSuccessTagInd = "<Success>true</Success>";
  const errCodeOpenTag = "<ErrorCode>";
  const errCodeCloseTag = "</ErrorCode>";
  const errorDescOpenTag = "<ErrorDesc>";
  const errorDescCloseTag = "</ErrorDesc>";
  const smsErrorCode = smsReturnedAck.substring(
    smsReturnedAck.indexOf(errCodeOpenTag) + errCodeOpenTag.length,
    smsReturnedAck.indexOf(errCodeCloseTag)
  );
  const smsErrorDesc = smsReturnedAck.substring(
    smsReturnedAck.indexOf(errorDescOpenTag) + errorDescOpenTag.length,
    smsReturnedAck.indexOf(errorDescCloseTag)
  );

  if (smsReturnedAck && smsReturnedAck.includes(smsSuccessTagInd)) {
    smsObj.status_code = smsStatusCodes.SMS_SENT;
  } else {
    smsObj.status_code = smsErrorCode;
    smsObj.sms_error_desc = smsErrorDesc;
  }
};

const sendSmsAndUpdateLog = async smsToSend => {
  try {
    const sendSmsAck = (await sendSMS(smsToSend.text, smsToSend.phone)).data;
    setSmsErrorDetails(smsToSend, sendSmsAck);

    smsToSend.sent_at = new Date().toISOString();
  } catch (err) {
    smsToSend.status_code = smsStatusCodes.SMS_ERROR;
    smsErrorLog("Failed to send sms id %d because of the following error: %o", smsToSend.id, err);
    throw err;
  } finally {
    await DAL.Update(smsLogMDL, smsToSend, { where: { id: smsToSend.id } });
  }
};

const sendFromSmsLog = async ({ isHttpTrigger }) => {
  try {
    if (process.env.SMS_API_ENABLED === "true") {
      if (isHttpTrigger && process.env.SMS_API_TIMER_SENDING_ENABLED === "true") {
        const resMsg = `Triggered by http trigger but process.env.SMS_API_TIMER_SENDING_ENABLED is ${process.env.SMS_API_TIMER_SENDING_ENABLED}, not running`;
        smsDebugLog(resMsg);
        return resMsg;
      }

      const runningLogMsg = isHttpTrigger ? "http request" : "internal timer";
      smsDebugLog(`triggered by ${runningLogMsg}! ♥ Right now it's ${new Date().toTimeString()}`);

      if (process.env.SMS_API_DEBUG === "true") {
        smsDebugLog(
          `SMS_API_DEBUG set to ${process.env.SMS_API_DEBUG}. All SMS messages will be sent to ${process.env.SMS_API_DEBUG_PHONE}`
        );
      }

      smsDebugLog(
        `process.env.SMS_API_TIMER_SENDING_ENABLED set to ${process.env.SMS_API_TIMER_SENDING_ENABLED}`
      );

      const smsList = await DAL.Find(smsLogMDL, {
        raw: true,
        order: [["created_at", "ASC"]],
        limit: parseInt(process.env.SMS_API_SEND_LIMIT),
        where: {
          status_code: smsStatusCodes.SMS_NOT_SENT
        }
      });
      let total = 0;
      let smsSuccessCount = 0;
      let smsFailureCount = 0;
      if (smsList.length > 0 && canSendNow()) {
        const smsSendAndLogPromises = smsList.map(sendSmsAndUpdateLog);
        smsDebugLog("Sending %d SMS", smsSendAndLogPromises.length);
        const promiseResults = await Promise.allSettled(smsSendAndLogPromises);
        // smsDebugLog(promiseResults);
        smsSuccessCount = promiseResults.filter(promise => promise.status == "fulfilled").length;
        smsFailureCount = promiseResults.length - smsSuccessCount;

        total = smsSendAndLogPromises.length;
      }

      const resObj = {
        total: total,
        success: smsSuccessCount,
        failure: smsFailureCount
      };

      smsDebugLog("Sent: %d, Success: %d, Failure: %d", resObj.total, resObj.success, resObj.failure);

      return resObj;
    }
    return `process.env.SMS_API_ENABLED set to ${process.env.SMS_API_ENABLED}, not running.`;
  } catch (err) {
    smsErrorLog(err);
    throw err;
  }
};

const smsServiceTimer = async () => {
  try {
    if (process.env.SMS_API_ENABLED === "true") {
      if (process.env.SMS_API_TIMER_SENDING_ENABLED === "true") {
        await sendFromSmsLog({ isHttpTrigger: false });
        setTimeout(() => smsServiceTimer(), process.env.SMS_API_TIMER_SECONDS * 1000);
      }
    } else {
      smsDebugLog(`process.env.SMS_API_ENABLED set to ${process.env.SMS_API_ENABLED}, not running`);
    }
  } catch (err) {
    smsErrorLog(err);
  }
};

module.exports = { createSMS, smsServiceTimer };
