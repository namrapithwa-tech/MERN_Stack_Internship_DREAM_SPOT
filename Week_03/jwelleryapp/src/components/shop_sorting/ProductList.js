import { useNavigate } from "react-router-dom";
import React, { useState, useEffect } from 'react';
import './ProductList.css';


const ProductList = () => {
    const navigate = useNavigate();
    const initialProducts = [
        {
            id: 1,
            name: 'Carat Solitaire Diamond',
            category: 'Diamond',
            price: 78.00,
            rating: 4.5,
            popularity: 80,
            dateAdded: '2023-01-10',
            image: '../assets/media/carat-solitaire-diamond.jpg',
            description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut enim ad minim veniam.'
        },
        {
            id: 2,
            name: 'Diamond Band Ring',
            category: 'Silver',
            price: 86.00,
            rating: 4.0,
            popularity: 95,
            dateAdded: '2023-02-15',
            image: '../assets/media/silver-ring.jpg',
            description: 'Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Quis nostrud exercitation.'
        },
        {
            id: 3,
            name: 'Chatelaine, Necklaces',
            category: 'Bracelet',
            price: 100.00,
            rating: 5.0,
            popularity: 60,
            dateAdded: '2023-03-01',
            image: '../assets/media/panther-bracelet.jpg',
            description: 'Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip.'
        },
        {
            id: 4,
            name: 'Panther Bracelet',
            category: 'Nackles',
            price: 100.00,
            rating: 3.5,
            popularity: 100,
            dateAdded: '2023-04-20',
            image: '../assets/media/neckles.jpg',
            description: 'Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt.'
        },
        {
            id: 5,
            name: 'Sterling Silver Bead',
            category: 'Earings',
            price: 80.00,
            rating: 4.2,
            popularity: 45,
            dateAdded: '2022-12-05',
            image: '../assets/media/diamond-bang-ring.jpg',
            description: 'Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore.'
        },
        {
            id: 6,
            name: 'Carat Solitaire Diamond',
            category: 'Diamond',
            price: 55.00,
            rating: 2.5,
            popularity: 90,
            dateAdded: '2025-01-10',
            image: '../assets/media/carat-solitaire-diamond.jpg',
            description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut enim ad minim veniam.'
        },
        {
            id: 7,
            name: 'Diamond Band Ring',
            category: 'Silver',
            price: 76.00,
            rating: 7.0,
            popularity: 56,
            dateAdded: '2025-02-15',
            image: '../assets/media/silver-ring.jpg',
            description: 'Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Quis nostrud exercitation.'
        },
        {
            id: 8,
            name: 'Chatelaine, Necklaces',
            category: 'Bracelet',
            price: 2304.00,
            rating: 10.00,
            popularity: 100,
            dateAdded: '2025-12-09',
            image: '../assets/media/panther-bracelet.jpg',
            description: 'Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip.'
        },
        {
            id: 9,
            name: 'Panther Bracelet',
            category: 'Nackles',
            price: 150.00,
            rating: 3.5,
            popularity: 60,
            dateAdded: '2023-04-20',
            image: '../assets/media/neckles.jpg',
            description: 'Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt.'
        },
        {
            id: 10,
            name: 'Sterling Silver Bead',
            category: 'Earings',
            price: 96.00,
            rating: 4.3,
            popularity: 54,
            dateAdded: '2022-12-05',
            image: '../assets/media/diamond-bang-ring.jpg',
            description: 'Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore.'
        },
        {
            id: 11,
            name: 'Diamond Band Ring',
            category: 'Silver',
            price: 86.00,
            rating: 4.0,
            popularity: 95,
            dateAdded: '2023-02-15',
            image: '../assets/media/silver-ring.jpg',
            description: 'Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Quis nostrud exercitation.'
        },
        {
            id: 12,
            name: 'Chatelaine, Necklaces',
            category: 'Bracelet',
            price: 2304.00,
            rating: 10.00,
            popularity: 100,
            dateAdded: '2025-12-09',
            image: '../assets/media/panther-bracelet.jpg',
            description: 'Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip.'
        }
    ];

    const [products, setProducts] = useState(initialProducts);
    const [viewMode, setViewMode] = useState('grid');
    const [sortType, setSortType] = useState('default');
    

    // --- Sorting Logic ---
    useEffect(() => {
        const sortArray = type => {
            let sorted = [...initialProducts];

            switch (type) {
                case 'popularity':
                    sorted.sort((a, b) => b.popularity - a.popularity);
                    break;
                case 'rating':
                    sorted.sort((a, b) => b.rating - a.rating);
                    break;
                case 'latest':
                    sorted.sort((a, b) => new Date(b.dateAdded) - new Date(a.dateAdded));
                    break;
                case 'lowToHigh':
                    sorted.sort((a, b) => a.price - b.price);
                    break;
                case 'highToLow':
                    sorted.sort((a, b) => b.price - a.price);
                    break;
                default:
                    sorted.sort((a, b) => a.id - b.id);
                    break;
            }
            setProducts(sorted);
        };

        sortArray(sortType);
    }, [sortType]);

    return (
        <div className="container mt-5">
            {/* --- Header Controls --- */}
            <div className="d-flex justify-content-between align-items-center mb-5 pb-3 border-bottom">
                <div className="d-flex align-items-center">
                    {/* View Toggles */}
                    <button
                        className={`btn btn-link text-decoration-none p-0 me-3 text-dark ${viewMode === 'grid' ? 'opacity-100' : 'opacity-50'}`}
                        onClick={() => setViewMode('grid')}
                    >
                        <i className="bi bi-grid-3x3-gap-fill fs-4"></i>
                    </button>
                    <button
                        className={`btn btn-link text-decoration-none p-0 me-3 text-dark ${viewMode === 'list' ? 'opacity-100' : 'opacity-50'}`}
                        onClick={() => setViewMode('list')}
                    >
                        <i className="bi bi-list-ul fs-4"></i>
                    </button>
                    <span className="text-muted small">Showing 1–{products.length} of {products.length} results</span>
                </div>

                {/* Sorting Dropdown */}
                <div>
                    <select
                        className="form-select border-0 bg-transparent text-end"
                        style={{ cursor: 'pointer' }}
                        onChange={(e) => setSortType(e.target.value)}
                        value={sortType}
                    >
                        <option value="default">Default sorting</option>
                        <option value="popularity">Sort by popularity</option>
                        <option value="rating">Sort by average rating</option>
                        <option value="latest">Sort by latest</option>
                        <option value="lowToHigh">Sort by price: low to high</option>
                        <option value="highToLow">Sort by price: high to low</option>
                    </select>
                </div>
            </div>

            {/* --- Product Map --- */}
            <div className={viewMode === 'grid' ? 'row' : 'd-flex flex-column gap-5'}>
                {products.map((product) => (
                    <div key={product.id} className={viewMode === 'grid' ? 'col-lg-3 col-md-4 col-sm-6 mb-4' : 'row w-100 mb-4'}>

                        <div
                            className={`product-card-wrapper ${viewMode}`}
                            onClick={() => navigate(`/product/${product.id}`)}
                            style={{ cursor: "pointer" }}
                        >

                            {/* Image & Hover Icons */}
                            <div className={`image-box position-relative ${viewMode === 'list' ? 'col-md-4' : ''}`}>
                                <img src={product.image} alt={product.name} className="img-fluid w-100" />

                                {/* Floating Icons (Visible on Hover in Grid, Always/Conditional in List) */}
                                <div className={`hover-actions ${viewMode === 'list' ? 'd-none' : ''}`}>
                                    <div className="action-btn"><i className="bi bi-heart"></i></div>
                                    <div className="action-btn"><i className="bi bi-arrow-left-right"></i></div>
                                    <div className="action-btn"><i className="bi bi-search"></i></div>
                                    <div className="action-btn text-with-icon">Add to cart</div>
                                </div>
                            </div>

                            {/* Text Details */}
                            <div className={`details-box ${viewMode === 'list' ? 'col-md-8 px-4 d-flex flex-column justify-content-center align-items-start' : 'text-center mt-3'}`}>
                                <p className="text-muted small mb-1">Category : {product.category}</p>
                                <h6 className="fw-bold mb-2 text-dark">{product.name}</h6>
                                <p className="text-muted fw-bold">₹ {product.price.toFixed(2)}</p>
                                <p className="text-muted small mb-1">Product Rating : {product.rating} /10</p>
                                <p className="text-muted small mb-1">Product Added Date : {product.dateAdded}</p>
                                <p className="text-muted small mb-1">Product Popularity : {product.popularity} / 100</p>

                                {/* List View Specific Elements */}
                                {viewMode === 'list' && (
                                    <div className="list-view-content mt-2">
                                        <p className="text-muted small mb-3">{product.description}</p>
                                        <div className="d-flex gap-2">
                                            <button className="btn btn-outline-dark rounded-0 px-4">Add to cart</button>
                                            <button className="btn btn-light border"><i className="bi bi-heart"></i></button>
                                            <button className="btn btn-light border"><i className="bi bi-search"></i></button>
                                        </div>
                                    </div>
                                )}
                            </div>

                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ProductList;