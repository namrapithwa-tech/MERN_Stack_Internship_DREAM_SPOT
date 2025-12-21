import { Link } from "react-router-dom";

const RoomViewModal = ({ room, onClose }) => {
  return (
    <div
      className="modal show d-block"
      style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
    >
      <div className="modal-dialog">
        <div className="modal-content">

          <div className="modal-header">
            <h5 className="modal-title">{room.room_number}</h5>
            <button className="btn-close" onClick={onClose}></button>
          </div>

          <div className="modal-body">
            <p><b>Category:</b> {room.room_category}</p>
            <p><b>Rent:</b> ₹{room.room_rent_per_day} / day</p>
            <p><b>Facilities:</b> {room.facilities?.join(", ")}</p>
            <p>
              <b>Status:</b>{" "}
              {room.is_available ? "Available" : "Occupied"}
            </p>

            {!room.is_available && (
              <p>
                <b>Patient ID:</b> {room.allocated_patient_id}
              </p>
            )}
          </div>

          <div className="modal-footer">
            <Link
              to={`/admin/rooms/edit/${room.id}`}
              className="btn btn-warning"
            >
              Edit
            </Link>
            <button className="btn btn-secondary" onClick={onClose}>
              Close
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default RoomViewModal;
