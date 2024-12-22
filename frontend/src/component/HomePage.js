import React from "react";
import Header from "../pages/header";
import Footer from "../pages/footer";
import { useLocation } from "react-router-dom";
import { useNavigate } from "react-router-dom";

const HomePage = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const services = [
    { title: "ביצוע הזמנה", description: "בצע הזמנה מיידית", url: "/order" },
    {
      title: "דוחות",
      description: "הצג דוחות והיסטוריית הזמנות",
      url: "/report",
    },
    {
      title: "צפייה ועדכון מלאי",
      description: "עדכן את המלאי הקיים",
      url: "/View-Inventory",
    },
    {
      title: "ניתוח נתונים כולל גרפים",
      description: "בצע ניתוח עם גרפים",
      url: "/report",
    },
  ];

  return (
    <div>
      <div className="App min-h-screen bg-green-50 flex flex-col">
        <div className="w-full">
          <Header></Header>
        </div>

        <h1 className="text-5xl font-extrabold text-black mb-10 drop-shadow-lg mt-20">
          {localStorage.getItem("businessName") || "שם עסק"}
        </h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 mb-20">
          {services.map((service, index) => (
            <div key={index}>
              {" "}
              {/* Single parent element for each item */}
              <div className="max-w-sm bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden dark:bg-gray-800 dark:border-gray-700">
                <a href="#" className="block">
                  <img
                    className="w-full h-48 object-cover"
                    src={index + ".jpg"}
                    alt={service.title}
                  />
                </a>
                <div className="p-5">
                  <a href="#">
                    <h5 className="mb-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
                      {service.title}
                    </h5>
                  </a>
                  <p className="mb-4 text-gray-700 dark:text-gray-400">
                    {service.description}
                  </p>
                  <button
                    onClick={() => navigate(service.url)}
                    className="bg-green-500 text-black font-bold px-5 py-2 rounded-full hover:bg-green-600 ring-2 ring-green-500 transition-colors duration-300"
                  >
                    כנס לשירות
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="w-full mt-auto flex-none">
        <Footer></Footer>
      </div>
    </div>
  );
};

export default HomePage;
