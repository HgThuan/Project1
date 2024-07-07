import React from 'react'
import './Sidebar.css'
import {Link} from 'react-router-dom';
import addproducticon from '../../assets/Product_Cart.svg'
import listproducticon from '../../assets/listicon.svg'
const Sidebar = () => {
  return (
   <div className="sidebar">
    <Link to={'/addproduct'} style={{textDecoration:"none"}}>
        <div className="sidebar-item">
            <img src={addproducticon} alt="" />
            <p>Add Product</p>
        </div>
    </Link>
     <Link to={'/listproduct'} style={{textDecoration:"none"}}>
        <div className="sidebar-item">
            <img src={listproducticon} alt="" />
            <p>Products List</p>
        </div>
    </Link>
    </div>
  )
}

export default Sidebar