import React from 'react'
import './Breadcrums.css'
import arrowicon from '../Assets/breadcrum_arrow.png'

const Breadcrums = (props) => {
    const {product}=props;
  return (
    <div className='breadcrums'>
        HOME <img src={arrowicon} alt="" /> SHOP <img src={arrowicon} alt="" />{product.category}<img src={arrowicon} alt="" />{product.name}
    </div>
  )
}

export default Breadcrums