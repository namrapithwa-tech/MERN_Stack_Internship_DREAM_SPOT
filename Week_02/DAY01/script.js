let FacultyData = JSON.parse(localStorage.getItem("point")) || [];

function DisplayTableData(data = FacultyData) {
  document.getElementById("displayData").innerHTML = data.map(
    (faculty, index) => {
      return `<tr>
        <td>${faculty.FacultyID}</td>
        <td>${faculty.FacultyName}</td>
        <td>${faculty.FacultySubject}</td>
        <td>${faculty.FacultySalary}</td>
        <td><button class="delete-btn" onclick="DeleteFaculty(${index})">Delete</button></td>
      </tr>`;
    }
  ).join('');
}

function DeleteFaculty(index) {
  FacultyData.splice(index, 1);
  localStorage.setItem("point", JSON.stringify(FacultyData));
  DisplayTableData();
}

function SearchFaculty() {
  let searchInput = document.getElementById("searchInput").value.toLowerCase();
  let filteredData = FacultyData.filter(faculty =>
    faculty.FacultyName.toLowerCase().includes(searchInput) ||
    faculty.FacultySubject.toLowerCase().includes(searchInput)
  );
  DisplayTableData(filteredData);
}

function AddFacultyData() {
  let FID = document.getElementById("fid").value;
  let FName = document.getElementById("fname").value;
  let FSubject = document.getElementById("fsubject").value;
  let FSalary = document.getElementById("fsalary").value;

  let FacultyDetails = {
    FacultyID: FID,
    FacultyName: FName,
    FacultySubject: FSubject,
    FacultySalary: FSalary
  };

  FacultyData.push(FacultyDetails);
  alert("Faculty Data Added Successfully!");

  localStorage.setItem("point", JSON.stringify(FacultyData));
  DisplayTableData();
}



DisplayTableData();
