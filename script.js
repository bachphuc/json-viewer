let loadedJson = null;

/* ---------- CELL EDITING ---------- */
function makeCellEditable(td, dataPath) {
  const oldValue = td.innerText;
  td.innerHTML = "";
  const input = document.createElement("input");
  input.type = "text";
  input.value = oldValue;
  input.style.width = "100%";

  td.appendChild(input);
  input.focus();

  const save = () => {
    td.innerHTML = input.value;
    updateJsonValue(dataPath, input.value);
    attachCellEditHandler(td, dataPath);
  };

  input.addEventListener("blur", save);
  input.addEventListener("keydown", e => {
    if (e.key === "Enter") save();
    if (e.key === "Escape") { td.innerHTML = oldValue; attachCellEditHandler(td, dataPath); }
  });
}

function attachCellEditHandler(td, dataPath) {
  if (!dataPath) return;
  td.style.cursor = "pointer";
  td.onclick = () => makeCellEditable(td, dataPath);
}

/* ---------- UPDATE JSON ---------- */
function updateJsonValue(path, newValue) {
  const parts = path.split(".");
  let obj = loadedJson;
  for (let i = 0; i < parts.length - 1; i++)
    obj = obj[parts[i]];

  let raw = newValue;
  if (!isNaN(raw) && raw.trim() !== "") raw = Number(raw);
  else if (raw === "true") raw = true;
  else if (raw === "false") raw = false;

  obj[parts.at(-1)] = raw;
}

/* ---------- ADD & DELETE ROW ---------- */
function deleteRowFromArray(arrayPath, index) {
  const parts = arrayPath.split(".");
  let arr = loadedJson;
  for (let i = 0; i < parts.length; i++)
    arr = arr[parts[i]];

  arr.splice(index, 1);
  displayJson(loadedJson);
}

function addRowToArray(arrayPath) {
  const parts = arrayPath.split(".");
  let arr = loadedJson;
  for (let i = 0; i < parts.length; i++)
    arr = arr[parts[i]];

  arr.push({});
  displayJson(loadedJson);
}

/* ---------- RENDER JSON ---------- */
function displayJson(json) {
  loadedJson = json;
  const output = document.getElementById("output");
  output.innerHTML = "";
  renderObjectRecursive(json, output, "");
}

function renderObjectRecursive(obj, container, path) {
  const primitives = [];
  const objects = [];
  const arrays = [];

  for (const key in obj) {
    const value = obj[key];
    const newPath = path ? `${path}.${key}` : key;

    if (Array.isArray(value)) arrays.push({ key, value, newPath });
    else if (typeof value === "object" && value !== null) objects.push({ key, value, newPath });
    else primitives.push({ key, value, newPath });
  }

  /* ---- primitives ---- */
  if (primitives.length > 0) {
    const table = document.createElement("table");
    table.insertRow().innerHTML = "<th>Field</th><th>Value</th>";

    primitives.forEach(p => {
      const row = table.insertRow();
      row.insertCell().innerText = p.key;
      const valCell = row.insertCell();
      valCell.innerText = p.value;
      attachCellEditHandler(valCell, p.newPath);
    });

    container.appendChild(table);
  }

  /* ---- objects ---- */
  objects.forEach(o => {
    const title = document.createElement("h3");
    title.innerText = o.key;
    container.appendChild(title);
    renderObjectRecursive(o.value, container, o.newPath);
  });

  /* ---- arrays ---- */
  arrays.forEach(a => {
    const title = document.createElement("h3");
    title.innerText = a.key;
    container.appendChild(title);

    const table = renderArrayTable(a.value, a.newPath);
    container.appendChild(table);

    const btn = document.createElement("div");
    btn.className = "add-row-btn";
    btn.innerText = "Add Row";
    btn.onclick = () => addRowToArray(a.newPath);
    container.appendChild(btn);
  });
}

