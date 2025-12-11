import React, { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { WishlistContext } from "../../context/WishlistContext";
import "./Wishlist.css";

const EmptyHeartAnimation = () => {
  return (
    <div className="empty-anim-wrap wishlist-empty">
      <svg className="empty-heart-svg" viewBox="0 0 120 120" aria-hidden>
        <defs>
          <linearGradient id="wG" x1="0%" x2="100%">
            <stop offset="0%" stopColor="#ffd47a" />
            <stop offset="100%" stopColor="#c8a049" />
          </linearGradient>
        </defs>

        <g fill="none" stroke="url(#wG)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path className="heart-path" d="M60 30 C50 10, 20 20, 30 45 C35 60, 60 78, 60 78 C60 78, 85 60, 90 45 C100 20, 70 10, 60 30 Z" />
        </g>
      </svg>

      <div className="empty-sparkles">
        {Array.from({ length: 6 }).map((_, i) => (
          <span key={i} className="sparkle" style={{ left: `${18 + i * 12}%`, animationDelay: `${i * 140}ms` }} />
        ))}
      </div>
    </div>
  );
};

const Wishlist = () => {
  const { wishlist, removeFromWishlist } = useContext(WishlistContext);
  const navigate = useNavigate();

  return (
    <div className="wishlist-page container my-5">
      <h2 className="section-title mb-4">Your Wishlist</h2>

      {wishlist.length === 0 ? (
        <div className="glass p-4 empty-wishlist-box text-center">
          <EmptyHeartAnimation />
          <div className="empty-text mt-4">
            <h4>Your wishlist is empty</h4>
            <p className="text-muted">Save items you love to view them later.</p>
            <div className="d-flex justify-content-center mt-3">
              <button className="auth-btn" onClick={() => navigate("/products")}>Browse Products</button>
            </div>
          </div>
        </div>
      ) : (
        <div className="glass p-3 wishlist-list">
          {wishlist.map((item) => (
            <div key={item.id} className="wish-item d-flex gap-3 align-items-center">
              <img
                src={item.image}
                alt={item.name}
                className="wish-item-img"
                onClick={() => navigate(`/product/${item.id}`)}
                style={{ cursor: "pointer" }}
              />
              <div className="flex-grow-1">
                <h5 className="mb-1 wish-name" onClick={() => navigate(`/product/${item.id}`)} style={{ cursor: "pointer" }}>{item.name}</h5>
                <div className="text-muted">₹ {Number(item.price).toFixed(2)}</div>
              </div>

              <div>
                <button className="delete-wish-btn" onClick={() => removeFromWishlist(item.id)} title="Remove from wishlist">
                  <i className="bi bi-trash"></i>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Wishlist;
