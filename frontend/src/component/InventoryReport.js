import React, { useState, useEffect, useRef } from "react";
import Header from "../pages/header";
import Footer from "../pages/footer";
import Loading from "./Loading";

const openDB = async () => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open("OrderDB", 1);
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains("items")) {
        db.createObjectStore("items", { keyPath: "sku" });
      }
    };
    request.onsuccess = (event) => resolve(event.target.result);
    request.onerror = (event) => reject(event.target.error);
  });
};

const getAllFromDB = async (storeName) => {
  const db = await openDB();
  const transaction = db.transaction(storeName, "readonly");
  const store = transaction.objectStore(storeName);
  return new Promise((resolve, reject) => {
    const request = store.getAll();
    request.onsuccess = () => resolve(request.result || []);
    request.onerror = (event) => reject(event.target.error);
  });
};

const fetchFirstAvailableImageBlob = async (paths) => {
  for (const path of paths) {
    try {
      const response = await fetch(path);
      if (response.ok) {
        return await response.blob();
      }
    } catch {}
  }
  return null;
};

const getTodaysDate = () => {
  let today = new Date();
  const dd = String(today.getDate()).padStart(2, "0");
  const mm = String(today.getMonth() + 1).padStart(2, "0"); //January is 0!
  const yyyy = today.getFullYear();

  today = mm + "/" + dd + "/" + yyyy;
  return today;
};

const InventoryReport = () => {
  const reportRef = useRef();
  const [reportType, setReportType] = useState(null); // Tracks which report to display
  const [loading, setLoading] = useState(true);

  const [inventoryData, setInventoryData] = useState([]); // Data for the inventory report

  useEffect(() => {
    const fetchInventoryData = async () => {
      try {
        setLoading(true);
        const items = await getAllFromDB("items");

        if (items.length !== 0) {
          const transformedData = items.map((item) => ({
            sku: item.sku,
            name: item.name,
            amount: item.amount,
            price: item.price,
            image: item.imageBlob
              ? URL.createObjectURL(item.imageBlob)
              : item.image || "",
          }));
          const sortedData = sortInventoryBySKU(transformedData);
          setInventoryData(sortedData);
        } else {
          // Fetch from backend if IndexedDB is empty
          const response = await fetch(
            "http://localhost:5000/productRoutes/getProducts"
          );
          const data = await response.json();

          const transformedData = await Promise.all(
            data.map(async (item) => {
              const pngPath = `${process.env.PUBLIC_URL}/images/${item.sku}.png`;
              const jpgPath = `${process.env.PUBLIC_URL}/images/${item.sku}.jpg`;
              const placeholderPath = `${process.env.PUBLIC_URL}/images/placeholder.png`;

              const blob = await fetchFirstAvailableImageBlob([
                pngPath,
                jpgPath,
                placeholderPath,
              ]);
              const objectURL = blob ? URL.createObjectURL(blob) : null;

              return { ...item, image: objectURL }; // Do not save to IndexedDB
            })
          );

          const sortedData = sortInventoryBySKU(transformedData);
          setInventoryData(sortedData);
        }
      } catch (error) {
        console.error("Error fetching inventory data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchInventoryData();
    setReportType("inventory");
  }, []);

  // Fetch data from IndexedDB

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

  const printReport = (reportRef) => {
    const printWindow = document.createElement("iframe");
    printWindow.style.position = "absolute";
    printWindow.style.top = "-10000px";
    document.body.appendChild(printWindow);

    const printDocument =
      printWindow.contentDocument || printWindow.contentWindow.document;

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
                ${
                  reportRef.current.innerHTML
                } <!-- Dynamically include the report content -->
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

  if (loading) {
    return (
      <>
        <div className="App min-h-screen bg-green-50 flex flex-col">
          <div className="w-full">
            <Header></Header>
          </div>
          <Loading />
        </div>
        <div className="w-full mt-auto flex-none">
          <Footer></Footer>
        </div>
      </>
    );
  }

  return (
    <div className="App min-h-screen bg-green-50 flex flex-col">
      <div className="w-full">
        <Header></Header>
      </div>
      <button
        onClick={() =>
          reportType === "inventory" ? printReport(reportRef) : pass
        }
        className="bg-green-500 text-white px-4 py-2 rounded-lg mt-2 hover:bg-green-600"
      >
        הדפס דוח
      </button>
      <br />
      <div ref={reportRef} className="w-4/5 justify-self-center">
        {reportType === "inventory" && (
          <div className="bg-white shadow-lg rounded-lg p-6">
            <h1 className="text-2xl font-bold text-blue-700 mb-4">דוח מלאי</h1>
            <div className="overflow-x-auto">
              <table
                className="table-auto w-full text-left border-collapse"
                dir="rtl"
              >
                <thead>
                  <tr className="border-b-2">
                    <th className="px-4 py-2 text-center">תמונה</th>
                    <th className="px-4 py-2 text-center">מק"ט</th>
                    <th className="px-4 py-2 text-center">שם מוצר</th>
                    <th className="px-4 py-2 text-center">כמות במלאי</th>
                    <th className="px-4 py-2 text-center">מחיר ליחידה</th>
                    <th className="px-4 py-2 text-center">
                      {" "}
                      מחיר יחידות במלאי
                    </th>
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
                      <td className="px-4 py-2 text-center">
                        ₪{item.price.toFixed(2)}
                      </td>
                      <td className="px-4 py-2 text-center">
                        ₪{(item.amount * item.price).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
      <br />
      <div className="w-full mt-auto flex-none">
        <Footer></Footer>
      </div>
    </div>
  );
};

export default InventoryReport;
