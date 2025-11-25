const facultyData = [];

function addFaculty(){
    let facName = document.getElementById("facultyName").value;
    let facDept = document.getElementById("facultyDepartment").value;
    let facEmail = document.getElementById("facultyEmail").value;
    let facPhone = document.getElementById("facultyPhone").value;
    let facDesigntion = document.getElementById("facultyDesignation").value;

    let faculty = {
        fac_name: facName,
        fac_department: facDept,
        fac_email: facEmail,
        fac_phone: facPhone,
        fac_designation: facDesigntion
    };

    alert("Faculty Added Successfully..!!");

    console.log("Faculty Object :");
    console.log(faculty);

    facultyData.push(faculty);
    console.log("Faculty in Array :");
    console.log(facultyData);
    
    displayFaculty_In_Table();
}

function displayFaculty_In_Table(){
    document.getElementById("facultyTableBody").innerHTML =
    facultyData.map((faculty, index) => `
        <tr>
            <td>${faculty.fac_name}</td>
            <td>${faculty.fac_department}</td>
            <td>${faculty.fac_email}</td>
            <td>${faculty.fac_phone}</td>
            <td>${faculty.fac_designation}</td>
            <td><button onclick="deleteFaculty(${index})">Delete</button></td>
        </tr>
    `).join('');
}
function deleteFaculty(index){
    facultyData.splice(index, 1);
    alert("Faculty Deleted Successfully..!!");
    displayFaculty_In_Table();
}

