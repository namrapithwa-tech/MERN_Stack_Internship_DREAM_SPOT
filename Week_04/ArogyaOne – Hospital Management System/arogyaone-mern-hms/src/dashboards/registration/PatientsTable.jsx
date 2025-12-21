import { useEffect, useState } from "react";
import api from "../../api/axios";
import RoomAllocationForm from "./RoomAllocationForm";
import generateStickerPDF from "./StickerPDF";

const PatientsTable = () => {
  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);

  useEffect(() => {
    api.get("/patients").then(res => setPatients(res.data));
  }, []);

  return (
    <>
      <h5>Patients</h5>

      <table className="table table-bordered">
        <thead>
          <tr>
            <th>Patient ID</th>
            <th>Name</th>
            <th>Doctor</th>
            <th>Room</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          {patients.map(p => (
            <tr key={p.id}>
              <td>{p.id}</td>
              <td>{p.full_name}</td>
              <td>{p.consultant_doctor_id}</td>
              <td>{p.room_number || "-"}</td>
              <td>{p.room_number ? "IPD" : "OPD"}</td>
              <td>
                <button
                  className="btn btn-sm btn-primary me-1"
                  onClick={() => setSelectedPatient(p)}
                >
                  Allocate Room
                </button>

                {p.room_number && (
                  <button
                    className="btn btn-sm btn-secondary"
                    onClick={() => generateStickerPDF(p)}
                  >
                    Print Stickers
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {selectedPatient && (
        <RoomAllocationForm
          patient={selectedPatient}
          onClose={() => setSelectedPatient(null)}
        />
      )}
    </>
  );
};

export default PatientsTable;
