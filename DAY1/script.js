const dataArray = [];
function addData() {
    var name = document.getElementById("name").value;
    var age = document.getElementById("age").value;
    const data = {
        nameObj: name,
        ageobj: age
    }
    console.log(data);

    dataArray.push(data);
    console.log(dataArray);
    rendertable();
}

function rendertable() {
    document.getElementById("dataTableId").innerHTML = 
    dataArray.map((data) => {
        return `<tr>
            <td>${data.nameObj}</td>
            <td>${data.ageobj}</td>
        </tr>`;
    }).join("");
}
