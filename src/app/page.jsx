import React from 'react';
import Carousel from './components/Carousel';
import SectionAbout from './components/SectionAbout';
import Map from './components/Map';
import Footer from './components/Footer';

function page(props) {
  return (
    <div className='flex flex-col space-y-5'>
       <Carousel />
       <SectionAbout />
       <Map />
       {/* <SectionAbout /> */}
       <Footer />
    </div>
  );
}

export default page;