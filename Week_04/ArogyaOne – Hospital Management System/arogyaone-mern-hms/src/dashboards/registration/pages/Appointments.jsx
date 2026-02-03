import api from "../../../api/axios";
import { useEffect, useState } from "react";
import AppointmentStats from "../components/AppointmentStats";
import AppointmentTable from "../components/AppointmentTable";
import AppointmentConfirmModal from "../components/AppointmentConfirmModal";

const Appointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    api.get("/appointments").then(res => setAppointments(res.data));
  }, []);

  return (
    <>
      <AppointmentStats
        today={appointments.length}
        pending={appointments.filter(a => a.status === "PENDING").length}
        completed={appointments.filter(a => a.status === "CONFIRMED").length}
      />

      <AppointmentTable
        appointments={appointments}
        onConfirm={setSelected}
      />

      {selected && (
        <AppointmentConfirmModal
          appointment={selected}
          onClose={() => setSelected(null)}
        />
      )}
    </>
  );
};

export default Appointments;
