import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSignOutAlt } from "@fortawesome/free-solid-svg-icons";

export default function Header({ currentState }) {
  const [isNavVisible, setNavVisibility] = useState(false);
  const [isSmallScreen, setIsSmallScreen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isDropdownVisible, setDropdownVisible] = useState(false); // Fixed: Added state for dropdown visibility
  const navigate = useNavigate();

  const logoUrl = `${process.env.PUBLIC_URL}/SSE_logo.png`;

  const GoToPage = (url) => {
    navigate("/" + url, { state: { currentState } });
  };

  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 700px)");
    mediaQuery.addEventListener("change", handleMediaQueryChange);
    handleMediaQueryChange(mediaQuery);

    const token = localStorage.getItem("token");
    if (token) {
      setIsLoggedIn(true);
    }
    return () => {
      mediaQuery.removeEventListener("change", handleMediaQueryChange);
    };
  }, []);

  const handleMediaQueryChange = (mediaQuery) => {
    setIsSmallScreen(mediaQuery.matches);
  };

  const toggleNav = () => {
    setNavVisibility(!isNavVisible);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsLoggedIn(false);
    navigate("/");
  };

  return (
    <header className="bg-green-500 shadow-lg">
      <div className="px-6 py-4 flex justify-between items-center">
        {/* Logo */}
        <div className="text-3xl font-semibold text-white">
          <img
            src={logoUrl}
            className="w-[8rem] h-[4.5rem] cursor-pointer"
            onClick={() => GoToPage("")}
            alt="Logo"
          />
        </div>

        {/* Hamburger Menu Button */}
        {isSmallScreen && (
          <button
            onClick={toggleNav}
            className="text-white hover:text-green-300"
          >
            ☰
          </button>
        )}

        {/* Desktop Navigation */}
        {!isSmallScreen && (
          <nav className="flex space-x-4 items-center ml-auto">
            <div
              className="relative"
              onMouseEnter={() => setDropdownVisible(true)}
              onMouseLeave={() => setDropdownVisible(false)}
            >
              <a
                onClick={() => GoToPage("About-SSE")}
                className="text-white hover:text-green-300 cursor-pointer"
              >
                אודות
              </a>
              <div
                className={`absolute top-full mt-2 rounded-md shadow-lg bg-white py-2 text-sm ${
                  isDropdownVisible ? "block" : "hidden"
                }`}
              >
              
            
              </div>
            </div>
            <a
              onClick={() => GoToPage("contact-us")}
              className="text-white hover:text-green-300 cursor-pointer"
            >
              צור קשר
            </a>
            <a
              dir="rtl"
              onClick={() => GoToPage("report")}
              className="my-auto text-white hover:text-green-300 rtl cursor-pointer"
            >
              צפייה בדוחות
            </a>
            <a
              dir="rtl"
              onClick={() => GoToPage("View-Inventory")}
              className="my-auto text-white hover:text-green-300 rtl cursor-pointer"
            >
              צפייה במלאי
            </a>
            <a
              dir="rtl"
              onClick={() => GoToPage("order")}
              className="my-auto text-white hover:text-green-300 rtl cursor-pointer"
            >
              בצע הזמנה
            </a>
            <a
              dir="rtl"
              onClick={() => GoToPage("home")}
              className="my-auto text-white hover:text-green-300 rtl cursor-pointer"
            >
              עמוד הבית
            </a>
          </nav>
        )}

        {/* Logout Button */}
        <div className="flex items-center">
          {isLoggedIn && window.location.pathname !== "/login" ? (
            <button
              onClick={handleLogout}
              className="ml-4 bg-gradient-to-r from-red-400 to-red-500 text-white py-2 px-6 rounded-full shadow-lg hover:from-red-500 hover:to-red-600 hover:shadow-xl transition duration-300 transform hover:scale-105"
            >
              <FontAwesomeIcon icon={faSignOutAlt} className="h-5 w-5" />
              <span>התנתק</span>
            </button>
          ) : null}
        </div>
      </div>

      {/* Mobile Navigation */}
      {isSmallScreen && isNavVisible && (
        <div className="bg-green-600 px-6 py-4 space-y-2">
          <a
            onClick={() => GoToPage("home")}
            className="block text-white hover:text-green-300 cursor-pointer"
          >
            עמוד הבית
          </a>
          <a
            onClick={() => GoToPage("contact")}
            className="block text-white hover:text-green-300 cursor-pointer"
          >
            צור קשר
          </a>
          <a
            onClick={() => GoToPage("about")}
            className="block text-white hover:text-green-300 cursor-pointer"
          >
            אודות
          </a>
         
          <a
            onClick={() => GoToPage("report")}
            className="block text-white hover:text-green-300 cursor-pointer"
          >
            צפייה בדוחות
          </a>
          <a
            onClick={() => GoToPage("View-Inventory")}
            className="block text-white hover:text-green-300 cursor-pointer"
          >
            צפייה במלאי
          </a>
          <a
            onClick={() => GoToPage("order")}
            className="block text-white hover:text-green-300 cursor-pointer"
          >
            בצע הזמנה
          </a>
        </div>
      )}
    </header>
  );
}
