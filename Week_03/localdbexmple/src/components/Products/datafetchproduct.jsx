import React, { useEffect, useState } from "react";
import axios from "axios";

function DataFetch() {

    // State to store API data
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    // Function to call backend API
    const fetchProducts = async () => {
        try {
            const response = await axios.get("http://localhost:8000/products");
            setProducts(response.data);
        } catch (error) {
            console.error("Error Fetching Data:", error);
        } finally {
            setLoading(false);
        }
    };

    // Call API when component loads
    useEffect(() => {
        fetchProducts();
    }, []);

    // Loading state
    // if (loading) {
    //     return <marquee>Loading Data.....</marquee>;
    // }

    return (
        <div className="container mt-4">
            <h2 className="mb-3">Product List</h2>

            <table className="table table-bordered table-hover">
                <thead className="table-dark">
                    <tr>
                        <th>id</th>
                        <th>Product Name</th>
                        <th>Brand</th>
                        <th>MFG Year</th>
                    </tr>
                </thead>

                <tbody>
                    {products.length > 0 ? (
                        products.map((item, index) => (
                            <tr key={item.id || index}>
                                <td>{index + 1}</td>
                                <td>{item.name}</td>
                                <td>{item.brand}</td>
                                <td>{item.mfg_year}</td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan={4} className="text-center">
                                <h4>No data found...!!!!</h4>
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
}

export default DataFetch;
