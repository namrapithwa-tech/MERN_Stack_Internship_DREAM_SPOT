import React, { useEffect, useState } from "react";
import axios from "axios";
import "./products.css";

function DataFetchProducts() {

  // ================= STATES =================
  const [products, setProducts] = useState([]);

  // Insert form state
  const [formData, setFormData] = useState({
    name: "",
    brand: "",
    mfg_year: ""
  });

  // Update modal states
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [editFormData, setEditFormData] = useState({
    name: "",
    brand: "",
    mfg_year: ""
  });

  // ================= FETCH PRODUCTS =================
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
        "http://localhost:8000/products",
        formData
      );

      setProducts([...products, response.data]);
      setFormData({ name: "", brand: "", mfg_year: "" });

      alert("Product added successfully!");
    } catch (error) {
      console.error("Insert failed:", error);
      alert("Failed to add product");
    }
  };

  // ================= DELETE =================
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

  // ================= UPDATE =================
  const handleEditClick = (product) => {
    setSelectedProduct(product);
    setEditFormData({
      name: product.name,
      brand: product.brand,
      mfg_year: product.mfg_year
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
        `http://localhost:8000/products/${selectedProduct.id}`,
        editFormData
      );

      setProducts(
        products.map(item =>
          item.id === selectedProduct.id ? response.data : item
        )
      );

      setSelectedProduct(null);
      alert("Product updated successfully!");
    } catch (error) {
      console.error("Update failed:", error);
      alert("Failed to update product");
    }
  };

  // ================= UI =================
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

                  <button
                    className="btn btn-sm btn-outline-primary action-btn me-2"
                    data-bs-toggle="modal"
                    data-bs-target="#editProductModal"
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
              <td colSpan="5" className="text-center text-danger">
                No Data Found
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* UPDATE MODAL */}
      <div className="modal fade" id="editProductModal" tabIndex="-1">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">

            <div className="modal-header bg-primary text-white">
              <h5 className="modal-title">Update Product</h5>
              <button className="btn-close" data-bs-dismiss="modal"></button>
            </div>

            <div className="modal-body">
              <input
                type="text"
                name="name"
                className="form-control mb-3"
                value={editFormData.name}
                onChange={handleEditChange}
                placeholder="Product Name"
              />

              <input
                type="text"
                name="brand"
                className="form-control mb-3"
                value={editFormData.brand}
                onChange={handleEditChange}
                placeholder="Brand"
              />

              <input
                type="number"
                name="mfg_year"
                className="form-control"
                value={editFormData.mfg_year}
                onChange={handleEditChange}
                placeholder="MFG Year"
              />
            </div>

            <div className="modal-footer">
              <button className="btn btn-danger" data-bs-dismiss="modal">
                <i className="bi bi-x-square"></i>
              </button>
              <button
                className="btn btn-primary"
                data-bs-dismiss="modal"
                onClick={handleUpdate}
              >
                <i className="bi bi-pencil-square"></i>
              </button>
            </div>

          </div>
        </div>
      </div>

    </div>
  );
}

export default DataFetchProducts;
