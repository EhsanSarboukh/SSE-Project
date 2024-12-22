import { Link } from 'react-router-dom';


const Footer = () => {
  const logoUrl = `${process.env.PUBLIC_URL}/SSE_logo.png`;

  return (
    <div className='bg-slate-300'>
      {/* Flex Container */}
      <div className='container flex flex-col-reverse justify-between px-6 py-10 mx-auto space-y-8 md:flex-row md:space-y-0'>
        {/* Logo and social links container */}
        <div className='flex flex-col-reverse items-center justify-between space-y-12 md:flex-col md:space-y-0 md:items-start'>
          <div className='mx-auto my-6 text-center md:hidden '>
            Copyright © 2022, All Rights Reserved
          </div>
          {/* Logo */}
          <div>
            <img src={logoUrl} className='h-8' alt='' />
          </div>
          
        </div>
        {/* List Container */}
        <div className='flex justify-around space-x-32'>


</div>


        {/* Input Container */}
        <div className='flex flex-col justify-between'>

  <div className='hidden text-white md:block'>
    Copyright © 2024, All Rights Reserved
  </div>
</div>

      </div>
    </div>
  );
};

export default Footer;
