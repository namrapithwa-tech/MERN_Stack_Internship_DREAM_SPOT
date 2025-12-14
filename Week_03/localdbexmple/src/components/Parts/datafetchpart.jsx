import axios from "axios";
import React, { useEffect, useState } from "react";
import "./parts.css";

function DataFetchParts() {

  const [parts, setParts] = useState([]);

  // FETCH PARTS
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

  // DELETE PART
  const handleDelete = async (id) => {

    const confirmDelete = window.confirm(
      "Are you sure you want to delete this part?"
    );

    if (!confirmDelete) return;

    try {
      await axios.delete(`http://localhost:8000/parts/${id}`);

      // Update UI instantly
      setParts(parts.filter(item => item.id !== id));

      alert("Part deleted successfully!");
    } catch (error) {
      console.error("Delete failed:", error);
      alert("Failed to delete part");
    }
  };

  return (
    <div className="container mt-4">
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
              <tr key={item.id || index}>
                <td>{index + 1}</td>
                <td>{item.name}</td>
                <td>{item.equiped_model}</td>
                <td className="text-center">

                  <button className="btn btn-sm btn-outline-primary action-btn me-2">
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
    </div>
  );
}

export default DataFetchParts;
