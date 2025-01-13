import React, { Fragment } from 'react'
import { Link } from "react-router-dom";

export default function Register() {
  return (
    <Fragment>
        <div className="modal-form">
            <form className="form-login1">
                <h2 className="login__heading">Đăng kí tài khoản</h2>
                <p className="login__text">Nếu đã từng mua hàng trên Website trước đây, bạn có thể dùng tính năng <a href="">"Lấy mật khẩu"</a> để có thể truy cập vào tài khoản bằng email nhé.</p>
                <input type="text" placeholder="Tên của bạn" className="login__input"/>
                <input type="text" placeholder="SĐT của bạn" className="login__input"/>
                <input type="text" placeholder="Email của bạn" className="login__input"/>
                <input type="text" placeholder="Mật khẩu" className="login__input"/>
                <input type="text" placeholder=" Nhập lại mật khẩu" className="login__input"/>
                <div className="btn btn--login">
                    Đăng ký
                </div>
                <div className="login-separate">
                    <span></span>
                    Hoặc
                    <span></span>
                    
                </div>
                <div className="btn btn--fb">
                    <p>Đăng ký với Facebook</p>
                    <img src="https://www.coolmate.me/images/facebook.svg" alt=""/>
                </div>
                <div className="btn btn--google">
                    <p>Đăng ký với Google</p>
                    <img src="https://www.coolmate.me/images/google.svg" alt=""/>
                </div>
                <div className="form-option">
                    <Link to="/DangNhap">
                        <span  className="form-option__login1">Đăng nhập</span>
                    </Link>
                </div>
            </form>
        </div>
    </Fragment>
  );
}
