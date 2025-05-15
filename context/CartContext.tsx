import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product, mockProducts } from '../data/products';

interface CartItem {
  product: Product;
  quantity: number;
}

interface CartContextType {
  items: CartItem[];
  totalItems: number;
  subtotal: number;
  shipping: number;
  total: number;
  couponCode: string | null;
  discount: number;
  addItem: (product: Product, quantity?: number) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  applyCoupon: (code: string) => boolean;
  removeCoupon: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const SHIPPING_COST = 10; // Fixed shipping cost
const COUPONS = [
  { code: 'WELCOME10', discount: 0.1 }, // 10% discount
  { code: 'FREESHIP', discount: SHIPPING_COST } // Free shipping
];

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [couponCode, setCouponCode] = useState<string | null>(null);
  const [discount, setDiscount] = useState(0);

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      try {
        const parsedCart = JSON.parse(savedCart);
        
        // Convert stored cart to full items with product objects
        const hydratedItems = parsedCart.items.map((item: any) => ({
          product: mockProducts.find(p => p.id === item.productId) || item.product,
          quantity: item.quantity
        })).filter((item: CartItem) => item.product); // Filter out any items where product wasn't found
        
        setItems(hydratedItems);
        setCouponCode(parsedCart.couponCode);
        
        // Recalculate discount based on coupon
        if (parsedCart.couponCode) {
          const coupon = COUPONS.find(c => c.code === parsedCart.couponCode);
          if (coupon) {
            calculateDiscount(coupon.discount, hydratedItems);
          }
        }
      } catch (error) {
        console.error('Error loading cart from localStorage:', error);
      }
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    // Simplify the cart for storage (don't store entire product objects)
    const simplifiedItems = items.map(item => ({
      productId: item.product.id,
      quantity: item.quantity
    }));
    
    localStorage.setItem('cart', JSON.stringify({
      items: simplifiedItems,
      couponCode
    }));
  }, [items, couponCode]);

  const calculateDiscount = (discountValue: number, currentItems = items) => {
    const subtotal = currentItems.reduce(
      (sum, item) => sum + (item.product.price * item.quantity), 
      0
    );
    setDiscount(Math.min(discountValue, subtotal + SHIPPING_COST));
  };

  const addItem = (product: Product, quantity = 1) => {
    setItems(prevItems => {
      const existingItem = prevItems.find(item => item.product.id === product.id);
      
      if (existingItem) {
        // Update quantity if item already exists
        return prevItems.map(item => 
          item.product.id === product.id 
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      } else {
        // Add new item
        return [...prevItems, { product, quantity }];
      }
    });
    
    // Recalculate discount if coupon is applied
    if (couponCode) {
      const coupon = COUPONS.find(c => c.code === couponCode);
      if (coupon) {
        calculateDiscount(coupon.discount);
      }
    }
  };

  const removeItem = (productId: string) => {
    setItems(prevItems => prevItems.filter(item => item.product.id !== productId));
    
    // Recalculate discount if coupon is applied
    if (couponCode) {
      const coupon = COUPONS.find(c => c.code === couponCode);
      if (coupon) {
        calculateDiscount(coupon.discount);
      }
    }
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(productId);
      return;
    }
    
    setItems(prevItems =>
      prevItems.map(item =>
        item.product.id === productId ? { ...item, quantity } : item
      )
    );
    
    // Recalculate discount if coupon is applied
    if (couponCode) {
      const coupon = COUPONS.find(c => c.code === couponCode);
      if (coupon) {
        calculateDiscount(coupon.discount);
      }
    }
  };

  const clearCart = () => {
    setItems([]);
    setCouponCode(null);
    setDiscount(0);
  };

  const applyCoupon = (code: string) => {
    const coupon = COUPONS.find(c => c.code === code);
    
    if (coupon) {
      setCouponCode(code);
      calculateDiscount(coupon.discount);
      return true;
    }
    
    return false;
  };

  const removeCoupon = () => {
    setCouponCode(null);
    setDiscount(0);
  };

  // Calculate totals
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = items.reduce(
    (sum, item) => sum + (item.product.price * item.quantity), 
    0
  );
  const shipping = items.length > 0 ? SHIPPING_COST : 0;
  const total = Math.max(0, subtotal + shipping - discount);

  const value = {
    items,
    totalItems,
    subtotal,
    shipping,
    total,
    couponCode,
    discount,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    applyCoupon,
    removeCoupon
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};