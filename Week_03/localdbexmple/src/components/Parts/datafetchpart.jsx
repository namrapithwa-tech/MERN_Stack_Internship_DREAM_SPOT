import axios from "axios";
import React, { useEffect, useState } from "react";
import "./parts.css";

function DataFetchParts() {

  // ================= STATES =================
  const [parts, setParts] = useState([]);

  // Insert form state
  const [formData, setFormData] = useState({
    name: "",
    equiped_model: ""
  });

  // Update modal states
  const [selectedPart, setSelectedPart] = useState(null);
  const [editFormData, setEditFormData] = useState({
    name: "",
    equiped_model: ""
  });

  // ================= FETCH PARTS =================
  const fetchParts = async () => {
    try {
      const response = await axios.get("http://localhost:8000/parts");
      setParts(response.data);
    } catch (error) {
      console.error("Error fetching parts:", error);
    }
  };

  useEffect(() => {
    fetchParts();
  }, []);

  // ================= INSERT =================
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        "http://localhost:8000/parts",
        formData
      );

      setParts([...parts, response.data]);
      setFormData({ name: "", equiped_model: "" });

      alert("Part added successfully!");
    } catch (error) {
      console.error("Insert failed:", error);
      alert("Failed to add part");
    }
  };

  // ================= DELETE =================
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this part?")) return;

    try {
      await axios.delete(`http://localhost:8000/parts/${id}`);
      setParts(parts.filter(item => item.id !== id));
      alert("Part deleted successfully!");
    } catch (error) {
      console.error("Delete failed:", error);
      alert("Failed to delete part");
    }
  };

  // ================= UPDATE =================
  const handleEditClick = (part) => {
    setSelectedPart(part);
    setEditFormData({
      name: part.name,
      equiped_model: part.equiped_model
    });
  };

  const handleEditChange = (e) => {
    setEditFormData({
      ...editFormData,
      [e.target.name]: e.target.value
    });
  };

  const handleUpdate = async () => {
    try {
      const response = await axios.put(
        `http://localhost:8000/parts/${selectedPart.id}`,
        editFormData
      );

      setParts(
        parts.map(item =>
          item.id === selectedPart.id ? response.data : item
        )
      );

      setSelectedPart(null);
      alert("Part updated successfully!");
    } catch (error) {
      console.error("Update failed:", error);
      alert("Failed to update part");
    }
  };

  // ================= UI =================
  return (
    <div className="container mt-4">

      {/* INSERT FORM */}
      <div className="card mb-4">
        <div className="card-header bg-success bg-gradient text-white">
          Add New Part
        </div>

        <div className="card-body">
          <form onSubmit={handleSubmit} className="row g-4">

            <div className="col-md-5">
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="form-control"
                placeholder="Part Name"
                required
              />
            </div>

            <div className="col-md-5">
              <input
                type="text"
                name="equiped_model"
                value={formData.equiped_model}
                onChange={handleChange}
                className="form-control"
                placeholder="Equipped Model"
                required
              />
            </div>

            <div className="col-md-2 d-grid">
              <button className="btn btn-warning bg-gradient text-white">
                <i className="bi bi-plus-circle"></i>
              </button>
            </div>

          </form>
        </div>
      </div>

      {/* PART TABLE */}
      <h2 className="mb-3 text-success">Parts List</h2>

      <table className="table table-bordered table-hover">
        <thead className="bg-success bg-gradient text-white">
          <tr>
            <th>#</th>
            <th>Part Name</th>
            <th>Equipped Model</th>
            <th className="text-center">Actions</th>
          </tr>
        </thead>

        <tbody>
          {parts.length > 0 ? (
            parts.map((item, index) => (
              <tr key={item.id}>
                <td>{index + 1}</td>
                <td>{item.name}</td>
                <td>{item.equiped_model}</td>
                <td className="text-center">

                  <button
                    className="btn btn-sm btn-outline-primary action-btn me-2"
                    data-bs-toggle="modal"
                    data-bs-target="#editPartModal"
                    onClick={() => handleEditClick(item)}
                  >
                    <i className="bi bi-pencil-square"></i>
                  </button>

                  <button
                    className="btn btn-sm btn-outline-danger action-btn"
                    onClick={() => handleDelete(item.id)}
                  >
                    <i className="bi bi-trash"></i>
                  </button>

                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="4" className="text-center text-danger">
                No Data Found
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* UPDATE MODAL */}
      <div className="modal fade" id="editPartModal" tabIndex="-1">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">

            <div className="modal-header bg-success text-white">
              <h5 className="modal-title">Update Part</h5>
              <button className="btn-close" data-bs-dismiss="modal"></button>
            </div>

            <div className="modal-body">
              <input
                type="text"
                name="name"
                className="form-control mb-3"
                value={editFormData.name}
                onChange={handleEditChange}
                placeholder="Part Name"
              />

              <input
                type="text"
                name="equiped_model"
                className="form-control"
                value={editFormData.equiped_model}
                onChange={handleEditChange}
                placeholder="Equipped Model"
              />
            </div>

            <div className="modal-footer">
              <button className="btn btn-secondary" data-bs-dismiss="modal">
                Cancel
              </button>
              <button
                className="btn btn-success"
                data-bs-dismiss="modal"
                onClick={handleUpdate}
              >
                Update
              </button>
            </div>

          </div>
        </div>
      </div>

    </div>
  );
}

export default DataFetchParts;
