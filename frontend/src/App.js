
import './App.css';
import Navbar from './Components/Navbar/Navbar';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Shop from './Pages/Shop';
import ShopCategory from './Pages/ShopCategory';
import Cart from './Pages/Cart';
import Product  from './Pages/Product';
import LoginSignup from './Pages/LoginSignup';
import Footer from './Components/Footer/Footer.jsx'
import menbanner from '../src/Components/Assets/banner_mens.png'
import womenbanner from '../src/Components/Assets/banner_women.png'
import kidsbanner from '../src/Components/Assets/banner_kids.png'


function App() {
  return (
    <div>
      <BrowserRouter>
        <Navbar />
        <Routes>
          <Route path='/' element={<Shop />} />
          <Route path='/mens' element={<ShopCategory banner={menbanner} category="men" />} />
          <Route path='/womens' element={<ShopCategory banner={womenbanner} category="women" />} />
          <Route path='/kids' element={<ShopCategory banner={kidsbanner} category="kid" />} />
          <Route path='/product' element={<Product  />} />
          <Route path='/product/:productId' element={<Product />} />
          <Route path='/cart' element={<Cart />} />
          <Route path='/login' element={<LoginSignup />} />
        </Routes>
        <Footer />
      </BrowserRouter>

    </div>
  );
}

export default App;
