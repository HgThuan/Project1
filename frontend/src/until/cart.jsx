// src/until/cart.jsx
import React, { useEffect, useState, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useUser } from "./userContext";
import * as cartApi from "./cartApi";

/* ========================================
   1. Helper: Format tiền VND
   ======================================== */
const formatVND = (num) => {
  if (!num) return "0đ";
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".") + "đ";
};

/* ========================================
   2. Toast Notification Component
   ======================================== */
const Toast = ({ message, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="cart-toast">
      <i className="fa-solid fa-circle-check"></i>
      <span>{message}</span>
    </div>
  );
};

/* ========================================
   3. Core: Cart logic (localStorage + Backend)
   ======================================== */
const CART_KEY = "cart";

const getLocalCart = () => JSON.parse(localStorage.getItem(CART_KEY) || "[]");

const saveLocalCart = (list) => {
  localStorage.setItem(CART_KEY, JSON.stringify(list));
  window.dispatchEvent(new CustomEvent("cartUpdated"));
};

/**
 * Add to cart - handles both guest (localStorage) and logged-in users (backend)
 */
export const addToCart = async (item, user = null) => {
  try {
    // For logged-in users, add to backend
    if (user && user.id) {
      await cartApi.addItemToBackend(user.id, item);
      window.dispatchEvent(new CustomEvent("cartUpdated"));
      return { success: true, message: "Đã thêm sản phẩm vào giỏ hàng" };
    }

    // For guests, use localStorage
    const list = getLocalCart();
    const existing = list.find(
      (x) => x.id === item.id && x.color === item.color && x.size === item.size
    );

    if (existing) {
      existing.quantity += 1;
    } else {
      list.push({ ...item, quantity: 1 });
    }

    saveLocalCart(list);
    return { success: true, message: "Đã thêm sản phẩm vào giỏ hàng" };
  } catch (error) {
    console.error("Error adding to cart:", error);
    return { success: false, message: "Không thể thêm sản phẩm vào giỏ hàng" };
  }
};

/**
 * Remove from cart
 */
export const removeFromCart = async (itemId, size, color, user = null) => {
  try {
    // For logged-in users, remove from backend
    if (user && user.id && itemId.length === 24) { // MongoDB ObjectId length check
      await cartApi.removeItemFromBackend(itemId);
      window.dispatchEvent(new CustomEvent("cartUpdated"));
      return { success: true };
    }

    // For guests, use localStorage
    const list = getLocalCart().filter(
      (x) => !(x.id === itemId && x.size === size && x.color === color)
    );
    saveLocalCart(list);
    return { success: true };
  } catch (error) {
    console.error("Error removing from cart:", error);
    return { success: false };
  }
};

/**
 * Update quantity
 */
export const updateQuantity = async (itemId, newQuantity, user = null) => {
  try {
    if (newQuantity < 1) return { success: false };

    // For logged-in users, update backend
    if (user && user.id && itemId.length === 24) { // MongoDB ObjectId
      await cartApi.updateCartItemQuantity(itemId, newQuantity);
      window.dispatchEvent(new CustomEvent("cartUpdated"));
      return { success: true };
    }

    // For guests, update localStorage (itemId format: "productId-color-size")
    const list = getLocalCart();
    const item = list.find(x => `${x.id}-${x.color}-${x.size}` === itemId);

    if (item) {
      item.quantity = newQuantity;
      saveLocalCart(list);
      return { success: true };
    }

    return { success: false };
  } catch (error) {
    console.error("Error updating quantity:", error);
    return { success: false };
  }
};

/* ========================================
   4. MiniCart Component
   ======================================== */
