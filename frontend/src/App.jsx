import React from 'react'
import { Routes, Route, Router } from 'react-router-dom';
import Navbar from './components/Navbar/navbar'
import Footer from './components/Footer/footer'
import Home from './pages/index/Home';
import Cartpage from './pages/cart/Cartpage';
import Product from './pages/product/Product';
import Details from './pages/product/Details';
import Message from './components/Message/message';
import ScrollToTop from './until/scroll';
import Odercart from './pages/cart/Odercart';
import OrderDetail from './pages/cart/OrderDetail';
import OrderTracking from './pages/cart/OrderTracking';
import Wishlist from './pages/wishlist/Wishlist';
import Register from './pages/login/Register';
import Login from './pages/login/Login';
import { UserProvider } from './until/userContext';
import Buyme from './components/Message/buyme';
import StoreLocator from './pages/store/StoreLocator';
import SizeGuide from './pages/product/SizeGuide';
import Profile from './pages/profile/Profile';

export default function App() {
  return (
    <div className='app'>
      <UserProvider>
        <ScrollToTop />
        <Navbar />
        <Routes>
          <Route path='/' element={<Home />} />
          <Route path='/cart' element={<Cartpage />} />
          <Route path='/product' element={<Product />} />
          <Route path='/detail' element={<Details />} />
          <Route path='/DangKy' element={<Register />} />
          <Route path='/DangNhap' element={<Login />} />
          <Route path='/detail/:ma_san_pham' element={<Details />} />
          <Route path='/donhang' element={<Odercart />} />
          <Route path='/order/:ma_don_hang' element={<OrderDetail />} />
          <Route path='/tracking' element={<OrderTracking />} />
          <Route path='/store' element={<StoreLocator />} />
          <Route path='/size-guide' element={<SizeGuide />} />
          <Route path='/wishlist' element={<Wishlist />} />
          <Route path='/profile' element={<Profile />} />
        </Routes>
        <Message />
        <Buyme />
        <Footer />
      </UserProvider>

    </div>
  )
}
