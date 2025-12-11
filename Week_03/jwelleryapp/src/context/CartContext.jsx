import React, { createContext, useState, useEffect } from "react";

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const STORAGE_KEY = "jwellify_cart_v1";

  const [cart, setCart] = useState(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
  }, [cart]);

  const findIndex = (id) => cart.findIndex((c) => c.id === id);

  const addToCart = (product, qty = 1) => {
    setCart((prev) => {
      const idx = prev.findIndex((p) => p.id === product.id);
      if (idx > -1) {
        // increase qty
        const copy = [...prev];
        copy[idx].quantity = Number(copy[idx].quantity) + Number(qty);
        return copy;
      } else {
        return [
          ...prev,
          {
            id: product.id,
            name: product.name,
            price: Number(product.price),
            image: product.image,
            quantity: Number(qty),
          },
        ];
      }
    });
  };

  const removeFromCart = (id) => {
    setCart((prev) => prev.filter((p) => p.id !== id));
  };

  const updateQty = (id, qty) => {
    setCart((prev) => {
      const copy = prev.map((p) =>
        p.id === id ? { ...p, quantity: Number(qty) } : p
      );
      // remove if qty <= 0
      return copy.filter((p) => p.quantity > 0);
    });
  };

  const clearCart = () => setCart([]);

  const totals = () => {
    const subtotal = cart.reduce((s, p) => s + p.price * p.quantity, 0);
    const delivery = cart.length > 0 ? 450 : 0;
    const gst = Number(((subtotal + delivery) * 0.05).toFixed(2));
    const grandTotal = Number((subtotal + delivery + gst).toFixed(2));
    return {
      subtotal: Number(subtotal.toFixed(2)),
      delivery,
      gst,
      grandTotal,
    };
  };

  const itemsCount = () => cart.reduce((s, p) => s + p.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQty,
        clearCart,
        totals,
        itemsCount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
