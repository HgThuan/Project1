import React from 'react'
import Hero from '../Components/Hero/Hero.jsx'
import Popular from '../Components/Popular/Popular.jsx'
import Offer from '../Components/Offers/Offer.jsx'
import NewCollections from '../Components/NewCollections/NewCollections.jsx'
import Newsletter from '../Components/Newsletter/Newsletter.jsx'

function Shop() {
  return (
    <div>
        <Hero/>
        <Popular/>
        <Offer/>
        <NewCollections/>
        <Newsletter/>
    </div>
  )
}

export default Shop