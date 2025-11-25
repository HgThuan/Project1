import React, { Fragment } from 'react'
import { StartSlider } from '../../until/slideshow';

export default function Silde() {
  StartSlider();

  return (
    <Fragment>
      <section className="homepage-banner">
        <div className="row no-gutters">
          <div className="banner-slide">
            <img className="slide-img" src="../Images/slide.PNG" alt="slide" />
            <img className="slide-img" src="../Images/banner-1.jpeg" alt="slide" />
            <img className="slide-img" src="../Images/Banner6.png" alt="slide" />
            <img className="slide-img" src="../Images/banner-3.jpg" alt="slide" />
            <img className="slide-img" src="../Images/banner-4.jpeg" alt="slide" />
          </div>
        </div>
      </section>
    </Fragment>
  )
}
