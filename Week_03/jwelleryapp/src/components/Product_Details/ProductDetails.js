import React, { useState, useContext } from "react";
import { useParams } from "react-router-dom";
import "./ProductDetails.css";
import "../wishlist/Wishlist.css";
import { WishlistContext } from "../../context/WishlistContext";
import { CartContext } from "../../context/CartContext";

const products = [
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
const ProductDetails = () => {
    const { id } = useParams();
    const product = products.find((p) => p.id === Number(id));
    const [qty, setQty] = useState(1);

    const { addToCart } = useContext(CartContext);
    const { addToWishlist, removeFromWishlist, isInWishlist } = useContext(WishlistContext);

    if (!product) return <h2>Product Not Found</h2>;

    const handleHeart = (e) => {
        // animation
        const el = e.currentTarget;
        el.classList.add("heart-pop");
        setTimeout(() => el.classList.remove("heart-pop"), 420);

        if (isInWishlist(product.id)) removeFromWishlist(product.id);
        else addToWishlist(product);
    };

    return (
        <div className="details-page container mt-3 mb-4">
            <div className="row glass-box p-5 align-items-center">
                {/* LEFT IMAGE */}
                <div className="col-md-6 text-center">
                    <img src={product.image} alt={product.name} className="img-fluid main-product-img shadow-img" />

                    {/* THUMBNAILS */}
                    <div className="thumb-row d-flex gap-3 mt-2">
                        <img src={product.image} className="thumb-img" />
                        <img src={product.image} className="thumb-img" />
                        <img src={product.image} className="thumb-img" />
                    </div>
                </div>

                {/* RIGHT INFO */}
                <div className="col-md-6">
                    <h2 className="pd-title">{product.name}</h2>

                    <p className="pd-rating">⭐⭐⭐⭐☆ ({product.rating} / 10)</p>

                    <h3 className="pd-price">₹ {product.price}</h3>

                    <p className="pd-desc">{product.description}</p>

                    {/* CART SECTION */}
                    <div className="d-flex gap-3 my-4 align-items-center">
                        <input
                            type="number"
                            value={qty}
                            min={1}
                            className="qty-box"
                            onChange={(e) => setQty(Math.max(1, Number(e.target.value)))}
                        />
                        <button
                            className="add-cart-btn"
                            onClick={() => {
                                addToCart(product, qty);
                            }}
                        >
                            ADD TO CART
                        </button>
                    </div>

                    {/* EXTRA ACTIONS */}
                    <div className="pd-actions d-flex gap-3 mb-3 align-items-center">
                        <button
                            className={`pd-link ${isInWishlist(product.id) ? 'hearted' : ''}`}
                            onClick={handleHeart}
                            title="Add to wishlist"
                        >
                            <i className="bi bi-heart-fill"></i>
                        </button>

                        <span className="pd-link">⇄ Compare</span>
                    </div>

                    <hr />

                    {/* META */}
                    <p><b>Category:</b> {product.category}</p>
                    <div className="pd-share">
                        <b>Share:</b>
                        <div className="social-icons">
                            <i className="bi bi-facebook"></i>
                            <i className="bi bi-twitter"></i>
                            <i className="bi bi-pinterest"></i>
                            <i className="bi bi-linkedin"></i>
                            <i className="bi bi-instagram"></i>
                        </div>

                        {/* COPY LINK BUTTON */}
                        <button
                            className="copy-link-btn"
                            onClick={() => {
                                navigator.clipboard.writeText(window.location.href);
                                const el = document.querySelector(".copy-msg");
                                if (el) {
                                    el.classList.add("show");
                                    setTimeout(() => el.classList.remove("show"), 1400);
                                }
                            }}
                        >
                            <i className="bi bi-link-45deg"></i> Copy Link
                        </button>

                        <span className="copy-msg">Link Copied!</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductDetails;