/* ---- ARRAY TABLE ---- */
function renderArrayTable(arr, arrayPath) {
  const table = document.createElement("table");

  const headers = new Set();
  arr.forEach(obj => {
    if (typeof (obj) === 'string' || typeof (obj) === 'boolean' || typeof (obj) === 'number') {
      headers.add('Values');
    }
    else {
      Object.keys(obj).forEach(k => headers.add(k));
    }
  });

  const headerRow = table.insertRow();
  headers.forEach(h => headerRow.insertCell().innerText = h);
  headerRow.insertCell().innerText = "Action";

  arr.forEach((item, rowIdx) => {
    const row = table.insertRow();

    headers.forEach(h => {
      const cell = row.insertCell();
      cell.innerText = isBasicType(item) ? item : (item[h] ?? "");
      attachCellEditHandler(cell, `${arrayPath}.${rowIdx}.${h}`);
    });

    const delCell = row.insertCell();
    const del = document.createElement("span");
    del.className = "delete-btn";
    del.innerText = "x";
    del.onclick = () => deleteRowFromArray(arrayPath, rowIdx);
    delCell.appendChild(del);
  });

  return table;
}

function isBasicType(obj) {
  var t = typeof obj;
  return t === 'boolean' || t === 'number' || t === 'string';
}

