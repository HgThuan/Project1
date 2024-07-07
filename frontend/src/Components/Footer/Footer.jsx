import React from 'react';
import './Footer.css';
import footerlogo from '../Assets/logo.png';
import instaicon from '../Assets/instagram_icon.png';
import pinteresticon from '../Assets/pintester_icon.png';
import whatsappicon from '../Assets/whatsapp_icon.png';

const Footer = () => {
  return (
    <div className='footer'>
      <div className="footer-logo">
        <img src={footerlogo} alt="Footer Logo" />
        <p>SHOPNEST</p>
      </div>
      <ul className='footer-links'>
        <li>Company</li>
        <li>Products</li>
        <li>Offices</li>
        <li>About</li>
        <li>Contact</li>
      </ul>
      <div className="footer-social-icons">
        <div className="footer-icons-container">
          <img src={instaicon} alt="Instagram" />
        </div>
        <div className="footer-icons-container">
          <img src={pinteresticon} alt="Pinterest" />
        </div>
        <div className="footer-icons-container">
          <img src={whatsappicon} alt="WhatsApp" />
        </div>
      </div>
      <div className="footer-copyright">
        <hr />
        
      </div>
    </div>
  );
}

export default Footer;
