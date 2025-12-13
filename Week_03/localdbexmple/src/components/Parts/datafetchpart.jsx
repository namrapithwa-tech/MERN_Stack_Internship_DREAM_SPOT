import axios from "axios";
import React, { useEffect, useState } from "react";
import "./parts.css";

function DataFetchParts() {

  const [parts, setParts] = useState([]);

  useEffect(() => {
    axios.get("http://localhost:8000/parts")
      .then(res => setParts(res.data))
      .catch(err => console.error(err));
  }, []);

  return (
    <div className="container mt-4">
      <h2 className="mb-3 text-success">Parts List</h2>

      <table className="table table-bordered table-hover">
        <thead>
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
              <tr key={index}>
                <td>{index + 1}</td>
                <td>{item.name}</td>
                <td>{item.equiped_model}</td>
                <td className="text-center">
                  <button className="btn btn-sm btn-outline-primary action-btn me-2">
                    <i className="bi bi-pencil-square"></i>
                  </button>

                  <button className="btn btn-sm btn-outline-danger action-btn">
                    <i className="bi bi-trash"></i>
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="3" className="text-center text-danger">
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
