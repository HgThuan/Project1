import React, { createContext, useEffect, useState } from 'react';
// import allproduct from '../Components/Assets/allproduct.js';

export const ShopContext = createContext(null);



const getDefaultCart = () => {
    let cart = {};
    for (let index = 0; index < 300+1; index++) {
        cart[index] = 0;
    }
    return cart;
}

const ShopContextProvider = (props) => {
    const [allproduct,setAllProduct]=useState([]);
    const [cartItems, setCartItems] = useState(getDefaultCart());

    useEffect(()=>
    {
        fetch('http://localhost:4000/allproducts')
        .then((response)=>response.json())
        .then((data)=>setAllProduct(data))


        if(localStorage.getItem('auth-token'))
            {
                fetch('http://localhost:4000/getcarts',
                    {
                        method:'POST',
                        headers:
                        {
                            Accept:'application/form-data',
                            'auth-token':`${localStorage.getItem('auth-token')}`,
                            'Content-Type':'application/json'
                        },
                        body:"",
                    }).then((response)=>response.json())
                    .then((data)=>setCartItems(data));
                
            }


    },[])

    const addToCart = (itemId) => {
        setCartItems((prev) => ({ ...prev, [itemId]: prev[itemId] + 1 }));
        if(localStorage.getItem('auth-token'))
            {
                fetch('http://localhost:4000/addtocart',{
                    method:'POST',
                    headers:
                    {
                        Accept:'application/form-data',
                        'auth-token':`${localStorage.getItem('auth-token')}`,
                        'Content-Type':'application/json',

                    },
                    body:JSON.stringify({"item":itemId}),

                })
                .then((response)=>response.json())
                .then((data)=>console.log(data));
            }
    }

    const removeFromCart = (itemId) => {
        if (cartItems[itemId] > 0) {
            setCartItems((prev) => ({ ...prev, [itemId]: prev[itemId] - 1 }));
            if(localStorage.getItem('auth-token'))
                {
                    fetch('http://localhost:4000/removetocart',{
                        method:'POST',
                        headers:
                        {
                            Accept:'application/form-data',
                            'auth-token':`${localStorage.getItem('auth-token')}`,
                            'Content-Type':'application/json',
    
                        },
                        body:JSON.stringify({"item":itemId}),
    
                    })
                    .then((response)=>response.json())
                    .then((data)=>console.log(data));
                }
        }
    }

 
    const getTotalCartAmount=()=>
        {
            let totalAmount=0;
            for(const item in cartItems)
                {
                    if(cartItems[item]>0)
                        {
                            let iteminfo=allproduct.find((product)=>product.id===Number(item));
                            totalAmount += iteminfo.new_price*cartItems[item];
                        }
                     
                }
                return totalAmount;
        }

        const getTotalCartItems=()=>
            {
                let totalitem=0;
                for(const item in cartItems)
                    {
                        if(cartItems[item]>0)
                            {
                                totalitem+=cartItems[item];
                            }
                    }
                    return totalitem;
            }

    const contextValue = {getTotalCartItems, getTotalCartAmount,allproduct, cartItems, addToCart, removeFromCart };

    return (
        <ShopContext.Provider value={contextValue}>
            {props.children}
        </ShopContext.Provider>
    );
}

export default ShopContextProvider;
