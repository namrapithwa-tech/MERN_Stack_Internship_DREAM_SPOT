const entries = [];
function addEntry() {
    var f_name = document.getElementById("firstName").value;
    var l_name = document.getElementById("lastName").value;
    var email = document.getElementById("email").value;

    const entry = {
        firstName: f_name,
        lastName: l_name,
        emailAddr: email
    }

    console.log("This entry from Object :");
    console.log(entry);
    entries.push(entry);
    console.log("This entry from Array :");
    console.log(entries);
    displayEntries_In_Table();
}

function displayEntries_In_Table() {
    document.getElementById("entryTableBody").innerHTML =
        entries.map((entry, index) => `
        <tr>
            <td>${entry.firstName}</td>
            <td>${entry.lastName}</td>
            <td>${entry.emailAddr}</td>
            <td><button onclick="deleteEntry(${index})">Delete</button></td>
        </tr>
    `).join('');
}