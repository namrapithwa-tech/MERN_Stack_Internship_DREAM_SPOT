import React, { useEffect, useState } from "react";
import axios from "axios";
import "./products.css";

function DataFetchProducts() {

  const [products, setProducts] = useState([]);

  const [formData, setFormData] = useState({
    name: "",
    brand: "",
    mfg_year: ""
  });

  // FETCH PRODUCTS
  const fetchProducts = async () => {
    try {
      const response = await axios.get("http://localhost:8000/products");
      setProducts(response.data);
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // HANDLE INPUT CHANGE
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  // INSERT PRODUCT
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post(
        "http://localhost:8000/products",
        formData
      );

      // Update UI instantly
      setProducts([...products, response.data]);

      // Clear form
      setFormData({
        name: "",
        brand: "",
        mfg_year: ""
      });

      alert("Product added successfully!");
    } catch (error) {
      console.error("Insert failed:", error);
      alert("Failed to add product");
    }
  };

  // DELETE PRODUCT
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;

    try {
      await axios.delete(`http://localhost:8000/products/${id}`);
      setProducts(products.filter(item => item.id !== id));
      alert("Product deleted successfully!");
    } catch (error) {
      console.error("Delete failed:", error);
      alert("Failed to delete product");
    }
  };

  return (
    <div className="container mt-4">

      {/* INSERT FORM */}
      <div className="card mb-4">
        <div className="card-header bg-primary bg-gradient text-white">
          Add New Product
        </div>

        <div className="card-body">
          <form onSubmit={handleSubmit} className="row g-3">

            <div className="col-md-4">
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="form-control"
                placeholder="Product Name"
                required
              />
            </div>

            <div className="col-md-4">
              <input
                type="text"
                name="brand"
                value={formData.brand}
                onChange={handleChange}
                className="form-control"
                placeholder="Brand"
                required
              />
            </div>

            <div className="col-md-3">
              <input
                type="number"
                name="mfg_year"
                value={formData.mfg_year}
                onChange={handleChange}
                className="form-control"
                placeholder="MFG Year"
                required
              />
            </div>

            <div className="col-md-1 d-grid">
              <button className="btn btn-warning bg-gradient text-white">
                <i className="bi bi-plus-circle"></i>
              </button>
            </div>

          </form>
        </div>
      </div>

      {/* PRODUCT TABLE */}
      <h2 className="mb-3">Product List</h2>

      <table className="table table-bordered table-hover">
        <thead className="bg-primary bg-gradient text-white">
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
              <tr key={item.id}>
                <td>{index + 1}</td>
                <td>{item.name}</td>
                <td>{item.brand}</td>
                <td>{item.mfg_year}</td>
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

export default DataFetchProducts;
