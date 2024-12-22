import React from 'react';

const Features = () => {
  return (
    <section id='AboutUs'>
      {/* Flex Container */}
      <div className='container flex flex-col px-4 mx-auto mt-10 space-y-12 md:space-y-0 md:flex-row'>
        {/* What's Different */}
        <div className='flex flex-col space-y-12 md:w-1/2'>
          <h2 className='max-w-md text-4xl font-bold text-center md:text-left'>
          What's different about SSE?
          </h2>
          <p className='max-w-sm text-center text-darkGrayishBlue md:text-left'>
          SSE provides custom web development services tailored to your business needs, all while simplifying the process. Our solutions are designed to deliver results with minimal complexity, ensuring that your digital presence is effective and aligned with your business goals.
          </p>
        </div>

        {/* Numbered List */}
        <div className='flex flex-col space-y-8 md:w-1/2'>
          {/* List Item 1 */}
          <div className='flex flex-col space-y-3 md:space-y-0 md:space-x-6 md:flex-row'>
            {/* Heading */}
            <div className='rounded-l-full bg-green-100 md:bg-transparent'>
  <div className='flex items-center space-x-2'>
    <div className='px-4 py-2 text-white rounded-full md:py-1 bg-green-500'>
      01
    </div>
    <h3 className='text-base font-bold md:mb-4 md:hidden'>
    Tailored Website Solutions     </h3>
  </div>
</div>

            <div>
              <h3 className='hidden mb-4 text-lg font-bold md:block'>
              Tailored Website Solutions               </h3>
              <p className='text-darkGrayishBlue'>
              Build a website that reflects your unique brand and vision. From user-friendly designs to performance optimization, we ensure that your website is perfect for your needs and future growth.
              </p>
            </div>
          </div>

          {/* List Item 2 */}
          <div className='flex flex-col space-y-3 md:space-y-0 md:space-x-6 md:flex-row'>
            {/* Heading */}
            <div className='rounded-l-full bg-green-100 md:bg-transparent'>
  <div className='flex items-center space-x-2'>
    <div className='px-4 py-2 text-white rounded-full md:py-1 bg-green-500'>
      02
    </div>
    <h3 className='text-base font-bold md:mb-4 md:hidden'>
    Advanced Customization & Analytics
    </h3>
  </div>
</div>


            <div>
              <h3 className='hidden mb-4 text-lg font-bold md:block'>
              Advanced Customization & Analytics
              </h3>
              <p className='text-darkGrayishBlue'>
              Get deeper insights into how your website is performing with advanced analytics. Customize your site based on user behavior to improve engagement, boost conversions, and meet your business objectives.
              </p>
            </div>
          </div>

          {/* List Item 3 */}
          <div className='flex flex-col space-y-3 md:space-y-0 md:space-x-6 md:flex-row'>
            {/* Heading */}
            <div className='rounded-l-full bg-green-100 md:bg-transparent'>
  <div className='flex items-center space-x-2'>
    <div className='px-4 py-2 text-white rounded-full md:py-1 bg-green-500'>
      03
    </div>
    <h3 className='text-base font-bold md:mb-4 md:hidden'>
    End-to-End Web Development     </h3>
  </div>
</div>


            <div>
              <h3 className='hidden mb-4 text-lg font-bold md:block'>
              End-to-End Web Development 
              </h3>
              <p className='text-darkGrayishBlue'>
              From the first design to the final deployment, SSE provides end-to-end services, including hosting, maintenance, and post-launch support. Everything you need to launch and grow your online presence is all in one place.


              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Features;
