import { useNavigate } from "react-router-dom";
import React, { useState, useEffect, useContext } from 'react';
import './ProductList.css';
import '../wishlist/Wishlist.css'; // import heart/pop animation styles
import { WishlistContext } from '../../context/WishlistContext';
import { CartContext } from '../../context/CartContext';

const ProductList = () => {
    const navigate = useNavigate();
    const { addToWishlist, removeFromWishlist, isInWishlist } = useContext(WishlistContext);
    const { addToCart } = useContext(CartContext);

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

    // heart click (toggle)
    const handleHeartClick = (e, product) => {
        e.stopPropagation();
        // add animation
        const el = e.currentTarget;
        el.classList.add("heart-pop");
        setTimeout(() => el.classList.remove("heart-pop"), 420);

        if (isInWishlist(product.id)) removeFromWishlist(product.id);
        else addToWishlist(product);
    };

    return (
        <div className="pl-page container p-5 my-5">
            <div className="pl-topbar d-flex justify-content-between align-items-center mb-4">
                <div className="d-flex align-items-center gap-3">
                    <div className="view-toggle">
                        <button
                            className={`icon-btn ${viewMode === 'grid' ? 'active' : ''}`}
                            onClick={() => setViewMode('grid')}
                            aria-label="grid view"
                        >
                            <i className="bi bi-grid-3x3-gap-fill"></i>
                        </button>
                        <button
                            className={`icon-btn ${viewMode === 'list' ? 'active' : ''}`}
                            onClick={() => setViewMode('list')}
                            aria-label="list view"
                        >
                            <i className="bi bi-list-ul"></i>
                        </button>
                    </div>
                    <div className="results small text-muted">
                        Showing <span className="fw-semibold">{products.length}</span> results
                    </div>
                </div>

                <div className="sort-wrap">
                    <select
                        className="form-select form-select-sm pl-sort-select"
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

            <div className={viewMode === 'grid' ? 'row row-cols-lg-4 row-cols-md-3 row-cols-sm-2 g-4' : 'list-column'}>
                {products.map((product) => (
                    <div key={product.id} className={viewMode === 'grid' ? 'col' : 'list-item mb-4'}>
                        <div
                            className={`pl-card ${viewMode} glass`}
                            onClick={() => navigate(`/product/${product.id}`)}
                            role="button"
                            tabIndex={0}
                            onKeyDown={() => {}}
                        >
                            <div className="pl-media">
                                <img src={product.image} alt={product.name} className="pl-img" />
                                <div className="pl-overlay">
                                    {/* wishlist heart */}
                                    <button
                                      className={`pl-icon circle ${isInWishlist(product.id) ? 'pl-icon circle' : ''}`}
                                      onClick={(e) => handleHeartClick(e, product)}
                                      title="Add to wishlist"
                                    >
                                      <i className="bi bi-heart-fill"></i>
                                    </button>

                                    <button className="pl-icon circle"><i className="bi bi-arrow-left-right"></i></button>
                                    <button className="pl-icon circle"><i className="bi bi-search"></i></button>

                                    {/* IMPORTANT: stopPropagation so card click doesn't navigate */}
                                    <button
                                        className="pl-add btn"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            addToCart(product, 1);
                                        }}
                                    >
                                        Add to cart
                                    </button>
                                </div>

                                <div className="pl-badge">
                                    <span className="gold">₹ {product.price.toFixed(0)}</span>
                                </div>
                            </div>

                            <div className="pl-body">
                                <div className="pl-meta small text-muted">Category: {product.category}</div>
                                <h5 className="pl-title">{product.name}</h5>
                                <div className="d-flex align-items-center justify-content-between w-100">
                                    <div className="pl-rating small">Rating: <span className="fw-bold">{product.rating}</span>/10</div>
                                    <div className="pl-pop small text-muted">Popularity: {product.popularity}</div>
                                </div>

                                {viewMode === 'list' && (
                                    <div className="pl-list-details mt-3">
                                        <p className="small text-muted">{product.description}</p>
                                        <div className="d-flex gap-2">
                                            <button
                                                className="btn btn-outline-dark btn-sm"
                                                onClick={(e) => { e.stopPropagation(); addToCart(product, 1); }}
                                            >
                                                Add to cart
                                            </button>

                                            <button
                                              className={`heart-btn ${isInWishlist(product.id) ? 'hearted' : ''}`}
                                              onClick={(e) => handleHeartClick(e, product)}
                                              title="Add to wishlist"
                                            >
                                              <i className="bi bi-heart-fill"></i>
                                            </button>

                                            <button className="btn btn-light btn-sm border"><i className="bi bi-search"></i></button>
                                        </div>
                                    </div>
                                )}

                                <div className="pl-footer small text-muted mt-2">
                                    Added: {product.dateAdded}
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ProductList;
