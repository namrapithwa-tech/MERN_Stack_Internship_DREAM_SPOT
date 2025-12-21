import { useEffect, useState } from "react";
import api from "../../../api/axios";
import AdminLayout from "../AdminLayout";
import RoomViewModal from "./RoomViewModal";
import { Link } from "react-router-dom";

const RoomCards = () => {
  const [rooms, setRooms] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState(null);

  useEffect(() => {
    api.get("/rooms").then(res => setRooms(res.data));
  }, []);

  return (
    <AdminLayout>
      <div className="d-flex justify-content-between mb-3">
        <h4>Rooms</h4>
        <Link to="/admin/rooms/add" className="btn btn-primary">
          Add Room
        </Link>
      </div>

      <div className="row">
        {rooms.map(room => (
          <div className="col-md-3 mb-3" key={room.id}>
            <div
              className={`card p-3 ${
                room.is_available ? "border-success" : "border-danger"
              }`}
              style={{ cursor: "pointer" }}
              onClick={() => setSelectedRoom(room)}
            >
              <h6>{room.room_number}</h6>
              <p className="mb-1">{room.room_category}</p>
              <p className="mb-1">
                Rent: ₹{room.room_rent_per_day}/day
              </p>

              {room.is_available ? (
                <span className="badge bg-success">Available</span>
              ) : (
                <span className="badge bg-danger">
                  Occupied
                </span>
              )}

              {!room.is_available && (
                <small className="d-block mt-2">
                  Patient ID: {room.allocated_patient_id}
                </small>
              )}
            </div>
          </div>
        ))}
      </div>

      {selectedRoom && (
        <RoomViewModal
          room={selectedRoom}
          onClose={() => setSelectedRoom(null)}
        />
      )}
    </AdminLayout>
  );
};

export default RoomCards;
