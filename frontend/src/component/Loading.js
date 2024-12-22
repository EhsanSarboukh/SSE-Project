import "../App.css";
import React, { useState, useEffect } from "react";

function Loading() {
  const messages = [
    "הפריטים בדרך אליך...",
    "זה באמת לא אמור לקחת זמן...",
    "שניה, כמעט סיימנו...",
    "עוד רגע מסדרים הכל...",
    "מכינים לך את הכל, תכף מתחילים...",
  ];

  const [currentMessage, setCurrentMessage] = useState(messages[0]);
  const [fade, setFade] = useState(true); // Control fade effect

  useEffect(() => {
    let messageIndex = 0;

    const interval = setInterval(() => {
      setFade(false); // Start fade-out
      setTimeout(() => {
        messageIndex = (messageIndex + 1) % messages.length;
        setCurrentMessage(messages[messageIndex]);
        setFade(true); // Start fade-in
      }, 500); // Wait for fade-out before changing message
    }, 6000); // Change message every 3 seconds

    return () => clearInterval(interval); // Cleanup on unmount
  }, []);

  return (
    <div className="popup-overlay">
      <div className="loading-container text-center">
        <img
          src={`${process.env.PUBLIC_URL}/loading.svg`}
          alt="Loading..."
          className="w-30 h-30 mx-auto mb-4"
        />
        <h1
          dir="rtl"
          className={`text-2xl transition-opacity duration-500 ${
            fade ? "opacity-100" : "opacity-0"
          }`}
        >
          {currentMessage}
        </h1>
      </div>
    </div>
  );
}

export default Loading;
