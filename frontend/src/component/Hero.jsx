import { Link } from 'react-scroll';

import Navbar from './Navbar';
import Features from './Features.jsx';
import Testimonial from './Testimonial';
import CallToAction from './CallToAction';
import Footer from './Footer';

import illustrationIntro from '../assets/images/landing.png';

const Hero = () => {
  return (
    <div>
    <Navbar />
<div>
    <section id='hero'>
      {/* Flex Container */}
      <div className='container flex flex-col-reverse items-center px-6 mx-auto mt-10 space-y-0 md:space-y-0 md:flex-row'>
        {/* Left Item */}
        <div className='flex flex-col mb-32 space-y-12 md:w-1/2'>
          <h1 className='max-w-md text-4xl font-bold text-center md:text-5xl md:text-left'>
          Crafting Unique Websites for Your Business Growth         </h1>
          <p className='max-w-sm text-center text-darkGrayishBlue md:text-left'>
          SSE makes it easy for businesses to bring their online presence to life, ensuring every website is tailored to meet both immediate needs and long-term goals.
          </p>
          <div className='flex justify-center md:justify-start'>
          
            <Link 
            to='contact' 
            smooth={true} 
            duration={500} 
            className='p-3 px-6 pt-2 text-white bg-green-500 rounded-full baseline hover:bg-green-600 cursor-pointer'
          >
 Get Started          </Link>


          </div>
        </div>
        {/* Image */}
        <div className='md:w-1/2'>
          <img src={illustrationIntro} alt='' />
        </div>
      </div>
    </section>
    </div>
    <Features />
    <Testimonial />
      <CallToAction />
      <Footer />
    </div>
  );
};

export default Hero;
