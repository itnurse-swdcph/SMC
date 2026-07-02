/**
 * Google Apps Script Backend for SMC Survey and Dashboard
 * Crown Prince Hospital Sawang Dandin, Sakon Nakhon Province
 */

function doGet(e) {
  var action = e.parameter.action;
  var callback = e.parameter.callback;
  
  // Initialize sheets if requested or by default
  initializeSheets();
  
  if (action === "getData") {
    return handleGetData(e);
  }
  
  return ContentService.createTextOutput(JSON.stringify({
    status: "success",
    message: "SMC Web API is running. Use action=getData to retrieve data."
  })).setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  // Handle CORS
  if (!e || !e.postData || !e.postData.contents) {
    return ContentService.createTextOutput(JSON.stringify({
      status: "error",
      message: "No post data found"
    })).setMimeType(ContentService.MimeType.JSON)
       .setHeader("Access-Control-Allow-Origin", "*");
  }
  
  try {
    initializeSheets();
    
    var data = JSON.parse(e.postData.contents);
    var type = data.surveyType; // "personnel" or "public"
    
    if (type === "personnel") {
      savePersonnelResponse(data);
    } else if (type === "public") {
      savePublicResponse(data);
    } else {
      throw new Error("Invalid surveyType");
    }
    
    return ContentService.createTextOutput(JSON.stringify({
      status: "success",
      message: "Response saved successfully"
    }))
    .setMimeType(ContentService.MimeType.JSON)
    .setHeader("Access-Control-Allow-Origin", "*");
    
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      status: "error",
      message: error.message
    }))
    .setMimeType(ContentService.MimeType.JSON)
    .setHeader("Access-Control-Allow-Origin", "*");
  }
}

// Global sheet configuration
var HEADERS_PERSONNEL = [
  "Timestamp", "Gender", "Age", "Type", "TypeOther", "Position", "PositionOther", 
  "Income", "AgreeSMC", "DisagreeReason", "FastService", "WillUseService", 
  "DesiredClinics", "DesiredClinicsOther", "ConvenientDoctor", "ReduceQueue", 
  "ConvenientTime", "WillingToPayExtra", "PayExtraParts", "PayExtraPartsOther", 
  "PreferredLocation", "PreferredLocationOther", 
  "OPDService", "OPDReason", 
  "IPDService", "IPDReason", 
  "ORService", "ORReason", 
  "Suggestions"
];

var HEADERS_PUBLIC = [
  "Timestamp", "Gender", "Age", "Occupation", "OccupationOther", 
  "TreatmentRight", "TreatmentRightOther", "Income", "AgreeSMCHospital", "DisagreeReasonHospital", 
  "AgreeSMCOPD", "DisagreeReasonOPD", "AgreeSMCIPD", "DisagreeReasonIPD", 
  "AgreeSMCOR", "DisagreeReasonOR", "FastService", "WillUseService", "DesiredClinics", 
  "DesiredClinicsOther", "ConvenientDoctor", "ReduceQueue", "ConvenientTime", 
  "WillingToPayExtra", "PayExtraParts", "PayExtraPartsOther", "PreferredLocation", 
  "PreferredLocationOther", 
  "OPDService", "OPDReason", 
  "IPDService", "IPDReason", 
  "ORService", "ORReason", 
  "Suggestions"
];

function initializeSheets() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  
  // 1. Personnel Sheet
  var personnelSheet = ss.getSheetByName("PersonnelResponses");
  if (!personnelSheet) {
    personnelSheet = ss.insertSheet("PersonnelResponses");
    personnelSheet.appendRow(HEADERS_PERSONNEL);
    // Format Header
    personnelSheet.getRange(1, 1, 1, HEADERS_PERSONNEL.length)
      .setFontWeight("bold")
      .setBackground("#0F2C59")
      .setFontColor("#FFFFFF");
  }
  
  // 2. Public Sheet
  var publicSheet = ss.getSheetByName("PublicResponses");
  if (!publicSheet) {
    publicSheet = ss.insertSheet("PublicResponses");
    publicSheet.appendRow(HEADERS_PUBLIC);
    // Format Header
    publicSheet.getRange(1, 1, 1, HEADERS_PUBLIC.length)
      .setFontWeight("bold")
      .setBackground("#0F2C59")
      .setFontColor("#FFFFFF");
  }
}

