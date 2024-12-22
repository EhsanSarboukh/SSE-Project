import React from "react";

function Footer({ currentState }) {
  const logoUrl = `${process.env.PUBLIC_URL}/SSE_logo.png`;

  return (
    <footer className="bg-green-500 text-white p-5">
      <div
        dir="rtl"
        className="flex flex-col md:flex-row gap-5 md:gap-0 items-center md:items-start justify-center md:justify-between text-center md:text-right"
      >
        {/* Contact Section */}
        <div className="flex flex-col items-center md:items-start">
          <h3 className="font-bold text-lg mb-2">צור קשר</h3>
          <ul className="space-y-1">
            <li>טלפון: 000000000</li>
            <li>דוא"ל: sse.team3@gmail.com</li>
            <li>כתובת: רח' סנונית 51, כרמיאל </li>
          </ul>
        </div>

        {/* Quick Links Section */}
        <div className="flex flex-col items-center md:items-start">
          <h3 className="font-bold text-lg mb-2">קישורים מהירים</h3>
          <ul className="space-y-1">
            <li>
              <a href="/About-SSE" className="hover:underline">
                אודותינו
              </a>
            </li>
            <li>
              <a href="/Privacy-Policy" className="hover:underline">
                מדיניות פרטיות
              </a>
            </li>
           
          
          </ul>
        </div>

        {/* SSE Logo Section */}
        <div className="flex flex-col items-center">
          <img
            src={logoUrl}
            className="w-20 h-12 md:w-[8.3vw] md:h-[5vw]"
            alt="SSE Logo"
          />
          <p className="text-sm mt-2">
            כל הזכויות שמורות © {new Date().getFullYear()}
          </p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
