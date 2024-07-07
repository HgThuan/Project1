import React, { useState } from 'react'
import './CSS/loginsignup.css'
 
const LoginSignup = () => {
  const [state,setState] = useState("Login");
  const [formData, setFormData] = useState({
    username:"",
    password:"",
    email:"",
  });
 
  const login = async () =>{
      console.log("Login Function Executed",formData);
      let responseData;
    try {
      const response = await fetch('http://localhost:4000/login', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      responseData = await response.json();
      console.log("Signup Response Data:", responseData);
      if (responseData.success) {
        localStorage.setItem('auth-token', responseData.token);
        window.location.replace("/");
      } else {
        alert("Credentials Wrong")
        console.error("Signup Failed:", responseData.error);
      }
    } catch (error) {
      console.error("Signup Error:", error);
    }
 
     
  }
  const signup = async () => {
    console.log("SignUp Function Executed", formData);
    let responseData;
    try {
      const response = await fetch('http://localhost:4000/signup', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      responseData = await response.json();
      console.log("Signup Response Data:", responseData);
      if (responseData.success) {
        localStorage.setItem('auth-token', responseData.token);
        window.location.replace("/");
      } else {
        alert("User aleready Exist")
        console.error("Signup Failed:", responseData.error);
      }
    } catch (error) {
      console.error("Signup Error:", error);
    }
  }
 
 
 
 
  const changeHandler = (e)=>{
    setFormData({...formData,[e.target.name]:e.target.value})
 
   
  }
 
 
  return (
    <div className='loginsignup'>
      <div className="loginsignup-container">
        <h1>{state}</h1>
        <div className="loginsignup-fields">
         {state==="Sign Up"?<input name='username' value={formData.username} onChange={changeHandler} type="text"  placeholder='Your Name'/>:<></>}
          <input name='email' value={formData.email} onChange={changeHandler} type="Email"  placeholder='Email Address'/>
          <input name='password' value={formData.password} onChange={changeHandler} type="password" placeholder='Password' />
        </div>
        <button onClick={()=>{state==="Login"?login():signup()}}>Continue</button>
        {state==="Sign Up"? <p className='loginsignup-login'>Aleready Have an Account ?<span onClick={()=>{setState("Login")}}>Login Here</span> </p>
        : <p className='loginsignup-login'>Create an Account ?<span onClick={()=>{setState("Sign Up")}}>Click Here</span> </p>}
       
       
        <div className="loginsignup-agree">
          <input type="checkbox"name='' id='' />
          <p>By Continuing i agree to the terms of use & privacy policy</p>
        </div>
      </div>
    </div>
  )
}
 
export default LoginSignup