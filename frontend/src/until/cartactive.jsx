import { useEffect } from "react";



export function LoadData() {
  let list = [];
  try {
    list = JSON.parse(localStorage.getItem("cart") || "[]");
  } catch (e) {
    console.warn("Failed to parse cart data, resetting to empty", e);
    localStorage.setItem("cart", "[]");
  }
  var str = "";
  var total = 0;
  var tamtinh = 0;
  for (let x of list) {
    // Sửa 'x of list' thành 'let x of list'
    total += x.price * x.quantity - x.discount;
    tamtinh += x.price * x.quantity;
    str += `<div class="list-product__item">
      <div class="list-product__item-img">
        <img src="${x.img}" alt="">
      </div>
      <div class="list-product__item-content">
        <div class="list-product__item-name">${x.name}</div>
        <div class="list-product__item-type">${x.color}/${x.size}</div>
        <div style="display:flex;justify-content: flex-start; margin: 28px 0 6px;" class="">                         
        </div>
        <div style="display:flex;justify-content: space-between;align-items: center;">  
          <div class="quantity-product">
            <button onclick="Giam('${x.id}')">
              <svg data-v-0d8807a2="" width="16" height="16" xmlns="http://www.w3.org/2000/svg"><g data-v-0d8807a2=""><line data-v-0d8807a2="" stroke-width="1.5" id="svg_6" y2="8" x2="10" y1="8" x1="5" stroke="#000000" fill="none"></line></g></svg>
            </button>
            <span>${x.quantity}</span>
            <button onclick="Tang('${x.id}')">
              <svg data-v-0d8807a2="" width="16" height="16" xmlns="http://www.w3.org/2000/svg"><g data-v-0d8807a2=""><line data-v-0d8807a2="" stroke-width="1.5" y2="8" x2="12.9695" y1="8" x1="3.0305" stroke="#000000" fill="none"></line> <line data-v-0d8807a2="" stroke-width="1.5" transform="rotate(90, 8, 8)" y2="8" x2="13" y1="8" x1="3" stroke="#000000" fill="none"></line></g></svg>
            </button>
          </div>
          <div class="product-price">
            <div class="product-new-price">${convertVND(x.price)}</div>
          </div>
        </div>
        <div class="list-product__close" onclick="Xoa('${x.id}','${x.size
      }','${x.color}')">
          <i class="fa-solid fa-xmark"></i>
        </div>
      </div>
    </div>`;
  }
  if (total < 200) {
    total += 25000;
    const deleverCost = document.querySelector(".delever-cost");
    if (deleverCost) deleverCost.textContent = "25.000đ";
  } else {
    const deleverCost = document.querySelector(".delever-cost");
    if (deleverCost) deleverCost.textContent = "Miễn phí";
  }
  const listProductInner = document.querySelector(".list-product__inner");
  if (listProductInner) listProductInner.innerHTML = str;

  const totalPrice = document.querySelector(".total__price");
  if (totalPrice) totalPrice.textContent = convertVND(total);

  const tamTinh = document.querySelector(".tamTinh");
  if (tamTinh) tamTinh.textContent = convertVND(tamtinh);

  const btnPayPrice = document.querySelector(".btn-pay--price");
  if (btnPayPrice) btnPayPrice.textContent = convertVND(total);

  const btnPay = document.querySelector(".btn-pay");
  if (list.length === 0 && btnPay) {
    btnPay.style.opacity = "0.5";
    btnPay.style.pointerEvents = "none";
  } else if (btnPay) {
    btnPay.style.opacity = "1";
    btnPay.style.pointerEvents = "auto";
  }
  loadMiniCart();
}

