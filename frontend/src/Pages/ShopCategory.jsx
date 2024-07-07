import React, { useContext } from 'react'
import { ShopContext } from '../Context/ShopContext'
import './CSS/ShopCategory.css'
import Item from '../Components/Item/Item.jsx'
import dropdownicon from '../Components/Assets/dropdown_icon.png'


const ShopCategory = (props) => {
  const { allproduct } = useContext(ShopContext);
  return (
    <div className='shop-category'>
      <img className='shopcategory-banner' src={props.banner} alt="" />
      <div className="shopcategory-indexsort">
        <p>
          <span>Showing 1-5 </span> out of 13 products
        </p>
        <div className="shopcategory-sort">
          Sort by <img src={dropdownicon} alt="" />
        </div>
      </div>
      <div className="shopcategory-products">
        {allproduct.map((item, i) => {

          if (props.category === item.category) {
            return <Item key={i} id={item.id} name={item.name} image={item.image} new_price={item.new_price} old_price={item.old_price} />
          } else {
            return null;
          }
        })}

      </div>
      <div className="shopcategory-loadmore">
        Explore more
      </div>

    </div>
  )
}

export default ShopCategory