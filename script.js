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
    arr.forEach(obj => Object.keys(obj).forEach(k => headers.add(k)));

    const headerRow = table.insertRow();
    headers.forEach(h => headerRow.insertCell().innerText = h);
    headerRow.insertCell().innerText = "Action";

    arr.forEach((item, rowIdx) => {
        const row = table.insertRow();

        headers.forEach(h => {
            const cell = row.insertCell();
            cell.innerText = item[h] ?? "";
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

/* ---------- EXPORT ---------- */
function exportJson() {
    const blob = new Blob([JSON.stringify(loadedJson, null, 2)], { type: "application/json" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "modified.json";
    link.click();
}

/* ---------- LOAD FILE ---------- */
document.getElementById("jsonForm").addEventListener("submit", (e) => {
    e.preventDefault();
    const file = document.getElementById("jsonFile").files[0];
    const reader = new FileReader();
    reader.onload = evt => displayJson(JSON.parse(evt.target.result));
    reader.readAsText(file);
});

document.getElementById("exportBtn").onclick = exportJson;
