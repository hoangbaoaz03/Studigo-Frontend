"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { Course } from "@/lib/api";

interface CartItem {
  id: number;
  slug: string;
  title: string;
  instructor_name: string;
  thumbnail: string | null;
  price: string;
  current_price: number;
  has_discount: boolean;
  discount_price: string | null;
}

interface CartContextType {
  items: CartItem[];
  addToCart: (course: Course | CartItem) => void;
  removeFromCart: (courseId: number) => void;
  removeBatch: (courseIds: number[]) => void;
  clearCart: () => void;
  isInCart: (courseId: number) => boolean;
  totalPrice: number;
  itemCount: number;
  // Selection for Checkout
  checkoutItems: CartItem[];
  checkoutIds: number[];
  setCheckoutSelection: (ids: number[]) => void;
  selectedTotal: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

import { useAuth } from "@/context/AuthContext";

const CART_STORAGE_KEY_PREFIX = "studigo_cart_";

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [items, setItems] = useState<CartItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Helper to get key
  const getStorageKey = () => {
      if (user) return `${CART_STORAGE_KEY_PREFIX}${user.id}`;
      return `${CART_STORAGE_KEY_PREFIX}guest`;
  };

  // Load cart from localStorage when User changes
  useEffect(() => {
    if (typeof window !== "undefined") {
      const key = getStorageKey();
      const savedCart = localStorage.getItem(key);
      
      if (savedCart) {
        try {
          setItems(JSON.parse(savedCart));
        } catch (e) {
          console.error("Failed to parse cart", e);
          setItems([]);
        }
      } else {
          setItems([]); // Clear if no cart found for this user
      }
      setIsLoaded(true);
    }
  }, [user]); // Re-run when user changes

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    if (isLoaded && typeof window !== "undefined") {
      const key = getStorageKey();
      localStorage.setItem(key, JSON.stringify(items));
    }
  }, [items, isLoaded, user]);

  const addToCart = (course: Course | CartItem) => {
    if (isInCart(course.id)) return;
    
    const cartItem: CartItem = {
      id: course.id,
      slug: course.slug,
      title: course.title,
      instructor_name: course.instructor_name,
      thumbnail: course.thumbnail,
      price: course.price,
      current_price: course.current_price,
      has_discount: course.has_discount,
      discount_price: course.discount_price,
    };
    
    setItems((prev) => [...prev, cartItem]);
  };

  const removeFromCart = (courseId: number) => {
    setItems((prev) => prev.filter((item) => item.id !== courseId));
  };

  const clearCart = () => {
    setItems([]);
  };

  const isInCart = (courseId: number) => {
    return items.some((item) => item.id === courseId);
  };

  const totalPrice = items.reduce((sum, item) => sum + item.current_price, 0);
  const itemCount = items.length;

  // Checkout Selection State
  const [checkoutIds, setCheckoutIds] = useState<number[]>([]);

  const setCheckoutSelection = (ids: number[]) => {
      setCheckoutIds(ids);
  };
  
  // Computed property for Checkout Page
  const checkoutItems = items.filter(item => checkoutIds.includes(item.id));
  
  // Computed property for Cart Page
  const selectedTotal = items
    .filter(item => checkoutIds.includes(item.id))
    .reduce((sum, item) => sum + item.current_price, 0);

  const removeBatch = (courseIds: number[]) => {
      setItems((prev) => prev.filter((item) => !courseIds.includes(item.id)));
      // Also clear selection for removed items
      setCheckoutIds((prev) => prev.filter((id) => !courseIds.includes(id)));
  };

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        removeBatch,
        clearCart,
        isInCart,
        totalPrice,
        itemCount,
        checkoutItems,
        checkoutIds,
        setCheckoutSelection,
        selectedTotal
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
