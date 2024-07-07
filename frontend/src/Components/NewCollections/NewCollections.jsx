import {React,useState,useEffect} from 'react'
import './NewCollections.css'
// import newcollections from '../Assets/new_collections.js'

import Item from '../Item/Item.jsx'
// import { useEffect, useState } from 'react'

const NewCollections = () => {
  const [newcollections,set_newcollections]=useState([]);

  useEffect(()=>
    {
        fetch('http://localhost:4000/newcollections')
        .then((response)=>response.json())
        .then((data)=>set_newcollections(data))
  
  
    },[])
  return (
    <div className='new-collections'>
        <h1>NEW COLLECTIONS</h1>
        <hr />
        <div className="collections">
            {newcollections.map((item,i)=>{
                return<Item key={i} id={item.id} name={item.name} image={item.image} new_price={item.new_price} old_price={item.old_price}/>
            })}

        </div>
    </div>
  )
}

export default NewCollections