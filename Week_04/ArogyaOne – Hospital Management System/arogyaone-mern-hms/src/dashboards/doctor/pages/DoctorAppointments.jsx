import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../../api/axios';
import { AuthContext } from '../../../context/AuthContext';
import '../../../assets/css/doctor.css';

const DoctorAppointments = () => {
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();
    
    // Data States
    const [appointments, setAppointments] = useState([]);
    const [notes, setNotes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({ today: 0, thisWeek: 0, pending: 0 });

    // Calendar & Selection State
    const today = new Date();
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    
    const [currentMonthDate, setCurrentMonthDate] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
    const [selectedDate, setSelectedDate] = useState(todayStr);

    // Note Modal State
    const [showNoteModal, setShowNoteModal] = useState(false);
    const [noteText, setNoteText] = useState('');
    const [isSavingNote, setIsSavingNote] = useState(false);

    // --- BULLETPROOF DATE NORMALIZER ---
    const normalizeDate = (dateString) => {
        if (!dateString) return "";
        try {
            if (dateString.includes('T')) return dateString.split('T')[0];
            const d = new Date(dateString);
            if (isNaN(d.getTime())) return dateString;
            return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
        } catch (e) {
            return dateString;
        }
    };

    useEffect(() => {
        if (user) {
            fetchData();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user]);

    // --- PARALLEL DATA FETCHING ---
    const fetchData = async () => {
        try {
            // Fetch both appointments and notes concurrently
            const [apptsRes, notesRes] = await Promise.all([
                api.get('/appointments'),
                api.get('/doctor_notes')
            ]);
            
            // Filter appointments
            const myAppointments = apptsRes.data.filter(appt => 
                appt.doctor_id === user?.linked_id || 
                appt.doctor_name === user?.name ||
                appt.consultant_doctor_name === user?.name ||
                appt.doctorName === user?.name
            );

            // Filter notes
            const myNotes = notesRes.data.filter(note => 
                note.doctor_id === user?.linked_id || 
                note.doctor_name === user?.name
            );

            setAppointments(myAppointments);
            setNotes(myNotes);
            calculateStats(myAppointments);
            setLoading(false);
        } catch (error) {
            console.error("Error fetching data:", error);
            setLoading(false);
        }
    };

    const calculateStats = (data) => {
        let todayCount = 0;
        let pendingCount = 0;
        let weekCount = 0;

        const currDate = new Date();
        const startOfWeek = new Date(currDate);
        startOfWeek.setDate(currDate.getDate() - currDate.getDay()); 
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6); 

        data.forEach(appt => {
            const cleanDate = normalizeDate(appt.appointment_date || appt.date);
            const stat = appt.status?.toUpperCase() || 'PENDING';
            
            if (stat === 'SCHEDULED' || stat === 'PENDING' || stat === 'CONFIRMED') {
                pendingCount++;
            }
            if (cleanDate === todayStr) {
                todayCount++;
            }
            const apptDateObj = new Date(cleanDate);
            if (apptDateObj >= startOfWeek && apptDateObj <= endOfWeek) {
                weekCount++;
            }
        });

        setStats({ today: todayCount, thisWeek: weekCount, pending: pendingCount });
    };

    // --- NOTE SAVING LOGIC ---
    const handleSaveNote = async (e) => {
        e.preventDefault();
        if (!noteText.trim()) return;
        
        setIsSavingNote(true);
        try {
            const payload = {
                id: `NOTE-${Date.now()}`,
                doctor_id: user.linked_id,
                doctor_name: user.name,
                date: selectedDate,
                note_text: noteText
            };

            await api.post('/doctor_notes', payload);
            
            setNoteText('');
            setShowNoteModal(false);
            await fetchData(); // Refresh data to instantly show the new note
        } catch (error) {
            console.error("Error saving note:", error);
            alert("Failed to save note.");
        } finally {
            setIsSavingNote(false);
        }
    };

    // --- CALENDAR LOGIC ---
    const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
    const getFirstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();

    const changeMonth = (offset) => {
        setCurrentMonthDate(prev => new Date(prev.getFullYear(), prev.getMonth() + offset, 1));
    };

    const year = currentMonthDate.getFullYear();
    const month = currentMonthDate.getMonth();
    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month);

    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

    const calendarDays = [];
    for (let i = 0; i < firstDay; i++) calendarDays.push(null);
    for (let i = 1; i <= daysInMonth; i++) {
        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
        calendarDays.push({ day: i, dateStr });
    }

    // --- AGENDA LOGIC ---
    const agendaAppointments = appointments
        .filter(appt => normalizeDate(appt.appointment_date || appt.date) === selectedDate)
        .sort((a, b) => {
            const timeA = new Date(`1970/01/01 ${a.appointment_time || '00:00'}`);
            const timeB = new Date(`1970/01/01 ${b.appointment_time || '00:00'}`);
            return timeA - timeB;
        });

    const agendaNotes = notes.filter(note => normalizeDate(note.date) === selectedDate);

    const getStatusColor = (status) => {
        const s = status?.toUpperCase() || '';
        if (s === 'COMPLETED' || s === 'CLOSED' || s === 'ATTENDED') return 'success';
        if (s === 'CANCELLED') return 'danger';
        return 'warning'; 
    };

    if (loading) return <div className="text-center p-5"><div className="spinner-border text-success"></div></div>;

    return (
        <div className="container-fluid py-3 h-100 position-relative">
            {/* HEADER */}
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h4 className="fw-bold m-0 text-dark"><i className="fa-regular fa-calendar-check me-2 text-info"></i> My Appointments</h4>
                <div className="badge bg-light text-dark border p-2">
                    <i className="fa-solid fa-user-doctor text-success me-2"></i>{user?.name}
                </div>
            </div>

            {/* STATS BANNER */}
            <div className="row g-3 mb-4">
                <div className="col-md-4">
                    <div className="card-common d-flex align-items-center bg-white p-3 border-start border-info border-4 shadow-sm">
                        <div className="bg-info bg-opacity-10 p-3 rounded-circle me-3"><i className="fa-solid fa-calendar-day text-info fs-4"></i></div>
                        <div><h6 className="text-muted mb-0">Appointments Today</h6><h3 className="fw-bold mb-0">{stats.today}</h3></div>
                    </div>
                </div>
                <div className="col-md-4">
                    <div className="card-common d-flex align-items-center bg-white p-3 border-start border-primary border-4 shadow-sm">
                        <div className="bg-primary bg-opacity-10 p-3 rounded-circle me-3"><i className="fa-solid fa-calendar-week text-primary fs-4"></i></div>
                        <div><h6 className="text-muted mb-0">This Week</h6><h3 className="fw-bold mb-0">{stats.thisWeek}</h3></div>
                    </div>
                </div>
                <div className="col-md-4">
                    <div className="card-common d-flex align-items-center bg-white p-3 border-start border-warning border-4 shadow-sm">
                        <div className="bg-warning bg-opacity-10 p-3 rounded-circle me-3"><i className="fa-solid fa-hourglass-half text-warning fs-4"></i></div>
                        <div><h6 className="text-muted mb-0">Total Pending</h6><h3 className="fw-bold mb-0">{stats.pending}</h3></div>
                    </div>
                </div>
            </div>

            {/* TWO-COLUMN CALENDAR & AGENDA */}
            <div className="row g-4">
                {/* LEFT PANE: CALENDAR (60%) */}
                <div className="col-lg-7">
                    <div className="card-common bg-white p-4 shadow-sm border border-light h-100 rounded-4">
                        <div className="d-flex justify-content-between align-items-center mb-4">
                            <h4 className="fw-bold text-dark m-0">{monthNames[month]} {year}</h4>
                            <div className="btn-group shadow-sm">
                                <button className="btn btn-outline-secondary" onClick={() => changeMonth(-1)}><i className="fa-solid fa-chevron-left"></i></button>
                                <button className="btn btn-outline-secondary" onClick={() => setCurrentMonthDate(new Date(today.getFullYear(), today.getMonth(), 1))}>Today</button>
                                <button className="btn btn-outline-secondary" onClick={() => changeMonth(1)}><i className="fa-solid fa-chevron-right"></i></button>
                            </div>
                        </div>

                        <div>
                            {/* Day Names */}
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '10px', marginBottom: '10px' }}>
                                {dayNames.map(day => (
                                    <div key={day} className="text-center fw-bold text-muted small text-uppercase pb-2 border-bottom">{day}</div>
                                ))}
                            </div>
                            
                            {/* Dates */}
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '10px' }}>
                                {calendarDays.map((cell, index) => {
                                    if (!cell) return <div key={`empty-${index}`} className="p-2"></div>;

                                    const isSelected = cell.dateStr === selectedDate;
                                    const isToday = cell.dateStr === todayStr;
                                    
                                    const dayAppointments = appointments.filter(a => normalizeDate(a.appointment_date || a.date) === cell.dateStr).length;
                                    const dayNotes = notes.filter(n => normalizeDate(n.date) === cell.dateStr).length;

                                    return (
                                        <div 
                                            key={cell.dateStr} 
                                            onClick={() => setSelectedDate(cell.dateStr)}
                                            className={`rounded-3 p-2 text-center cursor-pointer transition-all border d-flex flex-column align-items-center
                                                ${isSelected ? 'border-primary bg-primary text-white shadow' : 'border-light bg-light text-dark action-card-hover'}
                                            `}
                                            style={{ minHeight: '95px', cursor: 'pointer' }}
                                        >
                                            <span className={`fw-bold fs-5 ${isToday && !isSelected ? 'text-primary' : ''}`}>
                                                {cell.day}
                                            </span>
                                            
                                            {/* Appointment Badge */}
                                            {dayAppointments > 0 && (
                                                <div className="mt-1 w-100">
                                                    <span className={`badge rounded-pill w-100 ${isSelected ? 'bg-white text-primary' : 'bg-info text-white'}`}>
                                                        {dayAppointments} Appt{dayAppointments > 1 ? 's' : ''}
                                                    </span>
                                                </div>
                                            )}

                                            {/* Notes Badge */}
                                            {dayNotes > 0 && (
                                                <div className="mt-1 w-100">
                                                    <span className={`badge rounded-pill w-100 ${isSelected ? 'bg-light text-secondary' : 'text-white'}`} style={!isSelected ? { backgroundColor: '#8a2be2' } : {}}>
                                                        {dayNotes} Note{dayNotes > 1 ? 's' : ''}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>

                {/* RIGHT PANE: DAILY AGENDA (40%) */}
                <div className="col-lg-5">
                    <div className="card-common bg-white p-0 shadow-sm border border-light h-100 rounded-4 d-flex flex-column overflow-hidden">
                        
                        <div className="bg-light p-4 border-bottom d-flex justify-content-between align-items-start">
                            <div>
                                <h5 className="fw-bold m-0 text-dark">Daily Agenda</h5>
                                <p className="text-muted small m-0 mt-1">
                                    {new Date(selectedDate).toLocaleDateString('en-GB', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                                </p>
                            </div>
                            <button className="btn btn-sm btn-outline-primary fw-bold shadow-sm" onClick={() => setShowNoteModal(true)}>
                                <i className="fa-solid fa-plus me-1"></i> Add Note
                            </button>
                        </div>

                        {selectedDate === todayStr && (
                            <div className="px-4 pt-3 pb-1">
                                <button className="btn btn-success fw-bold w-100 shadow-sm" onClick={() => navigate('/doctor/opd')}>
                                    <i className="fa-solid fa-stethoscope me-2"></i> Go to Today's OPD Queue
                                </button>
                            </div>
                        )}

                        <div className="p-4 overflow-auto flex-grow-1" style={{ maxHeight: '600px' }}>
                            
                            {/* RENDER NOTES */}
                            {agendaNotes.length > 0 && (
                                <div className="mb-4">
                                    <h6 className="fw-bold text-secondary mb-3"><i className="fa-solid fa-note-sticky me-2"></i>My Notes</h6>
                                    {agendaNotes.map(note => (
                                        <div key={note.id} className="p-3 mb-3 rounded-3 shadow-sm border border-warning position-relative" style={{ backgroundColor: '#fffdf0' }}>
                                            <i className="fa-solid fa-thumbtack text-warning position-absolute" style={{ top: '-10px', left: '50%', transform: 'translateX(-50%)', fontSize: '18px' }}></i>
                                            <p className="mb-0 text-dark small mt-2" style={{ whiteSpace: 'pre-wrap' }}>{note.note_text}</p>
                                        </div>
                                    ))}
                                    <hr className="text-muted my-4" />
                                </div>
                            )}

                            {/* RENDER APPOINTMENTS */}
                            {agendaAppointments.length > 0 ? (
                                <div className="timeline ps-3 ms-2">
                                    {agendaAppointments.map((appt, idx) => {
                                        const statusColor = getStatusColor(appt.status);
                                        return (
                                            <div className="timeline-item position-relative mb-4" key={appt.id || idx}>
                                                <div className={`position-absolute bg-${statusColor} rounded-circle`} style={{ width: '12px', height: '12px', left: '-25px', top: '5px' }}></div>
                                                
                                                <div className="d-flex justify-content-between align-items-center mb-1">
                                                    <h6 className="fw-bold text-dark m-0">{appt.patient_name || appt.patientName}</h6>
                                                    <span className="text-muted small fw-bold"><i className="fa-regular fa-clock me-1"></i>{appt.appointment_time || appt.time}</span>
                                                </div>
                                                
                                                <div className="bg-light p-3 rounded mt-2 border border-light">
                                                    <div className="d-flex justify-content-between align-items-center mb-2">
                                                        <span className="small text-muted">ID: {appt.id}</span>
                                                        <span className={`badge bg-${statusColor} bg-opacity-10 text-${statusColor} border border-${statusColor}`}>
                                                            {appt.status || 'Scheduled'}
                                                        </span>
                                                    </div>
                                                    <p className="small text-dark mb-0"><strong>Type:</strong> {appt.visit_type || appt.type || 'Consultation'}</p>
                                                    {appt.reason && <p className="small text-muted mb-0 mt-1">"{appt.reason}"</p>}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                !agendaNotes.length && (
                                    <div className="text-center py-5 h-100 d-flex flex-column justify-content-center">
                                        <div className="mb-3">
                                            <i className="fa-regular fa-calendar-xmark text-muted opacity-25" style={{ fontSize: '4rem' }}></i>
                                        </div>
                                        <h5 className="fw-bold text-muted">No Appointments</h5>
                                        <p className="text-muted small">You have a clear schedule for this day.</p>
                                    </div>
                                )
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* --- ADD NOTE MODAL --- */}
            {showNoteModal && (
                <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content border-0 shadow">
                            <div className="modal-header bg-primary text-white">
                                <h5 className="modal-title fw-bold"><i className="fa-solid fa-pen-to-square me-2"></i>Add Note for {new Date(selectedDate).toLocaleDateString('en-GB')}</h5>
                                <button className="btn-close btn-close-white" onClick={() => setShowNoteModal(false)}></button>
                            </div>
                            <form onSubmit={handleSaveNote}>
                                <div className="modal-body p-4 bg-light">
                                    <label className="fw-bold text-dark mb-2">Note Details</label>
                                    <textarea 
                                        className="form-control border-primary" 
                                        rows="4" 
                                        placeholder="Type your personal reminder, meeting, or task here..."
                                        value={noteText}
                                        onChange={(e) => setNoteText(e.target.value)}
                                        autoFocus
                                        required
                                    ></textarea>
                                </div>
                                <div className="modal-footer bg-white">
                                    <button type="button" className="btn btn-secondary" onClick={() => setShowNoteModal(false)}>Cancel</button>
                                    <button type="submit" className="btn btn-primary fw-bold" disabled={isSavingNote}>
                                        {isSavingNote ? 'Saving...' : 'Save Note'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
            
        </div>
    );
};

export default DoctorAppointments;