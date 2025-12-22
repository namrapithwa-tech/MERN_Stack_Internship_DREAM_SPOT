import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../../api/axios";
import AdminLayout from "../AdminLayout";

const RoomForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [room, setRoom] = useState({
    room_number: "",
    room_category: "",
    room_rent_per_day: "",
    facilities: [],
    is_available: true,
    allocated_patient_id: null
  });

  useEffect(() => {
    if (id) {
      api.get(`/rooms/${id}`).then(res => setRoom(res.data));
    }
  }, [id]);

  const handleSubmit = async () => {
    if (id) {
      await api.put(`/rooms/${id}`, room);
    } else {
      const roomId = `R-${room.room_category}-${Date.now()}`;

      await api.post("/rooms", {
        id: roomId,
        ...room
      });
    }

    navigate("/admin/rooms");
  };

  return (
    <AdminLayout>
      <h4>{id ? "Edit Room" : "Add Room"}</h4>

      <input
        className="form-control mb-2"
        placeholder="Room Number (e.g. ICU-1)"
        value={room.room_number}
        onChange={e =>
          setRoom({ ...room, room_number: e.target.value })
        }
      />

      <select
        className="form-control mb-2"
        value={room.room_category}
        onChange={e =>
          setRoom({ ...room, room_category: e.target.value })
        }
      >
        <option value="">Select Category</option>
        <option value="GENERAL">General</option>
        <option value="ICU">ICU</option>
        <option value="SEMI_GENERAL">Semi-General</option>
        <option value="SEMI_DELUXE">Semi-Deluxe</option>
        <option value="DELUXE">Deluxe</option>
      </select>

      <input
        className="form-control mb-2"
        placeholder="Rent Per Day"
        value={room.room_rent_per_day}
        onChange={e =>
          setRoom({ ...room, room_rent_per_day: e.target.value })
        }
      />

      <input
        className="form-control mb-2"
        placeholder="Facilities (comma separated)"
        value={room.facilities.join(",")}
        onChange={e =>
          setRoom({
            ...room,
            facilities: e.target.value.split(",")
          })
        }
      />

      <button className="btn btn-success" onClick={handleSubmit}>
        Save Room
      </button>
    </AdminLayout>
  );
};

export default RoomForm;
