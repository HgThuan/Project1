import React, { useContext } from 'react'
import './ProductDisplay.css'
import staricon from '../Assets/star_icon.png'
import stardullicon from '../Assets/star_dull_icon.png'
import { ShopContext } from '../../Context/ShopContext'

const ProductDisplay = (props) => {

    const {product} = props;
    const {addToCart}=useContext(ShopContext)
 

    return (
        <div className='productdisplay'>
            <div className="productdisplay-left">
                <div className="productdisplay-img-list">
                    <img src={product.image} alt="" />
                    <img src={product.image} alt="" />
                    <img src={product.image} alt="" />
                    <img src={product.image} alt="" />
                </div>
                <div className="productdisplay-img">
                    <img className='productdisplay-main-image' src={product.image} alt="" />
                    {/* <div className="zoom-icon">
                        <img src={product.image} alt="Zoom Icon" />
                    </div> */}
                </div>
            </div>
            <div className="productdisplay-right">
                <h1>{product.name}</h1>
                <div className="productdisplay-right-star">
                    <img src={staricon} alt="" />
                    <img src={staricon} alt="" />
                    <img src={staricon} alt="" />
                    <img src={staricon} alt="" />
                    <img src={stardullicon} alt="" />
                    <p>(122)</p>
                </div>
                <div className="productdisplay-right-prices">
                    <div className="productdisplay-right-old">
                        ₹{product.old_price}
                    </div>
                    <div className="productdisplay-right-new">
                        ₹{product.new_price}
                    </div>
                </div>
                <div className="productdisplay-right-description">
                Nâng cao phong cách của bạn một cách dễ dàng . Sản phẩm chế tác từ [Vật liệu vải] cao cấp, nó mang lại sự thoải mái cả ngày và một cái nhìn bóng bẩy. Đa năng cho bất kỳ dịp nào, từ công việc đến cuối tuần
                </div>
                <div className="productdisplay-right-size">
                    <h1>Select Size</h1>
                    <div className="productdisplay-right-sizes">
                        <div>S</div>
                        <div>M</div>
                        <div>L</div>
                        <div>XL</div>
                        <div>XXL</div>
                        <div>XXXL</div>
                    </div>
                </div>
                <button onClick={()=>{addToCart(product.id)}}>ADD TO CART</button>
                <p className="productdisplay-right-category"><span>Category :</span>Women , T-Shirt , Crop-Top</p>
                <p className="productdisplay-right-category"><span>Tags :</span>Modern , Latest</p>
            </div>
        </div>



    )
}

export default ProductDisplay