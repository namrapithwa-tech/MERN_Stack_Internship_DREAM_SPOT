import { useEffect, useState } from "react";
import api from "../../api/axios";

const RoomAllocationForm = ({ patient, onClose }) => {
  const [rooms, setRooms] = useState([]);
  const [category, setCategory] = useState("");
  const [roomId, setRoomId] = useState("");
  const [rent, setRent] = useState("");
  const [expectedDischarge, setExpectedDischarge] = useState("");

  useEffect(() => {
    api.get("/rooms").then(res => {
      setRooms(res.data.filter(r => r.is_available));
    });
  }, []);

  const filteredRooms = rooms.filter(r => r.room_category === category);

  const selectedRoom = filteredRooms.find(r => r.id === roomId);

  useEffect(() => {
    if (selectedRoom) {
      setRent(selectedRoom.room_rent_per_day);
    }
  }, [selectedRoom]);

  const allocateRoom = async () => {
    // Update room
    await api.patch(`/rooms/${roomId}`, {
      is_available: false,
      allocated_patient_id: patient.id
    });

    // Update patient
    await api.patch(`/patients/${patient.id}`, {
      room_number: selectedRoom.room_number
    });

    // Create admission record
    await api.post("/admissions", {
      patient_id: patient.id,
      room_id: roomId,
      admission_date: new Date().toISOString(),
      expected_discharge_date: expectedDischarge,
      status: "ADMITTED"
    });

    alert("Room allocated successfully");
    onClose();
  };

  return (
    <div className="modal show d-block" style={{ background: "#00000088" }}>
      <div className="modal-dialog">
        <div className="modal-content p-3">

          <h5>Allocate Room – {patient.full_name}</h5>

          <select
            className="form-control mb-2"
            onChange={e => setCategory(e.target.value)}
          >
            <option value="">Room Category</option>
            <option value="GENERAL">General</option>
            <option value="ICU">ICU</option>
            <option value="SEMI_GENERAL">Semi-General</option>
            <option value="SEMI_DELUXE">Semi-Deluxe</option>
            <option value="DELUXE">Deluxe</option>
          </select>

          <select
            className="form-control mb-2"
            onChange={e => setRoomId(e.target.value)}
          >
            <option value="">Room Number</option>
            {filteredRooms.map(r => (
              <option key={r.id} value={r.id}>
                {r.room_number}
              </option>
            ))}
          </select>

          <input
            className="form-control mb-2"
            value={rent}
            placeholder="Rent Per Day"
            readOnly
          />

          <input
            type="date"
            className="form-control mb-3"
            onChange={e => setExpectedDischarge(e.target.value)}
          />

          <button className="btn btn-success me-2" onClick={allocateRoom}>
            Allocate
          </button>

          <button className="btn btn-secondary" onClick={onClose}>
            Cancel
          </button>

        </div>
      </div>
    </div>
  );
};

export default RoomAllocationForm;
