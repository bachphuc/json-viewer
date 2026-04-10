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

function displayData(json) {
  console.log(json);
  renderTable('#bookings .section-left', 'bookings', json.Data.HotelBookings.Collection);
  renderTable('#bookings .section-right', 'bookings', json.Response.UpdateHotelBookings);
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

  var keys = Object.keys(data[0]);

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
    th.innerText = key.trim();
    headerTr.appendChild(th);
  });
  theader.appendChild(headerTr);

  table.appendChild(theader);

  var tbody = document.createElement('tbody');
  data.forEach((item, index) => {
    var tr = document.createElement('tr');
    keys.forEach((key, i) => {
      var td = document.createElement('td');
      td.innerText = item[key];

      tr.appendChild(td);

    });
    tbody.appendChild(tr);
  });

  table.appendChild(tbody);

  parentEle.appendChild(tableWrapper);
}