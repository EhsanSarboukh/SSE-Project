import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom"
import Header from "../pages/header";
import Footer from "../pages/footer";
import Popup from "./Popup"

const openDB = async () => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('OrderDB', 1);
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains('items')) {
        db.createObjectStore('items', { keyPath: 'sku' });
      }
    };
    request.onsuccess = (event) => resolve(event.target.result);
    request.onerror = (event) => reject(event.target.error);
  });
};

const getAllFromDB = async (storeName) => {
  const db = await openDB();
  const transaction = db.transaction(storeName, 'readonly');
  const store = transaction.objectStore(storeName);
  return new Promise((resolve, reject) => {
    const request = store.getAll();
    request.onsuccess = () => resolve(request.result || []);
    request.onerror = (event) => reject(event.target.error);
  });
};

const getTodaysDate = () => {
  let today = new Date();
  const dd = String(today.getDate()).padStart(2, '0');
  const mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
  const yyyy = today.getFullYear();

  today = mm + '/' + dd + '/' + yyyy;
  return today;
}

const Report = () => {
  const reportRef = useRef();
  const navigate = useNavigate();

  const [isPopupOpen, setIsPopupOpen] = useState(false); // Shows and hides the popup
  const [popupContent, setPopupContent] = useState({ title: '', message: '' }); // Manipulates the popup data
  const [reportType, setReportType] = useState(null); // Tracks which report to display
  const [inventoryData, setInventoryData] = useState([]); // Data for the inventory report

  const navigateToReport = (pageName) => {
    navigate("/" + pageName + "Report");
  }

  const closePopup = () => {
    setIsPopupOpen(false);
  };

  const openPopup = (title, message) => {
    setPopupContent({ title, message });
    setIsPopupOpen(true);
  };

  // Fetch data from IndexedDB
  const fetchInventoryData = async () => {
    try {
      const items = await getAllFromDB('items');
      const transformedData = items.map((item) => ({
        sku: item.sku,
        name: item.name,
        amount: item.amount,
        price: item.price,
        image: item.imageBlob ? URL.createObjectURL(item.imageBlob) : item.image || '',
      }));
      const sortedData = sortInventoryBySKU(transformedData);
      setInventoryData(sortedData);
    } catch (error) {
      console.error("Error fetching inventory data:", error);
    }
  };

  const sortInventoryBySKU = (inventoryData) => {
    const sortedData = [...inventoryData].sort((a, b) => {
      // Convert SKU to numeric values for comparison
      const skuA = parseInt(a.sku, 10);
      const skuB = parseInt(b.sku, 10);
  
      // Handle cases where SKU conversion to number might fail
      if (isNaN(skuA) || isNaN(skuB)) {
        return a.sku.localeCompare(b.sku); // Fallback to string comparison
      }
  
      return skuA - skuB; // Numeric comparison
    });
  
    return sortedData;
  };
  

  const generateInventoryReport = () => {
    fetchInventoryData();
    setReportType("inventory");
  };

  const generateOrdersReport = () => {
    setReportType("orders");
  };

  const generateCustomerReport = () => {
    setReportType("customers");
  };

  const printReport = (reportRef) => {
    
    if (reportType === null) {
      openPopup("שגיאה", "!עליך לייצר את הדוח לפני הדפסה");
      return;
    }
    const printWindow = document.createElement("iframe");
    printWindow.style.position = "absolute";
    printWindow.style.top = "-10000px";
    document.body.appendChild(printWindow);

    const printDocument = printWindow.contentDocument || printWindow.contentWindow.document;

    printDocument.open();
    printDocument.write(`
      <html>
        <head>
          <title>Print Report</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              line-height: 1.5;
              margin: 20px;
              direction: rtl;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 20px;
            }
            th, td {
              border: 1px solid #ddd;
              padding: 8px;
              text-align: center;
            }
            th {
              background-color: #f2f2f2;
            }
            img {
              max-width: 100px;
              border-radius: 8px;
            }
            .container {
              max-width: 800px;
              margin: auto;
              background: white;
              padding: 20px;
              border-radius: 10px;
              box-shadow: 0 4px 8px rgba(0,0,0,0.1);
            }
            .header {
              text-align: center;
              margin-bottom: 20px;
            }
            h2 {
              color: #007acc;
            }
          </style>
        </head>
        <body>
          <div class="container">
            ${getTodaysDate()}
            ${reportRef.current.innerHTML} <!-- Dynamically include the report content -->
          </div>
        </body>
      </html>
    `);

    printDocument.close();

    printWindow.contentWindow.focus();
    printWindow.contentWindow.print();

    // Cleanup: Remove the iframe after printing
    printWindow.parentNode.removeChild(printWindow);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center">
      {/* Header */}
      <div className="w-full">
        <Header />
      </div>

      {/* Cards Section */}
      <div className="mt-10 flex flex-col items-center gap-6 w-4/5 mx-auto">
      {/* Inventory Report Card */}
        <div className="flex flex-col items-center bg-white border border-gray-200 w-[90%] rounded-sm shadow md:flex-row md:max-w-xl hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700 "
>
          <img 
            className="object-cover w-full rounded-t-lg h-96 md:h-auto md:w-48 md:rounded-none md:rounded-s-lg" 
            src="inventoryReport.jpg" 
            alt="דוח מלאי" 
          />
     <div className="flex flex-col justify-between p-4 leading-normal text-right ml-8">  {/* Added text-left */}
  <h5 className="mb-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
    דוח מלאי
  </h5>
  <p dir="rtl" className="mb-3 font-normal text-gray-700 dark:text-gray-400">
    צור דוח מפורט על המלאי הנוכחי
  </p>
  <button
    onClick={() => navigateToReport("inventory")}
    className="text-gray-900 bg-white border border-green-300 focus:outline-none hover:bg-gray-100 focus:ring-4 focus:ring-gray-100 font-medium rounded-full text-sm px-5 py-2.5 me-2 mb-2 dark:bg-gray-800 dark:text-white dark:border-gray-600 dark:hover:bg-gray-700 dark:hover:border-gray-600 dark:focus:ring-gray-700"
  >
    צפייה בדוח
  </button>
</div>

        </div>









   



















        {/* Orders Report Card */}
        <div   className="flex flex-col items-center bg-white border border-gray-200 w-[90%] rounded-sm shadow md:flex-row md:max-w-xl hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700"
>
          <img 
            className="object-cover w-full rounded-t-lg h-96 md:h-auto md:w-48 md:rounded-none md:rounded-s-lg" 
            src="ordersReport.jpg" 
            alt="דוח הזמנות" 
          />
          <div className="flex flex-col justify-between p-4 leading-normal  text-right ml-8">
            <h5 className="mb-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
              דוח הזמנות
            </h5>
            <p  dir="rtl" className="mb-3 font-normal text-gray-700 dark:text-gray-400">
            צור דוח מפורט על כל ההזמנות
            </p>
            <button
            onClick={() => navigateToReport("order")}
            className="text-gray-900 bg-white border border-green-300 focus:outline-none hover:bg-gray-100 focus:ring-4 focus:ring-gray-100 font-medium rounded-full text-sm px-5 py-2.5 me-2 mb-2 dark:bg-gray-800 dark:text-white dark:border-gray-600 dark:hover:bg-gray-700 dark:hover:border-gray-600 dark:focus:ring-gray-700"
          >
            צפייה בדוח
          </button>
          </div>
        </div>









        {/* Customer Report Card */}





        <div  className="flex flex-col items-center bg-white border border-gray-200 w-[100%]   rounded-sm shadow md:flex-row md:max-w-xl hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700"
>
          <img 
            className="object-cover w-full rounded-t-lg h-96 md:h-auto md:w-48 md:rounded-none md:rounded-s-lg" 
            src="report.jpg" 
            alt="דוח לקוחות" 
          />
          <div  className="flex flex-col justify-between p-4 leading-normal  text-right ml-8">
            <h5 className="mb-2 text-2xl  font-bold tracking-tight text-gray-900 dark:text-white">
              דוח לקוחות
            </h5>
            <p  dir="rtl" className="mb-3 font-normal text-gray-700 dark:text-gray-400">
            צור תובנות ונתונים על הלקוחות
            </p>
            <button
            onClick={() => navigateToReport("customer")}
            className="text-gray-900 bg-white border border-green-300 focus:outline-none hover:bg-gray-100 focus:ring-4 focus:ring-gray-100 font-medium rounded-full text-sm px-5 py-2.5 me-2 mb-2 dark:bg-gray-800 dark:text-white dark:border-gray-600 dark:hover:bg-gray-700 dark:hover:border-gray-600 dark:focus:ring-gray-700"
          >
            צפייה בדוח
          </button>
          </div>
        </div>







    
      </div>


      {/* Report Section */}
      <div ref={reportRef} className="mt-10 w-4/5">
        {reportType === "inventory" && (
          <div className="bg-white shadow-lg rounded-lg p-6">
            <h1 className="text-2xl font-bold text-blue-700 mb-4">
              דוח מלאי
            </h1>
            <table className="table-auto w-full text-left border-collapse">
              <thead>
                <tr className="border-b-2">
                  <th className="px-4 py-2 text-center">תמונה</th>
                  <th className="px-4 py-2 text-center">מק"ט</th>
                  <th className="px-4 py-2 text-center">שם מוצר</th>
                  <th className="px-4 py-2 text-center">כמות במלאי</th>
                  <th className="px-4 py-2 text-center">מחיר ליחידה</th>
                  <th className="px-4 py-2 text-center">סה"כ ערך</th>
                </tr>
              </thead>
              <tbody>
                {inventoryData.map((item, index) => (
                  <tr key={index} className="border-b">
                    <td className="px-4 py-2 text-center flex justify-center">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-16 h-16 object-cover rounded-lg"
                      />
                    </td>
                    <td className="px-4 py-2 text-center">{item.sku}</td>
                    <td className="px-4 py-2 text-center">{item.name}</td>
                    <td className="px-4 py-2 text-center">{item.amount}</td>
                    <td className="px-4 py-2 text-center">₪{item.price.toFixed(2)}</td>
                    <td className="px-4 py-2 text-center">
                      ₪{(item.amount * item.price).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      <br />
      <div className="w-full mt-auto flex-none">
        <Footer></Footer>
      </div>

      <Popup isOpen={isPopupOpen} onClose={closePopup}>
        <h1 className="text-2xl font-bold my-auto">{popupContent.title}</h1>
        <br />
        <h2 className="my-auto">{popupContent.message}</h2>
        <br />
        <button className="my-auto bg-green-500 rounded-lg hover:bg-green-800" onClick={closePopup}>סגור</button>
      </Popup>
    </div>
  );
};

export default Report;
