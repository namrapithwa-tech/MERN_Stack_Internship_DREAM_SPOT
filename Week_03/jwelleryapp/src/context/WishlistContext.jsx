import React, { createContext, useEffect, useState } from "react";

export const WishlistContext = createContext();

export const WishlistProvider = ({ children }) => {
  const STORAGE_KEY = "jwellify_wishlist_v1";

  const [wishlist, setWishlist] = useState(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(wishlist));
  }, [wishlist]);

  const isInWishlist = (id) => wishlist.some((p) => p.id === id);

  const addToWishlist = (product) => {
    setWishlist((prev) => {
      if (prev.find((p) => p.id === product.id)) return prev;
      return [
        ...prev,
        {
          id: product.id,
          name: product.name,
          price: Number(product.price),
          image: product.image,
        },
      ];
    });
  };

  const removeFromWishlist = (id) => {
    setWishlist((prev) => prev.filter((p) => p.id !== id));
  };

  const clearWishlist = () => setWishlist([]);

  const count = () => wishlist.length;

  return (
    <WishlistContext.Provider
      value={{
        wishlist,
        addToWishlist,
        removeFromWishlist,
        clearWishlist,
        isInWishlist,
        count,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};