/* ---------- EXPORT ---------- */
function exportJson() {
  const blob = new Blob([JSON.stringify(loadedJson, null, 2)], { type: "application/json" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "modified.json";
  link.click();
}

var EXCLUDE_KEYS = [
  'Network_Connection_ID',
  'Create_User_Account_ID',
  'Update_User_Account_ID',
  'CreatedByUser',
  'UpdatedByUser',
  'RPM_Posting_Account_ID_DR',
  'RPM_Posting_Account_ID_CR',
  'RPM_Statistic_Group_ID',
  'Is_Early_Checkin',
  'Is_Late_Checkout',
  'Activity_Duration_Minutes',
  'Sub_Service_Type',
  'Deposit_Percent',
  'Min_LOS_Days',
  'Max_LOS_Days',
  'Sell_Modify_Only',
  'Sell_Child_Only',
  'RPM_Platform_IDs',
  'Stay_Date',
  'Sales_Type_RefID',
  'Is_Early_Check_In',
  'Is_Late_Check_Out',
  'Online_Activity_Booking_Type',
  'Activity_Start_Time',
  'Activity_Duration_Minutes',
  'Activity_Number_Persons',
  'Activity_Persons_Object',
  'Activity_Segment_Type',
  'Activity_Departure_Location',
  'Activity_Arrival_Location',
  'Activity_Pricing_Class',
  'Activity_Booking_Confirmation_Number',
  'Activity_Future_Book_Date',
  'Number_Nights_Included_In_Rate',
  'Rate_Modifier_Code',
  'Rate_Modifier_Is_Discount',
  'Rate_Modifier_Amount',
  'RPM_Lease_Billing_Period_ID',
  'Hotel_Guarantee_Policy_ID',
  'Hotel_Cancel_Policy_ID',
  'Adjust_User_Account_ID',
  'Source_Code_RefID',
  'Secondary_Source_Identifier',
  'Activity_Booking_Code',
  'Activity_Notification_Email_Sent',
  'Activity_Notification_Email_Sent_DateTime',
  'Guest_Reference_Number',
  'Guest_Special_Instructions',
  'RPM_Posting_Account_Entry_ID',
  'Create_DateTime',
  'Update_DateTime',
  'Is_Refundable',
  'Extra_Access_Code',
  'Default_Purchase_Quantity',
  'Max_Booking_Quantity_Per_Stay',
  'Max_Booking_Quantity_Per_Day',
  'Domain_Rate_Plan_Extra_ID',
  'Domain_Rate_Plan_Extra_Start_Date',
  'Domain_Rate_Plan_Extra_End_Date',
  'Domain_Rate_Plan_Extra_Booking_Start_Date',
  'Domain_Rate_Plan_Extra_Booking_End_Date',
  'Booking_DateTime',
  'Parent_Group_ID',
  'Parent_Room_Type_ID',
  'Expected_Guest_Arrival_Date',
  'Complete_Booking_DateTime',
  'Conf_No',
  'Manually_Follow_Up',
  'List_Transaction_Code_1',
  'List_Transaction_Code_2',
  'List_Transaction_Code_3',
  'List_Transaction_Code_4',
  'List_Transaction_Code_5',
  'List_Transaction_Code_6',
  'Termination_Request_Date',
  'Hotel_Booking_ID_1',
  'Hotel_Booking_ID_2',
  'Hotel_Booking_ID_3',
  'Hotel_Booking_ID_4',
  'Hotel_Booking_ID_5',
  'Hotel_Booking_ID_6',
  'Res_Status_ID',
  'Is_Room_Type_Upgrade',
  'Room_Type_Upgrade_Amount',
  'Payment_Balance_Timing',
  'Per_Stay_Booking_Limit',
  'Per_Day_Booking_Limit',
  'Min_Adv_Book_Days',
  'Max_Adv_Book_Days',
  'Send_Alert_Email',
  'OccupancyRoomStatus',
  'SourceCode',
  'Hotel_Brand_Type_ID',
  'Hotel_Location_Type_ID',
  'Is_Wide_Currency',
  'Inspection_Max_Photo_Upload_For_Staff',
  'Inspection_Max_Photo_Upload_For_Renter',
  'Number_Children_1',
  'Number_Children_Age_RefID_1',
  'Number_Children_2',
  'Number_Children_3',
  'Number_Children_4',
  'Number_Children_Age_RefID_2',
  'Number_Children_Age_RefID_3',
  'Number_Children_Age_RefID_4',
  'Room_Type_Access_Code',
  'Number_Cribs',
  'Number_Rollaways',
  'Room_Cancellation_Number',
  'Booking_GUID_Number',
  'Source_Booking_Reference_Number',
  'Source_Room_Reference_Number',
  'Source_Room_Cancellation_Number',
  'Property_Booking_Reference_Number',
  'Property_Room_Reference_Number',
  'Property_Room_Cancellation_Number',
  'GDS_Record_Locator',
  'Transport_Pickup_Time',
  'Arrival_Flight_Number',
  'Booker_Special_Instructions',
  'Scheduled_Arrival_Information',
  'Reservation_Reason_Refid',
  'Discount_Reason_Refid',
  'Cancel_Reason_Refid',
  'Purchase_Order_Number',
  'External_Reference_Number',
  'Travel_Type',
  'Is_Reduced_Stay',
  'Is_Extended_Stay',
  'Last_Booking_Mode',
  'Last_Booking_Action',
  'Last_Booking_Type',
  'Last_Booking_DateTime',
  'Guarantee_Deposit_Timing',
  'Guarantee_Deposit_Days',
  'Is_Access_Room_Request',
  'Is_Connecting_Room_Request',
  'Group_Profile_ID',
  'Travel_Profile_ID',
  'Profile_ID_Folio_1',
  'Profile_ID_Folio_2',
  'Profile_ID_Folio_3',
  'Profile_ID_Folio_4',
  'Profile_ID_Folio_5',
  'Profile_ID_Folio_6',
  'Invoice_No_1',
  'Invoice_No_2',
  'Invoice_No_3',
  'Invoice_No_4',
  'Invoice_No_5',
  'Invoice_No_6',
  'Hear',
  'Come',
  'Lease_Term',
  'Termintation_Notice',
  'Termination_Approve_Date',
  'Dynamic_Booking_Type',
  'Parent_Room_Type_Code',
  'AvailableRooms',
  'Location_Longitude',
  'Location_Latitude',
  'Res_Delivery_System_Type',
  'Spa_Booking_System_Type',
  'Golf_Booking_System_Type',
  'Train_Booking_System_Type',
  'Tokenization_System_Type',
  'Tokenization_Merchant_ID',
  'Privacy_Profile_Retention_Default',
  'Market_Code_RefID',
  'Booking_Platform_Type',
  'Rate_Plan_Access_Code',
  'Cancel_DateTime',
  'Itinerary_Number',
  'Room_Type_Code_Assignment',
  'Scheduled_Arrival_Time',
  'Landlord_Signing_Mode',
  'Operation_Access_Right',
  'Configuration_Access_Right',
  'Reservation_Room_Closed_On_BE_Channel',
  'Number_Rooms',
  'RoomTypeAccessCode',
  'RatePlanAccessCode',
  'Prior_To_Release_Back_Date_Maintenance_Days_Type',
  'Prior_To_Release_Back_Date_Maintenance_Days_No',
  'Booking_Information_Collection',
  'Permission_Group_Number',
  'DOW_Active_Mask',
  'Stay_Application_Type',
  'Permit_Additional_Purchase',
  'Booking_Start_Date',
  'Booking_End_Date',
  'Rental_Payment_Location',
  'Rental_Payment_Instructions',
  'Break_Lease_Fee_Amount',
  'Max_Live_In_Occupants',
  'Priority_Rank_Number',
  'Priority_Rank_Remarks',
  'Priority_Rank_Reserved',
  'Priority_Rank_Application_Date',
  'Lease_Status_Update_DateTime',
  'Has_No_Extra',
  'Bond_Receipt_Number',
  'Rental_Requirement_Type_Code',
  'Rental_Requirement_Source_Code',
  'Extra_Rate_Exclusive_To_Rent',
  'Adjust_DateTime',
  'Holding_Fee_Period_Weeks',
  'Room_Lease_End_Date',
  'Available_Lease_Start_Date_Before_Release_Back_Date_From_Type',
  'Available_Lease_Start_Date_Before_Release_Back_Date_From_No',
  'Available_Lease_Start_Date_Before_Release_Back_Date_To_Type',
  'Available_Lease_Start_Date_Before_Release_Back_Date_To_No',
  'Available_Booking_Date_After_Release_Back_Date_To_Type',
  'Available_Booking_Date_After_Release_Back_Date_To_No',
  'Available_Lease_Start_Date_After_Release_Back_Date_From_Type',
  'Available_Lease_Start_Date_After_Release_Back_Date_From_No',
  'Available_Lease_Start_Date_After_Release_Back_Date_To_Type',
  'Available_Lease_Start_Date_After_Release_Back_Date_To_No',
];

var SORT_FIELDS = [
  'ID',
  'Booking_Number',
  'Room_Type_Code',
  'Rate_Plan_Code',
  'Extra_Code',
  'Global_Arrival_Date',
  'Global_Departure_Date',
  'Arrival_Date',
  'Departure_Date',
  'From_Date',
  'To_Date',
  'Recurrence_Pattern',
  'Unit_Price',
  'Price',
  'Rate_Amount',
  'Rate_For_Period',
  'Quantity',
  'Post_DateTime'
];

function sortKeys(keys) {
  var validKeys = keys.filter(k => EXCLUDE_KEYS.indexOf(k) === -1);
  var results = [];
  SORT_FIELDS.forEach(s => {
    if (validKeys.indexOf(s) !== -1) {
      results.push(s);
    }
  });

  validKeys.forEach(k => {
    if (results.indexOf(k) === -1) {
      results.push(k);
    }
  });
  return results;
}

function cleanUpObject(obj) {
  if (!obj || typeof obj === 'boolean' || typeof obj === 'string' || typeof obj === 'number') {
    return obj;
  }

  var result = {};
  var keys = sortKeys(Object.keys(obj));

  keys.forEach(key => {
    var v = obj[key];
    if (!v) {
      result[key] = v;
    }
    else if (typeof v === 'string') {
      result[key] = v.replace('T00:00:00', '');
    }
    else if (typeof v === 'boolean' || typeof v === 'number') {
      result[key] = v;
    }
    else if (Array.isArray(v)) {
      result[key] = v.map(e => cleanUpObject(e));
    }
    else if (typeof v === 'object') {
      result[key] = cleanUpObject(v);
    }
  });

  return result;
}

/* ---------- LOAD FILE ---------- */
document.getElementById("jsonForm").addEventListener("submit", (e) => {
  e.preventDefault();
  const file = document.getElementById("jsonFile").files[0];
  const reader = new FileReader();
  reader.onload = evt => {
    var obj = JSON.parse(evt.target.result);
    displayJson(cleanUpObject(obj))
  };
  reader.readAsText(file);
});

document.getElementById("exportBtn").onclick = exportJson;
