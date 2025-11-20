// src/until/cart.jsx
import { useEffect, useRef } from "react";

/* ========================================
   1. Helper: Format tiền VND
   ======================================== */
const formatVND = (num) => {
  if (!num) return "0đ";
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".") + "đ";
};

/* ========================================
   2. Core: Cart logic (localStorage)
   ======================================== */
const CART_KEY = "cart";

const getCart = () => JSON.parse(localStorage.getItem(CART_KEY) || "[]");

const saveCart = (list) => {
  localStorage.setItem(CART_KEY, JSON.stringify(list));
  window.dispatchEvent(new CustomEvent("cartUpdated"));
};

export const addToCart = (item) => {
  const list = getCart();
  const existing = list.find(
    (x) => x.id === item.id && x.color === item.color && x.size === item.size
  );
  if (existing) {
    existing.quantity += 1;
  } else {
    list.push({ ...item, quantity: 1 });
  }
  saveCart(list);
};

export const removeFromCart = (id, size, color) => {
  const list = getCart().filter(
    (x) => !(x.id === id && x.size === size && x.color === color)
  );
  saveCart(list);
};

/* ========================================
   3. MiniCart Component (List + Badge)
   ======================================== */
export const MiniCart = () => {
  const listRef = useRef(null);
  const badgeRef = useRef(null);

  const renderCart = () => {
    const cart = getCart();
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

    // Cập nhật badge
    if (badgeRef.current) {
      badgeRef.current.textContent = totalItems > 0 ? totalItems : "";
    }

    // Cập nhật danh sách
    if (listRef.current) {
      if (cart.length === 0) {
        listRef.current.innerHTML = '<li class="mini-cart__empty">Giỏ hàng trống</li>';
      } else {
        listRef.current.innerHTML = cart
          .map(
            (item) => `
            <li class="mini-cart__item">
              <a href="/cart" class="mini-cart__link">
                <div class="mini-cart__link-img">
                  <img src="${item.img}" alt="${item.name}" />
                </div>
                <div class="mini-cart__link-content">
                  <p class="mini-cart__link-content-name">${item.name}</p>
                  <p class="mini-cart__link-content-describe">${item.color} ${item.size}</p>
                  <p class="mini-cart__link-content-price">${formatVND(item.price)}</p>
                  <p class="mini-cart__link-content-quantity">x${item.quantity}</p>
                  <span 
                    class="mini-cart__item-cancel" 
                    data-id="${item.id}" 
                    data-size="${item.size}" 
                    data-color="${item.color}"
                  >X</span>
                </div>
              </a>
            </li>`
          )
          .join("");
      }
    }
  };

  useEffect(() => {
    renderCart();
    const handler = () => renderCart();
    window.addEventListener("cartUpdated", handler);
    return () => window.removeEventListener("cartUpdated", handler);
  }, []);

  // Xử lý xóa item
  useEffect(() => {
    const ul = listRef.current;
    if (!ul) return;

    const handleClick = (e) => {
      const target = e.target;
      if (target.classList.contains("mini-cart__item-cancel")) {
        const id = target.dataset.id;
        const size = target.dataset.size;
        const color = target.dataset.color;
        removeFromCart(id, size, color);
      }
    };

    ul.addEventListener("click", handleClick);
    return () => ul.removeEventListener("click", handleClick);
  }, []);

  return (
    <>
      <ul ref={listRef} className="mini-cart__list" />
      <span ref={badgeRef} className="header__actions-cart-notify" />
    </>
  );
};

/* ========================================
   4. AddProduct Hook (gắn sự kiện thêm giỏ)
   ======================================== */
export default function AddProduct() {
  useEffect(() => {
    // Chi tiết sản phẩm
    const detailBtn = document.querySelector(".btn-addCart");
    const handleDetail = () => {
      if (!detailBtn || detailBtn.textContent !== "Thêm vào giỏ hàng") return;

      const name = document.querySelector(".content__heading")?.textContent?.trim();
      const img = document.querySelector(".product-img__option-item.active img")?.src;
      const color = document.querySelector(".content__color-heading b")?.textContent?.trim();
      const size = document.querySelector(".btn-size.active")?.textContent?.trim();
      const priceStr = document.querySelector(".content__price")?.textContent?.trim();
      const price = priceStr ? parseInt(priceStr.replace(/[đ.]/g, ""), 10) : 0;
      const id = window.location.pathname.split("/").pop();

      if (name && img && color && size && price && id) {
        addToCart({ id, name, img, color, size, price });
      }
    };
    detailBtn?.addEventListener("click", handleDetail);

    // Danh sách sản phẩm (nút size)
    const sizeBtns = document.querySelectorAll(".btn--size");
    const handleSize = (e) => {
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
        addToCart({ id, name, img, color, size, price });
      }
    };
    sizeBtns.forEach((btn) => btn.addEventListener("click", handleSize));

    return () => {
      detailBtn?.removeEventListener("click", handleDetail);
      sizeBtns.forEach((btn) => btn.removeEventListener("click", handleSize));
    };
  }, []);

  return null;
}