export const MiniCart = () => {
  const { user } = useUser();
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadCart = useCallback(async () => {
    setLoading(true);
    try {
      if (user && user.id) {
        // Fetch from backend for logged-in users
        const response = await cartApi.fetchCart(user.id);
        if (response.success) {
          // Convert backend format to frontend format
          const items = response.cart.map(item => ({
            id: item._id, // MongoDB ID for updates/deletes
            productId: item.ma_san_pham,
            name: item.ten_san_pham,
            img: item.anh_sanpham,
            color: item.mau_sac,
            size: item.kich_co,
            price: item.gia,
            quantity: item.so_luong
          }));
          setCartItems(items);
        }
      } else {
        // Use localStorage for guests
        const localCart = getLocalCart();
        setCartItems(localCart.map(item => ({
          id: `${item.id}-${item.color}-${item.size}`, // Composite key
          productId: item.id,
          name: item.name,
          img: item.img,
          color: item.color,
          size: item.size,
          price: item.price,
          quantity: item.quantity
        })));
      }
    } catch (error) {
      console.error("Error loading cart:", error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadCart();
    const handleCartUpdate = () => loadCart();
    window.addEventListener("cartUpdated", handleCartUpdate);
    return () => window.removeEventListener("cartUpdated", handleCartUpdate);
  }, [loadCart]);

  const handleIncrease = async (item) => {
    await updateQuantity(item.id, item.quantity + 1, user);
    loadCart();
  };

  const handleDecrease = async (item) => {
    if (item.quantity > 1) {
      await updateQuantity(item.id, item.quantity - 1, user);
      loadCart();
    }
  };

  const handleRemove = async (item) => {
    await removeFromCart(item.id, item.size, item.color, user);
    loadCart();
  };

  const calculateSubtotal = () => {
    return cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  };

  const goToCart = () => {
    navigate("/cart");
    window.dispatchEvent(new CustomEvent("closeCart")); // Signal to close dropdown
  };

  if (loading) {
    return (
      <div className="mini-cart">
        <div className="mini-cart__header">
          <h3>Giỏ hàng của bạn</h3>
        </div>
        <div className="mini-cart__loading">
          <i className="fa-solid fa-spinner fa-spin"></i>
          <p>Đang tải...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mini-cart">
      <div className="mini-cart__header">
        <h3>Giỏ hàng của bạn</h3>
        <span className="mini-cart__count">
          {cartItems.reduce((sum, item) => sum + item.quantity, 0)} sản phẩm
        </span>
      </div>

      <div className="mini-cart__body">
        {cartItems.length === 0 ? (
          <div className="mini-cart__empty">
            <i className="fa-solid fa-bag-shopping fa-3x"></i>
            <p>Giỏ hàng trống</p>
            <Link to="/product" className="mini-cart__shop-now">
              Mua sắm ngay
            </Link>
          </div>
        ) : (
          <ul className="mini-cart__list">
            {cartItems.map((item) => (
              <li key={item.id} className="mini-cart__item">
                <div className="mini-cart__item-img">
                  <img src={item.img} alt={item.name} />
                </div>
                <div className="mini-cart__item-info">
                  <h4 className="mini-cart__item-name">{item.name}</h4>
                  <p className="mini-cart__item-variant">
                    {item.color} / {item.size}
                  </p>
                  <p className="mini-cart__item-price">{formatVND(item.price)}</p>

                  <div className="mini-cart__item-controls">
                    <div className="mini-cart__quantity">
                      <button
                        className="mini-cart__qty-btn"
                        onClick={() => handleDecrease(item)}
                        aria-label="Decrease quantity"
                      >
                        -
                      </button>
                      <span className="mini-cart__qty-value">{item.quantity}</span>
                      <button
                        className="mini-cart__qty-btn"
                        onClick={() => handleIncrease(item)}
                        aria-label="Increase quantity"
                      >
                        +
                      </button>
                    </div>
                    <button
                      className="mini-cart__remove"
                      onClick={() => handleRemove(item)}
                      aria-label="Remove item"
                    >
                      <i className="fa-solid fa-trash"></i>
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {cartItems.length > 0 && (
        <div className="mini-cart__footer">
          <div className="mini-cart__subtotal">
            <span>Tạm tính:</span>
            <span className="mini-cart__subtotal-amount">
              {formatVND(calculateSubtotal())}
            </span>
          </div>
          <button className="mini-cart__checkout-btn" onClick={goToCart}>
            Xem giỏ hàng
          </button>
        </div>
      )}
    </div>
  );
};

/* ========================================
   5. AddProduct Hook (gắn sự kiện thêm giỏ)
   ======================================== */
export default function AddProduct() {
  const { user } = useUser();
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  const showSuccessToast = (message) => {
    setToastMessage(message);
    setShowToast(true);
  };

  useEffect(() => {
    // Chi tiết sản phẩm
    const detailBtn = document.querySelector(".btn-addCart");
    const handleDetail = async () => {
      if (!detailBtn || detailBtn.textContent !== "Thêm vào giỏ hàng") return;

      const name = document.querySelector(".content__heading")?.textContent?.trim();
      const img = document.querySelector(".product-img__option-item.active img")?.src;
      const color = document.querySelector(".content__color-heading b")?.textContent?.trim();
      const size = document.querySelector(".btn-size.active")?.textContent?.trim();
      const priceStr = document.querySelector(".content__price")?.textContent?.trim();
      const price = priceStr ? parseInt(priceStr.replace(/[đ.]/g, ""), 10) : 0;
      const id = window.location.pathname.split("/").pop();

      if (name && img && color && size && price && id) {
        const result = await addToCart({ id, name, img, color, size, price }, user);
        if (result.success) {
          showSuccessToast(result.message);
        }
      }
    };
    detailBtn?.addEventListener("click", handleDetail);

    // Danh sách sản phẩm (nút size Quick Add)
    const sizeBtns = document.querySelectorAll(".btn--size");
    const handleSize = async (e) => {
      const btn = e.currentTarget;
      const product = btn.closest(".product");
      if (!product) return;

      const id = product.id;
      const name = product.querySelector(".product-name")?.textContent?.trim();
      const img = product.querySelector(".product-img-1")?.src;
      const colorEl = product.querySelector(".product-content__option-item-wrap.active span");
      const color = colorEl?.getAttribute("data") || "";
      const size = btn.textContent?.trim();
      const priceStr = product.querySelector(".product-price")?.textContent?.trim();
      const price = priceStr ? parseInt(priceStr.replace(/[đ.]/g, ""), 10) : 0;

      if (id && name && img && color && size && price) {
        const result = await addToCart({ id, name, img, color, size, price }, user);
        if (result.success) {
          showSuccessToast(result.message);
          // Add visual feedback to button
          btn.style.transform = "scale(0.95)";
          setTimeout(() => {
            btn.style.transform = "scale(1)";
          }, 200);
        }
      }
    };
    sizeBtns.forEach((btn) => btn.addEventListener("click", handleSize));

    return () => {
      detailBtn?.removeEventListener("click", handleDetail);
      sizeBtns.forEach((btn) => btn.removeEventListener("click", handleSize));
    };
  }, [user]);

  return (
    <>
      {showToast && (
        <Toast message={toastMessage} onClose={() => setShowToast(false)} />
      )}
    </>
  );
}