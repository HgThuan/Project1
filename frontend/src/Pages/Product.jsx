import React, { useContext } from 'react'
import { ShopContext } from '../Context/ShopContext.jsx'
import { useParams } from 'react-router-dom';
import Breadcrums from '../Components/Breadcrums/Breadcrums.jsx';
import ProductDisplay from '../Components/ProductDisplay/ProductDisplay.jsx'
import DescriptionBox from '../Components/DescriptionBox/DescriptionBox.jsx'
import RelatedProducts from '../Components/RelatedProducts/RelatedProducts.jsx';

const Product = () => {
  const { allproduct } = useContext(ShopContext);
  const { productId } = useParams();

  const Product = allproduct.find((e) => e.id === Number(productId));

  return (
    <div>
      <Breadcrums product={Product} />
      <ProductDisplay product={Product} />
      <DescriptionBox/>
      <RelatedProducts />
    </div>
  )
}

export default Product