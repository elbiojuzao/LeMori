import React, { createContext, useContext, useState, useEffect } from 'react';
import { mockProducts } from '../data/products';

interface CartItem {
  product: Product;
  quantity: number;
}

interface ShippingOption {
  id: number;
  name: string;
  price: number;
  delivery_time: number;
  delivery_range: {
    min: number;
    max: number;
  };
}

interface Product {
  _id: string;
  id: string;
  name: string;
  price: number;
  isFisico: boolean;
  imageSrc?: string;
  peso?: number;      // em gramas
  largura?: number;   // em cm
  altura?: number;    // em cm
  comprimento?: number; // em cm
}

interface CartContextType {
  items: CartItem[];
  totalItems: number;
  subtotal: number;
  shipping: number;
  total: number;
  couponCode: string | null;
  discount: number;
  shippingOptions: ShippingOption[];
  selectedShippingOption: ShippingOption | null;
  addItem: (product: Product, quantity?: number) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  applyCoupon: (code: string) => boolean;
  removeCoupon: () => void;
  calculateShipping: (cep: string) => Promise<void>;
  selectShippingOption: (option: ShippingOption) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const COUPONS = [
  { code: 'WELCOME10', discount: 0.1 }, // 10% discount
  { code: 'FREESHIP', discount: 0 } // Free shipping
];

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [couponCode, setCouponCode] = useState<string | null>(null);
  const [discount, setDiscount] = useState(0);
  const [shippingOptions, setShippingOptions] = useState<ShippingOption[]>([]);
  const [selectedShippingOption, setSelectedShippingOption] = useState<ShippingOption | null>(null);

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
    const shippingCost = selectedShippingOption?.price || 0;
    setDiscount(Math.min(discountValue, subtotal + shippingCost));
  };

  const calculateShipping = async (cep: string) => {
    try {
      const response = await fetch('/api/shipping/calculate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          cep,
          items: items.map(item => ({
            id: item.product.id,
            peso: item.product.peso,
            largura: item.product.largura,
            altura: item.product.altura,
            comprimento: item.product.comprimento,
            quantity: item.quantity
          }))
        })
      });

      if (!response.ok) {
        throw new Error('Erro ao calcular frete');
      }

      const data = await response.json();
      setShippingOptions(data.shippingOptions);
      
      // Seleciona a primeira opção por padrão
      if (data.shippingOptions.length > 0) {
        setSelectedShippingOption(data.shippingOptions[0]);
      }
    } catch (error) {
      console.error('Erro ao calcular frete:', error);
      throw error;
    }
  };

  const selectShippingOption = (option: ShippingOption) => {
    setSelectedShippingOption(option);
    
    // Recalcula o desconto se houver cupom aplicado
    if (couponCode) {
      const coupon = COUPONS.find(c => c.code === couponCode);
      if (coupon) {
        calculateDiscount(coupon.discount);
      }
    }
  };

  const addItem = (product: Product, quantity = 1) => {
    // Mapeia campos em inglês para português, se necessário
    const produtoCorrigido: Product = {
      ...product,
      peso: product.peso ?? (product as any).weight ?? 0,
      largura: product.largura ?? (product as any).width ?? 0,
      altura: product.altura ?? (product as any).height ?? 0,
      comprimento: product.comprimento ?? (product as any).length ?? 0,
    };

    setItems(prevItems => {
      const existingItem = prevItems.find(item => item.product.id === produtoCorrigido.id);
      
      if (existingItem) {
        // Update quantity if item already exists
        return prevItems.map(item => 
          item.product.id === produtoCorrigido.id 
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      } else {
        // Add new item
        return [...prevItems, { product: produtoCorrigido, quantity }];
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
  const subtotal = Number(items.reduce(
    (sum, item) => sum + (Number(item.product.price) * item.quantity), 
    0
  ).toFixed(2));
  const shipping = selectedShippingOption?.price || 0;
  const total = Number((subtotal + shipping - discount).toFixed(2));

  const value = {
    items,
    totalItems,
    subtotal,
    shipping,
    total,
    couponCode,
    discount,
    shippingOptions,
    selectedShippingOption,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    applyCoupon,
    removeCoupon,
    calculateShipping,
    selectShippingOption
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