
var OBJECT_SCHEMAS = {
  'HotelBooking': [
    'ID',
    'Booking_Number',
    'Room_Number_Assignment',
    'Global_Arrival_Date',
    'Global_Departure_Date',
    'Arrival_Date',
    'Departure_Date',
    'Room_Confirmation_Number',
    'Active_Moving_Room_Status',
    'Sharing_Booking_ID',
  ],
  'RoomRateOrigin': [
    'ID',
    'Room_Type_Code',
    'From_Date',
    'To_Date',
    'Rate_Plan_Name',
    'Rate_Amount',
    'Hotel_Booking_ID',
  ],
  'RoomRate': [
    'ID',
    'From_Date',
    'To_Date',
    'Rate_Plan_Code',
    'Room_Type_Code',
    'Rate_Plan_Name',
    'Rate_Amount',
    'Rate_For_Period',
    'Is_Supplementary',
    'Is_Cancelled',
    'Post_DateTime',
    'Cancel_DateTime',
    'Group_ID',
    'Parent_Group_ID',
    'Hotel_Booking_ID',
  ],

  'ExtraRateOrigin': [
    'ID',
    'From_Date',
    'To_Date',
    'Room_Type_Code',
    'Rate_Plan_Code',
    'Extra_Code',
    'Extra_Name',
    'Unit_Price',
    'Quantity',
    'Hotel_Booking_ID',
  ],
  'ExtraRate': [
    'ID',
    'From_Date',
    'To_Date',
    'Room_Type_Code',
    'Rate_Plan_Code',
    'Extra_Code',
    'Extra_Name',
    'Unit_Price',
    'Rate_For_Period',
    'Quantity',
    'Is_Supplementary',
    'Is_Cancelled',
    'Post_DateTime',
    'Cancel_DateTime',
    'Group_ID',
    'Parent_Group_ID',
    'Hotel_Booking_ID',
  ]

};

document.getElementById("jsonForm").addEventListener("submit", (e) => {
  e.preventDefault();
  const file = document.getElementById("jsonFile").files[0];
  const reader = new FileReader();
  reader.onload = evt => {
    var obj = JSON.parse(evt.target.result);
    window.jsonData = obj;
    displayData(obj);
  };
  reader.readAsText(file);
});

function shortDate(str){
  if(!str){
    return '';
  }

  return str.replace(/T?00:00:00/, '');
}

function displayData(json) {
  console.log(json);

  // Render Request
  var testCaseDesc = `Room Move: ${shortDate(json.Request.MoveFromDate)} - ${shortDate(json.Request.MoveToDate)}`;
  document.getElementById('requestDesc').innerText = testCaseDesc;

  // Bookings
  renderTable('#bookings .section-left', 'HotelBooking', json.Data.HotelBookings.Collection || json.Data.HotelBookings);
  renderTable('#bookings .section-right', 'HotelBooking', json.Response.UpdateHotelBookings);

  // Room Rate Origin
  renderTable('#roomRateOrigins .section-left', 'RoomRateOrigin', json.Data.RoomRateOrigins);
  renderTable('#roomRateOrigins .section-right', 'RoomRateOrigin', json.Response.RoomRateOrigins);

  // Room Rate
  renderTable('#roomRates .section-left', 'RoomRate', json.Data.HotelBookingRoomRates);
  renderTable('#roomRates .section-right', 'RoomRate', json.Response.RoomRates);


  // Room Extra Origin
  renderTable('#extraRateOrigins .section-left', 'ExtraRateOrigin', json.Data.ExtraRateOrigins);
  renderTable('#extraRateOrigins .section-right', 'ExtraRateOrigin', json.Response.ExtraRateOrigins);

  // Room Extra
  renderTable('#extraRates .section-left', 'ExtraRate', json.Data.HotelBookingExtraRates);
  renderTable('#extraRates .section-right', 'ExtraRate', json.Response.ExtraRates);
}

function renderTable(appendToSelector, key, data) {
  if (!data || !data.length) {
    return;
  }

  var parentEle = document.querySelector(appendToSelector);
  if (parentEle == null) {
    console.log(`Parent ${appendToSelector} is null`);
    return;
  }

  var keys = OBJECT_SCHEMAS[key] ? OBJECT_SCHEMAS[key] : Object.keys(data[0]);

  // Build table
  var tableWrapper = document.createElement('div');
  tableWrapper.classList.add('table-wrapper');
  var table = document.createElement('table');
  tableWrapper.appendChild(table);

  // Build header
  var theader = document.createElement('thead');
  var headerTr = document.createElement('tr');
  keys.forEach((key, index) => {
    var th = document.createElement('th');

    if(key == keys[0]){
      th.innerText = `${key.trim()} (${data.length})`;
    }
    else{
      th.innerText = key.trim();
    }
    headerTr.appendChild(th);
  });
  theader.appendChild(headerTr);

  table.appendChild(theader);

  var tbody = document.createElement('tbody');
  data.forEach((item, index) => {
    var tr = document.createElement('tr');
    keys.forEach((key, i) => {
      var td = document.createElement('td');
      var value = item[key];
      if(typeof value === 'string'){
        value = value.replace('00:00:00', '');
      }
      td.innerText = value;

      tr.appendChild(td);

    });
    tbody.appendChild(tr);
  });

  table.appendChild(tbody);

  parentEle.appendChild(tableWrapper);
}