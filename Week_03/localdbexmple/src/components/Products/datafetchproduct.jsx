import React, { useEffect, useState } from "react";
import axios from "axios";
import "./products.css";

function DataFetchProducts() {

  const [products, setProducts] = useState([]);

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

  // DELETE PRODUCT
  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this product?"
    );

    if (!confirmDelete) return;

    try {
      await axios.delete(`http://localhost:8000/products/${id}`);

      // Update UI instantly
      setProducts(products.filter(item => item.id !== id));

      alert("Product deleted successfully!");
    } catch (error) {
      console.error("Delete failed:", error);
      alert("Failed to delete product");
    }
  };

  return (
    <div className="container mt-4">
      <h2 className="mb-3">Product List</h2>

      <table className="table table-bordered table-hover">
        <thead className="bg-primary bg-gradient">
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
