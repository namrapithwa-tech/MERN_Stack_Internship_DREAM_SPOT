const classData = [];
function addClass() {
    var class_Name = document.getElementById("className").value;
    var class_Floor = document.getElementById("classFloor").value;
    var class_Location = document.getElementById("classLocation").value;
    var class_Capacity = document.getElementById("classCapacity").value;
    var class_Type = document.getElementById("classType").value;

    const classEntry = {
        className: class_Name,
        classFloor: class_Floor,
        classLocation: class_Location,
        classCapacity: class_Capacity,
        classType: class_Type
    }
    console.log("This class entry from Object :");
    console.log(classEntry);
    classData.push(classEntry);
    console.log("This class entry from Array :");
    console.log(classData);
    displayClasses_In_Table();
}
function displayClasses_In_Table() {
    document.getElementById("classTableBody").innerHTML =
        classData.map((classEntry, index) => `
        <tr>
            <td>${classEntry.className}</td>
            <td>${classEntry.classFloor}</td>
            <td>${classEntry.classLocation}</td>
            <td>${classEntry.classCapacity}</td>
            <td>${classEntry.classType}</td>
            <td><button onclick="deleteClass(${index})">Delete</button></td>
        </tr>
    `).join('');
}