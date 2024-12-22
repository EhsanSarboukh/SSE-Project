import React from 'react';
import Footer from './footer';
import Header from './header';

const Contact = () => {
    return (
        <div className="min-h-screen w-full flex flex-col bg-gray-100">
            <Header />
            {/* Center the text content */}
            <div className="flex-grow flex items-center justify-center">
                {/* Text Content */}
                <div className="text-center ">
                    <h1 dir="rtl" className="text-gray-800 text-4xl font-extrabold ">דברו איתנו!</h1>
                    <p  dir="rtl"className="text-m text-gray-500 mt-4">
לתמיכה טכנית או כל שאלה שלחו לנו מייל                     </p>
                    <div className="mt-12">
                        <ul className="mt-4">
                            <li className="flex items-center justify-center">
                                <div className="bg-[#e6e6e6cf] h-10 w-10 rounded-full flex items-center justify-center shrink-0">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20px" height="20px" fill="#007bff" viewBox="0 0 479.058 479.058">
                                        <path
                                            d="M434.146 59.882H44.912C20.146 59.882 0 80.028 0 104.794v269.47c0 24.766 20.146 44.912 44.912 44.912h389.234c24.766 0 44.912-20.146 44.912-44.912v-269.47c0-24.766-20.146-44.912-44.912-44.912zm0 29.941c2.034 0 3.969.422 5.738 1.159L239.529 264.631 39.173 90.982a14.902 14.902 0 0 1 5.738-1.159zm0 299.411H44.912c-8.26 0-14.971-6.71-14.971-14.971V122.615l199.778 173.141c2.822 2.441 6.316 3.655 9.81 3.655s6.988-1.213 9.81-3.655l199.778-173.141v251.649c-.001 8.26-6.711 14.97-14.971 14.97z"
                                            data-original="#000000"
                                        />
                                    </svg>
                                </div>
                                <a href="javascript:void(0)" className="text-[#007bff] text-sm ml-4">
                                    <small className="block">Mail</small>
                                    <strong>sse.team3@gmail.com</strong>
                                </a>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
};

export default Contact;
