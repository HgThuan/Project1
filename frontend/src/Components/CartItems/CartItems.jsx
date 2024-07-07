import React, { useContext } from 'react';
import { ShopContext } from '../../Context/ShopContext.jsx';
import removeicon from '../Assets/cart_cross_icon.png';
import './CartItems.css';

const CartItems = () => {
    const { getTotalCartAmount, allproduct, cartItems, addToCart, removeFromCart } = useContext(ShopContext);

    const handleIncrement = (itemId) => {
        addToCart(itemId);
    };

    const handleDecrement = (itemId) => {
        removeFromCart(itemId);
    };

    return (
        <div className="cartItems">
            <div className="cartItems-format-main">
                <p>Products</p>
                <p>Title</p>
                <p>Price</p>
                <p>Quantity</p>
                <p>Total</p>
                <p>Remove</p>
            </div>
            <hr />
            {allproduct.map((e) => {
                if (cartItems[e.id] > 0) {
                    return (
                        <div key={e.id}>
                            <div className="cartItems-format cartItems-format-main">
                                <img src={e.image} alt="" className="cartItems-product-icon" />
                                <p>{e.name}</p>
                                <p>₹{e.new_price}</p>
                                <div className='cartItems-quantity'>
                                    <button onClick={() => handleDecrement(e.id)}>-</button>
                                    <span>{cartItems[e.id]}</span>
                                    <button onClick={() => handleIncrement(e.id)}>+</button>
                                </div>
                                <p>₹{e.new_price * cartItems[e.id]}</p>
                                <img className='cartItems-remove-icon' src={removeicon} alt="Remove" onClick={() => removeFromCart(e.id)} />
                            </div>
                            <hr />
                        </div>
                    );
                }
                return null;
            })}
            <div className="cartItems-down">
                <div className="cartItems-total">
                    <h1>Total Carts</h1>
                    <div>
                        <div className="cartItems-total-item">
                            <p>Subtotal</p>
                            <p>₹{getTotalCartAmount()}</p>
                        </div>
                        <hr />
                        <div className="cartItems-total-item">
                            <p>Shipping Fee</p>
                            <p>Free</p>
                        </div>
                        <hr />
                        <div className="cartItems-total-item">
                            <p>Total</p>
                            <p>₹{getTotalCartAmount()}</p>
                        </div>
                    </div>
                    <button>PROCEED TO CHECKOUT</button>
                </div>
                <div className="cartItems-promocode">
                    <p>If you have promo code, enter it here..</p>
                    <div className="cartItems-promobox">
                        <input type="text" placeholder="promo code" />
                        <button>Submit</button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default CartItems;
