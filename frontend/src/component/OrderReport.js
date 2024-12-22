import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom"; // You don't need useParams anymore
import "../App.css";
import Header from "../pages/header";
import Footer from "../pages/footer";
import Loading from "./Loading";
import axios from "axios";
import OrderChart from "./ordersGraph";

const getTodaysDate = () => {
  let today = new Date();
  const dd = String(today.getDate()).padStart(2, "0");
  const mm = String(today.getMonth() + 1).padStart(2, "0"); //January is 0!
  const yyyy = today.getFullYear();

  today = mm + "/" + dd + "/" + yyyy;
  return today;
};

const formatDate = (dateString) => {
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0"); // החודש ב-JavaScript מתחיל מ-0
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

const OrderReport = () => {
  const reportRef = useRef();
  const chartRef = useRef(); // Ref to pass the chart as an image
  const [reportType, setReportType] = useState(null); // Tracks which report to display

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [ordersForCurrentDate, setOrdersForCurrentDate] = useState(0);
  const [totalOrders, setTotalOrders] = useState(0);

  // State for selected month and year
  const [month, setMonth] = useState(new Date().getMonth() + 1); // Default to current month
  const [year, setYear] = useState(new Date().getFullYear()); // Default to current year

  useEffect(() => {
    // This calculates how many orders there are for the current month/year
    setOrdersForCurrentDate(orders.length); // For now, let's set it to the total orders for the selected month/year
  }, [orders]);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        // Fetch data based on selected month and year
        const response = await axios.get(
          `/api/reportRoutes/pullOrderReportData/${year}/${month}`
        );
        const response2 = await axios.get(
          "/api/reportRoutes/pullAllOrdersReportData"
        );
        setTotalOrders(response2.data.length);
        setOrders(response.data);
      } catch (err) {
        setError("Failed to fetch orders.");
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
    setReportType("orders");
  }, [month, year]); // Re-run when month or year changes

  useEffect(() => {
    setOrders(orders);
    setTotalOrders(totalOrders);
  }, [orders, totalOrders]);

  // Handle the month and year change
  const handleMonthChange = (e) => {
    setMonth(e.target.value);
  };

  const handleYearChange = (e) => {
    setYear(e.target.value);
  };

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      const response = await axios.put(`/api/reportRoutes/${orderId}/status`, {
        status: newStatus, // Pass the new status to the backend
      });
  
      if (response.status === 200) {
        // Update the local state to reflect the new status
        const updatedOrders = orders.map((order) =>
          order._id === orderId ? { ...order, status: newStatus } : order
        );
        setOrders(updatedOrders);
        console.log("Order status updated successfully!");
      }
    } catch (error) {
      console.error("Failed to update order status:", error);
    }
  };
  
  

  const printReport = (reportRef) => {
    const chartImage = chartRef.current?.generatePNG();

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
              margin: 0;
              padding: 0;
              direction: rtl;
          }
          .container {
              width: 90%; /* Ensure the container is almost the full page width */
              max-width: 1200px; /* Limit the maximum width */
              margin: auto; /* Center the container horizontally */
              background: white;
              padding: 20px;
              border-radius: 10px;
              box-shadow: 0 4px 8px rgba(0,0,0,0.1);
          }
          table {
              width: 90vw; /* Make the table take full width of the container */
              border-collapse: collapse;
              margin: auto; /* Center the table horizontally */
              justify-self: center;
          }
          th, td {
              border: 1px solid #ddd;
              padding-right: 3px;
              padding-left: 3px;
              text-align: center; /* Center the content of all cells */
          }
          th {
              background-color: #f2f2f2;
          }
          .header {
              text-align: center;
              margin-bottom: 20px;
          }
          img {
              max-width: 90vw; /* Adjust width */
              max-height: 600px; /* Adjust height */
              object-fit: contain; /* Ensure proper scaling */
              display: block;
              margin: 20px auto; /* Center the image horizontally */
          }
          ul {
              list-style: none;
              padding: 0;
          }
          li {
              margin-bottom: 20px; /* Space between list items */
              text-align: center; /* Center the content inside list items */
              border-bottom: 1px solid #ddd; /* Add a bottom border to separate items */
              
          }
          li:last-child {
              border-bottom: none; /* Remove border for the last list item */
          }
          p {
              margin: 8px 0; /* Reduce vertical spacing between <p> tags */
          }
          </style>
      </head>
      <body>
          <div class="container">
          ${getTodaysDate()}
          ${reportRef.current.innerHTML}
          <h1>כמות הזמנות לפי שנה</h1>
          <img src="${chartImage}" alt="Order Chart" />
          </div>
      </body>
      </html>
    `);

    printDocument.close();

    printWindow.contentWindow.focus();
    setTimeout(() => {
      printWindow.contentWindow.print();
      // Cleanup: Remove the iframe after printing
      printWindow.parentNode.removeChild(printWindow);
    }, 1);
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
        onClick={() => printReport(reportRef)}
        className="bg-green-500 text-white px-4 py-2 rounded-lg mt-2 hover:bg-green-600"
      >
        הדפס דוח
      </button>
      <br />
      <div className="w-4/5 bg-white shadow-lg rounded-lg p-6">
        <div className="flex mx-auto justify-center">
          <div className="mx-2">
            <label htmlFor="month" className="block text-sm font-medium">
              בחר חודש:
            </label>
            <select
              id="month"
              value={month}
              onChange={handleMonthChange}
              className="border rounded px-3 py-2 text-sm"
            >
              {[...Array(12).keys()].map((i) => (
                <option key={i} value={i + 1}>
                  {i + 1}
                </option>
              ))}
            </select>
          </div>
          <div className="mx-2">
            <label htmlFor="year" className="block text-sm font-medium">
              בחר שנה:
            </label>
            <select
              id="year"
              value={year}
              onChange={handleYearChange}
              className="border rounded px-3 py-2 text-sm"
            >
              {[2020, 2021, 2022, 2023, 2024].map((yearOption) => (
                <option key={yearOption} value={yearOption}>
                  {yearOption}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div ref={reportRef} className="justify-self-center w-full">
          {reportType === "orders" && (
            <div>
              <h1 className="text-2xl font-bold text-center mt-4 mb-2">
                דוח הזמנות לחודש {month}/{year}
              </h1>
              <div className="flex justify-center my-2 gap-4"></div>
              <div className="bg-white rounded-lg p-2 mx-auto justify-center self-center mx-auto overflow-x-auto">
                <table
                  className="min-w-full table-auto text-left border-collapse text-center mx-auto"
                  dir="rtl"
                >
                  <thead className="bg-gray-100 border-b border-gray-200">
                    <tr>
                      <th className="text-left px-4 py-2 text-sm font-semibold text-gray-700 border border-gray-200"></th>
                      <th className="text-center px-4 py-2 text-sm font-semibold text-gray-700 border border-gray-200 ">
                        תאריך ביצוע
                      </th>
                      <th className="text-center px-4 py-2 text-sm font-semibold text-gray-700 border border-gray-200">
                        סטטוס
                      </th>
                      <th className="text-center px-4 py-2 text-sm font-semibold text-gray-700 border border-gray-200">
                        סה"כ לתשלום
                      </th>
                      <th className="text-center px-4 py-2 text-sm font-semibold text-gray-700 border border-gray-200">
                        פרטי לקוח
                      </th>
                      <th className="text-center px-4 py-2 text-sm font-semibold text-gray-700 border border-gray-200">
                        מוצרים
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.length === 0 ? (
                      <tr>
                        <td
                          colSpan="6"
                          className="text-center py-4 text-gray-500 border border-gray-200"
                        >
                          לא נמצאו הזמנות עבור {month}/{year}
                        </td>
                      </tr>
                    ) : (
                      orders.map((order, index) => (
                        <tr key={index} className="border-b hover:bg-gray-50">
                          <td className="px-4 py-2 border border-gray-200">
                            {index + 1}
                          </td>
                          <td className="px-4 py-2 border border-gray-200">
                            {formatDate(order.date)}
                          </td>
                          <td className="px-4 py-2 border border-gray-200">
                            <select
                              value={order.status} // Current status from the database
                              onChange={(e) => handleStatusChange(order._id, e.target.value)} // Send `_id` and new status
                              className="px-2 py-1 border rounded-lg bg-white text-gray-700 text-sm"
                            >
                              <option value="בטיפול">בטיפול</option>
                              <option value="טופל">טופל</option>
                            </select>
                          </td>
                          <td className="px-4 py-2 border border-gray-200">
                            ₪{parseFloat(order.totalOrderPrice).toFixed(2)}
                          </td>
                          <td className="px-4 py-2 border border-gray-200">
                            <p>שם מלא: {order.fullName}</p>
                            <p>טל: {order.phoneNumber}</p>
                            <p>כתובת: {order.location}</p>
                          </td>
                          <td className="px-4 py-2 border border-gray-200">
                            <ul className="list-disc list-inside">
                              {order.cart.map((product, idx) => (
                                <>
                                  <li
                                    key={idx}
                                    className="flex items-start justify-self-center my-2 text-center border-b border-gray-300 last:border-none"
                                  >
                                    <div>
                                      <p>שם: {product.productName}</p>
                                      <p>מק"ט: {product.sku}</p>

                                      <p dir="rtl">
                                        מחיר ליחידה: ₪{product.priceForOne}
                                      </p>
                                      <p>כמות: {product.amount}</p>
                                    </div>
                                  </li>
                                </>
                              ))}
                            </ul>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
              <h3 className="my-2">
                כמות הזמנות שבוצעו בתאריך שנבחר :{ordersForCurrentDate}
              </h3>
              <h3 className="my-2">
                כמות כוללת להזמנות שבוצעו עד כה :{totalOrders}
              </h3>
            </div>
          )}
        </div>
        <OrderChart ref={chartRef} />
      </div>
      <div className="w-full mt-auto flex-none">
        <Footer></Footer>
      </div>
    </div>
  );
};

export default OrderReport;
