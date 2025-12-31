document.getElementById("jsonForm").addEventListener("submit", function(e) {
    e.preventDefault();
    const fileInput = document.getElementById("jsonFile");
    if (!fileInput.files.length) return alert("Please select a JSON file!");

    const reader = new FileReader();
    reader.onload = function(e) {
        const jsonData = JSON.parse(e.target.result);
        displayJson(jsonData);
    };
    reader.readAsText(fileInput.files[0]);
});