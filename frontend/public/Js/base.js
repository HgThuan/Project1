// window.onload = function () {
//     var heightHeader = document.querySelector(".site-header").offsetHeight;
//     document.querySelector(".all-product-container").style.marginTop = heightHeader + "px";

//     document.querySelectorAll('.btn--size').forEach(function (btn) {
//         btn.addEventListener('click', function () {
//             var id = btn.closest('.product').id;
//             var name = document.getElementById(id).querySelector('.product-name').textContent;
//             var img = document.getElementById(id).querySelector('.product-img-1').getAttribute('src');
//             var color = document.getElementById(id).querySelector('.product-content__option-item-wrap.active span').dataset.color;
//             var size = btn.textContent;
//             var price = convertToNumber(document.getElementById(id).querySelector('.product-price').textContent);
//             var item = {
//                 id: id,
//                 name: name,
//                 img: img,
//                 color: color,
//                 size: size,
//                 price: price,
//                 quantity: 1,
//                 discount: 0
//             };
//             addToCart(item);
//         });
//     });

//     document.querySelector('.btn-addCart').addEventListener('click', function () {
//         if (this.textContent === "Thêm vào giỏ hàng") {
//             var name = document.querySelector(".content__heading").textContent;
//             var img = document.querySelector(".product-img__option-item.active img").getAttribute("src");
//             var color = document.querySelector(".content__color-heading b").textContent;
//             var size = document.querySelector(".btn-size.active").textContent;
//             var price = convertToNumber(document.querySelector(".content__price").textContent);
//             var quantity = JSON.parse(document.querySelector(".product-single__actions .quantity span").textContent);
//             var item = {
//                 id: "detail1",
//                 name: name,
//                 img: img,
//                 color: color,
//                 size: size,
//                 price: price,
//                 quantity: quantity,
//                 discount: 0
//             };
//             addToCart(item);
//         }
//     });

//     function convertVND(number) {
//         if (number == 0) {
//             return '0đ';
//         }
//         var str = JSON.stringify(number);
//         var result = "";
//         var length = str.length;
//         var count = 0;
//         for (var i = length - 1; i >= 0; --i) {
//             if (count % 3 == 0 && count != 0) {
//                 result = str[i] + '.' + result;
//             } else {
//                 result = str[i] + result;
//             }
//             count++;
//         }
//         return result + 'đ';
//     }

//     function convertToNumber(price) {
//         var result = "";
//         for (var i = 0; i < price.length; i++) {
//             if (price[i] != "." && price[i] != "đ") {
//                 result += price[i];
//             }
//         }
//         return JSON.parse(result);
//     }

//     function addToCart(item) {
//         var list;
//         if (localStorage.getItem('cart') == null) {
//             list = [item];
//         } else {
//             list = JSON.parse(localStorage.getItem('cart')) || [];
//             var check = true;
//             for (var _i = 0, list_1 = list; _i < list_1.length; _i++) {
//                 var x = list_1[_i];
//                 if (x.id == item.id && x.color == item.color && x.size == item.size) {
//                     x.quantity += 1;
//                     check = false;
//                     break;
//                 }
//             }
//             if (check) {
//                 list.push(item);
//             }
//         }
//         localStorage.setItem('cart', JSON.stringify(list));
//         loadMiniCart();
//         displayNotify(item);
//     }

//     function loadMiniCart() {
//         var list = JSON.parse(localStorage.getItem('cart')) || [];
//         var str = "";
//         var length = list.length;
//         if (length > 0) {
//             for (var _i = 0, list_2 = list; _i < list_2.length; _i++) {
//                 var x = list_2[_i];
//                 str += "<li class=\"mini-cart__item\">\n                <a class=\"mini-cart__link\">\n                <div class=\"mini-cart__link-img\">\n                    <img src=\"" + x.img + "\" alt=\"\">\n                </div>\n                <div class=\"mini-cart__link-content\">\n                    <p class=\"mini-cart__link-content-name\">" + x.name + "</p>\n                    <p class=\"mini-cart__link-content-describe\">m\xE0u " + x.color + " " + x.size + "</p>\n                    <p class=\"mini-cart__link-content-price\">" + convertVND(x.price) + "</p>\n                    <p class=\"mini-cart__link-content-quantity\">x" + x.quantity + "</p>\n                    <span class=\"mini-cart__item-cancel\" onclick=\"XoaMiniCart('" + x.id + "','" + x.size + "','" + x.color + "')\">\u2715</span>\n\n                </div>\n                </a>\n            </li>";
//             }
//             document.querySelector(".mini-cart__list").innerHTML = str;
//             document.querySelector(".header__actions-cart-notify").textContent = length;
//             document.querySelector(".added-product").textContent = length;
//         } else {
//             document.querySelector(".mini-cart__list").innerHTML = '<p class="cart-empty">Không có sản phẩm</p>';
//             document.querySelector(".header__actions-cart-notify").textContent = "0";
//             document.querySelector(".added-product").textContent = "0";
//         }
//     }
//     loadMiniCart();

//     function XoaMiniCart(id, size, color) {
//         var list = JSON.parse(localStorage.getItem('cart')) || [];
//         var index = list.findIndex(function (x) {
//             return x.id == id && x.size == size && x.color == color;
//         });
//         if (index >= 0) {
//             list.splice(index, 1);
//         }
//         localStorage.setItem('cart', JSON.stringify(list));
//         loadMiniCart();
//     }

//     function displayNotify(item) {
//         document.querySelector(".notify-added-img img").src = "" + item.img;
//         document.querySelector(".notify-added__content-name").textContent = "" + item.name;
//         document.querySelector(".notify-added__color").textContent = "" + item.color;
//         document.querySelector(".notify-added__size").textContent = "" + item.size;
//         document.querySelector(".notify-added__content-price").textContent = "" + convertVND(item.price);
//         document.querySelector(".notify-added").style.transform = "translateX(0px)";
//         setTimeout(function () {
//             document.querySelector(".notify-added").style.transform = "translateX(calc(100% + 20px))";
//         }, 3000);
//     }
// };
