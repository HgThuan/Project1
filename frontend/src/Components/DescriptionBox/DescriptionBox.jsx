import React from 'react'
import  './DescriptionBox.css'

const DescriptionBox = () => {
  return (
    <div className="descriptionbox">
        <div className="descriptionbox-navigator">
            <div className="descriptionbox-nav-box">Description</div>
            <div className="descriptionbox-nav-box fade">Reviews (122)</div>
        </div>
        <div className="descriptionbox-description">
            <p>Một trang web thương mại điện tử cho phép khách hàng mua sắm cho sản phẩm hoặc dịch vụ trực tuyến. Với một loạt các dịch vụ, các tùy chọn thanh toán an toàn và giao hàng thuận tiện, các nền tảng này giúp mua sắm dễ dàng và dễ truy cập</p>
        </div>
    </div>
  )
}

export default DescriptionBox