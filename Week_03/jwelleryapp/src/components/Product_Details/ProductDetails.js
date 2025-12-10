import React from "react";
import { useParams } from "react-router-dom";
import "./ProductDetails.css";

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

    if (!product) return <h2>Product Not Found</h2>;

    return (
        <div className="container mt-5 product-details">
            <div className="row">
                {/* LEFT IMAGE */}
                <div className="col-md-6 text-center">
                    <img
                        src={product.image}
                        alt={product.name}
                        className="img-fluid main-product-img"
                    />
                </div>

                {/* RIGHT INFO */}
                <div className="col-md-6">
                    <h2 className="fw-bold">{product.name}</h2>

                    <p className="rating">⭐⭐⭐⭐☆ ({product.rating} / 10)</p>

                    <h3 className="price">${product.price}</h3>

                    <p className="desc">{product.description}</p>

                    {/* CART SECTION */}
                    <div className="d-flex gap-3 my-4">
                        <input type="number" defaultValue="1" className="qty-box" />
                        <button className="add-to-cart-btn">ADD TO CART</button>
                    </div>

                    {/* EXTRA ACTIONS */}
                    <div className="d-flex gap-4 mb-3">
                        <span>♡ Add to Wishlist</span>
                        <span>⇄ Compare</span>
                    </div>

                    <hr />

                    {/* META */}
                    <p>
                        <b>Category:</b> {product.category}
                    </p>

                    <p>
                        <b>Share:</b> Facebook | Twitter | Pinterest | Linkedin
                    </p>
                </div>
            </div>

            {/* THUMBNAILS */}
            <div className="d-flex gap-3 mt-5">
                <img src={product.image} className="thumb-img" />
                <img src={product.image} className="thumb-img" />
                <img src={product.image} className="thumb-img" />
            </div>
        </div>
    );
};

export default ProductDetails;