function savePersonnelResponse(data) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName("PersonnelResponses");
  
  var row = [
    new Date(),
    data.Gender || "",
    data.Age || "",
    data.Type || "",
    data.TypeOther || "",
    data.Position || "",
    data.PositionOther || "",
    data.Income || "",
    data.AgreeSMC || "",
    data.DisagreeReason || "",
    data.FastService || "",
    data.WillUseService || "",
    Array.isArray(data.DesiredClinics) ? data.DesiredClinics.join(", ") : (data.DesiredClinics || ""),
    data.DesiredClinicsOther || "",
    data.ConvenientDoctor || "",
    data.ReduceQueue || "",
    data.ConvenientTime || "",
    data.WillingToPayExtra || "",
    Array.isArray(data.PayExtraParts) ? data.PayExtraParts.join(", ") : (data.PayExtraParts || ""),
    data.PayExtraPartsOther || "",
    data.PreferredLocation || "",
    data.PreferredLocationOther || "",
    data.OPDService || "",
    data.OPDReason || "",
    data.IPDService || "",
    data.IPDReason || "",
    data.ORService || "",
    data.ORReason || "",
    data.Suggestions || ""
  ];
  
  sheet.appendRow(row);
}

function savePublicResponse(data) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName("PublicResponses");
  
  var row = [
    new Date(),
    data.Gender || "",
    data.Age || "",
    data.Occupation || "",
    data.OccupationOther || "",
    data.TreatmentRight || "",
    data.TreatmentRightOther || "",
    data.Income || "",
    data.AgreeSMCHospital || "",
    data.DisagreeReasonHospital || "",
    data.AgreeSMCOPD || "",
    data.DisagreeReasonOPD || "",
    data.AgreeSMCIPD || "",
    data.DisagreeReasonIPD || "",
    data.AgreeSMCOR || "",
    data.DisagreeReasonOR || "",
    data.FastService || "",
    data.WillUseService || "",
    Array.isArray(data.DesiredClinics) ? data.DesiredClinics.join(", ") : (data.DesiredClinics || ""),
    data.DesiredClinicsOther || "",
    data.ConvenientDoctor || "",
    data.ReduceQueue || "",
    data.ConvenientTime || "",
    data.WillingToPayExtra || "",
    Array.isArray(data.PayExtraParts) ? data.PayExtraParts.join(", ") : (data.PayExtraParts || ""),
    data.PayExtraPartsOther || "",
    data.PreferredLocation || "",
    data.PreferredLocationOther || "",
    data.OPDService || "",
    data.OPDReason || "",
    data.IPDService || "",
    data.IPDReason || "",
    data.ORService || "",
    data.ORReason || "",
    data.Suggestions || ""
  ];
  
  sheet.appendRow(row);
}

function handleGetData(e) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  
  var personnelSheet = ss.getSheetByName("PersonnelResponses");
  var publicSheet = ss.getSheetByName("PublicResponses");
  
  var personnelData = getSheetRowsAsJson(personnelSheet, HEADERS_PERSONNEL);
  var publicData = getSheetRowsAsJson(publicSheet, HEADERS_PUBLIC);
  
  var response = {
    status: "success",
    personnel: personnelData,
    public: publicData
  };

  var callback = e && e.parameter ? String(e.parameter.callback || "").trim() : "";
  if (callback && /^[a-zA-Z_$][\w.$]*$/.test(callback)) {
    return ContentService.createTextOutput(callback + "(" + JSON.stringify(response) + ");")
      .setMimeType(ContentService.MimeType.JAVASCRIPT);
  }

  return ContentService.createTextOutput(JSON.stringify(response))
    .setMimeType(ContentService.MimeType.JSON);
}

function getSheetRowsAsJson(sheet, headers) {
  if (!sheet) return [];
  
  var lastRow = sheet.getLastRow();
  if (lastRow <= 1) return [];
  
  var values = sheet.getRange(2, 1, lastRow - 1, headers.length).getValues();
  var list = [];
  
  for (var i = 0; i < values.length; i++) {
    var row = values[i];
    var obj = {};
    for (var j = 0; j < headers.length; j++) {
      var val = row[j];
      if (val instanceof Date) {
        obj[headers[j]] = val.toISOString();
      } else {
        obj[headers[j]] = val;
      }
    }
    list.push(obj);
  }
  
  return list;
}
