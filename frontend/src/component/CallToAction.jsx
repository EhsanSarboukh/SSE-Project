import { Link } from 'react-router-dom';

const CallToAction = () => {
  return (
    <section id='cta' className='bg-green-500'>
  {/* Flex Container */}
  <div className='container flex flex-col items-center justify-between px-6 py-24 mx-auto space-y-12 md:py-12 md:flex-row md:space-y-0'>
    {/* Heading */}
    <h2 className='text-5xl font-bold leading-tight text-center text-white md:text-4xl md:max-w-xl md:text-left'>
    Simplify your operations and enhance efficiency with our expert services    </h2>
    
  </div>
</section>

  );
};

export default CallToAction;