export function loadMiniCart() {
  // lấy dữ liệu trên lc trả thành mảng nếu có
  let list = [];
  try {
    list = JSON.parse(localStorage.getItem("cart") || "[]");
  } catch (e) {
    console.warn("Failed to parse cart data in miniCart, resetting to empty", e);
    localStorage.setItem("cart", "[]");
  }
  var str = "";
  var length = list.length;
  // kiểm tra slg
  if (length > 0) {
    // for ra thành các list
    for (let x of list) {
      str += `<li class="mini-cart__item">
                        <a class="mini-cart__link">
                        <div class="mini-cart__link-img">
                            <img src="${x.img}" alt="">
                        </div>
                        <div class="mini-cart__link-content">
                            <p class="mini-cart__link-content-name">${x.name
        }</p>
                            <p class="mini-cart__link-content-describe">màu ${x.color
        } ${x.size}</p>
                            <p class="mini-cart__link-content-price">${convertVND(
          x.price
        )}</p>
                            <p class="mini-cart__link-content-quantity">x${x.quantity
        }</p>
                            <span class="mini-cart__item-cancel" onclick="Xoa('${x.id
        }','${x.size}','${x.color}')">✕</span>
            
                        </div>
                        </a>
                    </li>`;
    }
    // load nội dung lên mini card
    const miniCartList = document.querySelector(".mini-cart__list");
    if (miniCartList) miniCartList.innerHTML = str;

    const cartNotify = document.querySelector(".header__actions-cart-notify");
    if (cartNotify) cartNotify.textContent = `${length}`;

    const addedProduct = document.querySelector(".added-product");
    if (addedProduct) addedProduct.textContent = `${length}`;
  } else {
    const miniCartList = document.querySelector(".mini-cart__list");
    if (miniCartList) miniCartList.innerHTML = '<p class="cart-empty">Không có sản phẩm</p>';

    const cartNotify = document.querySelector(".header__actions-cart-notify");
    if (cartNotify) cartNotify.textContent = "0";

    const addedProduct = document.querySelector(".added-product");
    if (addedProduct) addedProduct.textContent = "0";
  }
}

function convertVND(number) {
  if (number === 0) {
    return "0đ";
  }
  // Chuyển dạng số thành chuỗi
  var str = JSON.stringify(number);
  var result = "";
  var length = str.length;
  var count = 0;
  for (var i = length - 1; i >= 0; --i) {
    if (count % 3 === 0 && count !== 0) {
      result = str[i] + "." + result;
    } else {
      result = str[i] + result;
    }
    count++;
  }
  return result + "đ";
}

function ActiveCart() {

  useEffect(() => {

    var payments = document.querySelectorAll('.payments-item')
    var paymentsInput = document.querySelector('.payments-item input')
    document.querySelector('.payments-item.active .check').checked = true;

    payments.forEach((payment, index) => {
      payment.onclick = () => {
        document.querySelector('.payments-item.active').classList.remove('active');
        payment.classList.add('active');
        document.querySelector('.payments-item.active .check').checked = true;//khi check vào item thì sẽ check vào input
      }
    })
    // lặp qua và gắn onclick
    const paymentItems = document.querySelectorAll(".payments-item");
    paymentItems.forEach(item => {
      item.addEventListener("click", () => {
        const checks = document.querySelectorAll(".check");
        checks.forEach(check => {
          if (check.checked) {
            const typePayment = document.querySelector(".type-payment");
            if (typePayment) typePayment.textContent = check.value;
          }
        });
      });
    });
    let list = [];
    try {
      list = JSON.parse(localStorage.getItem("cart") || "[]");
    } catch (e) {
      console.warn("Failed to parse cart data in ActiveCart, resetting to empty", e);
      localStorage.setItem("cart", "[]");
    }

    LoadData();

    loadMiniCart();

    // Cập nhật giỏ hàng
    function updateCart() {
      localStorage.setItem("cart", JSON.stringify(list));
    }

    // xóa sản phẩm dựa trên id
    function Xoa(id, size, color) {
      var index = list.findIndex(
        (x) => x.id === id && x.size === size && x.color === color
      );
      if (index >= 0) {
        // Nếu sp tồn tại thì xóa
        list.splice(index, 1);
      }
      updateCart();
      loadMiniCart();
      LoadData();
    }

    /*Tăng số lượng sản phẩm*/
    function Tang(id) {
      var index = list.findIndex((x) => x.id === id);
      if (index >= 0) {
        list[index].quantity += 1;
      }
      updateCart();
      LoadData();
      loadMiniCart();
    }

    /*Giảm số lượng sản phẩm*/
    function Giam(id) {
      var index = list.findIndex((x) => x.id === id);
      if (index >= 0 && list[index].quantity > 1) {
        list[index].quantity -= 1;
      }
      updateCart();
      LoadData();
      loadMiniCart();
    }

    window.Xoa = Xoa;
    window.Tang = Tang;
    window.Giam = Giam;
  }, []);
}

export default ActiveCart;
