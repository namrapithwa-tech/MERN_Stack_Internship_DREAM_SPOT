import React, { useEffect, useState } from "react";
import axios from "axios";
import "./products.css";

function DataFetch() {

  const [products, setProducts] = useState([]);

  useEffect(() => {
    axios.get("http://localhost:8000/products")
      .then(res => setProducts(res.data))
      .catch(err => console.error(err));
  }, []);

  return (
    <div className="container mt-4">
      <h2 className="mb-3">Product List</h2>

      <table className="table table-bordered table-hover">
        <thead>
          <tr>
            <th>#</th>
            <th>Product Name</th>
            <th>Brand</th>
            <th>MFG Year</th>
            <th className="text-center">Actions</th>
          </tr>
        </thead>

        <tbody>
          {products.length > 0 ? (
            products.map((item, index) => (
              <tr key={index}>
                <td>{index + 1}</td>
                <td>{item.name}</td>
                <td>{item.brand}</td>
                <td>{item.mfg_year}</td>
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
              <td colSpan="5" className="text-center text-danger">
                No Data Found
              </td>
            </tr> 
          )}
        </tbody>
      </table>
    </div>
  );
}

export default DataFetch;
