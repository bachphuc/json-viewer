/* ---------------- DISPLAY LEVEL 1 ------------------- */

function displayJson(json) {
    const output = document.getElementById("output");
    output.innerHTML = "";

    const primitiveTableData = []; // key/value list
    const complexFields = [];      // store non-primitive fields

    for (const [key, value] of Object.entries(json)) {
        if (value === null ||
            typeof value === "string" ||
            typeof value === "number" ||
            typeof value === "boolean") 
        {
            primitiveTableData.push([key, value]);
        } else {
            complexFields.push([key, value]);
        }
    }

    /* Render level-1 primitives into one table */
    if (primitiveTableData.length > 0) {
        const table = document.createElement("table");
        const header = table.insertRow();
        header.innerHTML = "<th>Field</th><th>Value</th>";

        primitiveTableData.forEach(([key, value]) => {
            const row = table.insertRow();
            row.insertCell().innerText = key;
            row.insertCell().innerText = value;
        });

        const title = document.createElement("h3");
        title.innerText = "Basic Fields";
        output.appendChild(title);
        output.appendChild(table);
    }

    /* Render complex fields */
    complexFields.forEach(([key, value]) => {
        const container = document.createElement("div");
        container.innerHTML = `<h3>${key}</h3>`;
        container.appendChild(renderValue(value)); // recursive
        output.appendChild(container);
    });
}

/* ------------ UNIVERSAL VALUE RENDERER ---------------- */

function renderValue(value) {
    if (Array.isArray(value)) {
        return renderArrayTable(value);
    } 
    else if (typeof value === "object" && value !== null) {
        return renderObjectRecursive(value);
    } 
    else {
        const div = document.createElement("div");
        div.innerText = value;
        return div;
    }
}

/* ------------ ARRAY of OBJECTS as DYNAMIC TABLE ---------- */

function renderArrayTable(arrayData) {
    const table = document.createElement("table");

    // collect all keys from all objects in array
    const allKeys = new Set();
    arrayData.forEach(item => {
        if (typeof item === "object" && item !== null) {
            Object.keys(item).forEach(k => allKeys.add(k));
        }
    });

    const headers = Array.from(allKeys);

    // array of primitives → list values only
    if (!headers.length) {
        arrayData.forEach(v => {
            const row = table.insertRow();
            row.insertCell().innerText = v;
        });
        return table;
    }

    // header row
    const headerRow = table.insertRow();
    headers.forEach(h => {
        const th = document.createElement("th");
        th.innerText = h;
        headerRow.appendChild(th);
    });

    // rows
    arrayData.forEach(item => {
        const row = table.insertRow();
        headers.forEach(h => {
            const cell = row.insertCell();
            const v = item ? item[h] : "";
            cell.appendChild(renderValue(v)); // recursive for nested data
        });
    });

    return table;
}

/* ------------------ OBJECT RECURSIVE DISPLAY ---------------- */

/* ------------------ OBJECT RECURSIVE DISPLAY (group primitive fields) ---------------- */

function renderObjectRecursive(obj) {
    const container = document.createElement("div");

    const primitiveFields = [];
    const complexFields = [];

    // split primitive vs complex values
    for (const [key, value] of Object.entries(obj)) {
        if (
            value === null ||
            typeof value === "string" ||
            typeof value === "number" ||
            typeof value === "boolean"
        ) {
            primitiveFields.push([key, value]);
        } else {
            complexFields.push([key, value]);
        }
    }

    /* --- render primitive values together as a table --- */
    if (primitiveFields.length > 0) {
        const table = document.createElement("table");
        const header = table.insertRow();
        header.innerHTML = "<th>Field</th><th>Value</th>";

        primitiveFields.forEach(([k, v]) => {
            const row = table.insertRow();
            row.insertCell().innerText = k;
            row.insertCell().innerText = v;
        });

        container.appendChild(table);
    }

    /* --- render complex values recursively below --- */
    complexFields.forEach(([key, value]) => {
        const section = document.createElement("div");
        section.innerHTML = `<h4>${key}</h4>`;
        section.appendChild(renderValue(value)); // recursion
        container.appendChild(section);
    });

    return container;
}

