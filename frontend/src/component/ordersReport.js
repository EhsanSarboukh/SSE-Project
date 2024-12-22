import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';  // You don't need useParams anymore
import '../App.css';
import Header from "../pages/header";
import Footer from "../pages/footer";
import axios from 'axios';
import OrderChart from './ordersGraph';
const OrderReport = () => {
  // State to hold the orders data



  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [ordersForCurrentDate, setOrdersForCurrentDate] = useState(0);
  const [totalOrders, setTotalOrders] = useState(0);



  // State for selected month and year
  const [month, setMonth] = useState(new Date().getMonth() + 1); // Default to current month
  const [year, setYear] = useState(new Date().getFullYear()); // Default to current year

  const navigate = useNavigate();
  useEffect(() => {
    // This calculates how many orders there are for the current month/year
    setOrdersForCurrentDate(orders.length); // For now, let's set it to the total orders for the selected month/year

  }, [orders]);
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        // Fetch data based on selected month and year
        const response = await axios.get(`/api/reportRoutes/pullOrderReportData/${year}/${month}`);
        const response2 = await axios.get('/api/reportRoutes/pullAllOrdersReportData');
        setTotalOrders(response2.data.length);
        setOrders(response.data);
      } catch (err) {
        setError("Failed to fetch orders.");
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [month, year]);  // Re-run when month or year changes

  // Handle the month and year change
  const handleMonthChange = (e) => {
    setMonth(e.target.value);
  };

  const handleYearChange = (e) => {
    setYear(e.target.value);
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0'); // החודש ב-JavaScript מתחיל מ-0
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };
  return (
    <div>
      <Header />
      <h1 className="text-2xl font-bold text-center my-4">
        דוח הזמנות לחודש {month}/{year}
      </h1>

      <div className="flex justify-center my-4 gap-4">
        <div>
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
        <div>
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
      </div><div className="overflow-x-auto">
  <table className="min-w-full bg-white border border-gray-200 rounded-lg shadow-md">
    <thead className="bg-gray-100 border-b border-gray-200">
      <tr>
        <th className="text-left px-4 py-2 text-sm font-semibold text-gray-700 border border-gray-200">
          
        </th>
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
          <td colSpan="6" className="text-center py-4 text-gray-500 border border-gray-200">
            לא נמצאו הזמנות עבור {month}/{year}
          </td>
          
        </tr>
        
      ) : (

        orders.map((order, index) => (

          <tr key={index} className="border-b hover:bg-gray-50">
            <td className="px-4 py-2 border border-gray-200">{index + 1}</td>
            <td className="px-4 py-2 border border-gray-200">{formatDate(order.date)}</td>
            <td className="px-4 py-2 border border-gray-200">{order.status}</td>
            <td className="px-4 py-2 border border-gray-200">{order.totalOrderPrice}</td>
            <td className="px-4 py-2 border border-gray-200">
              <p>שם מלא: {order.fullName}</p>
              <p>טל: {order.phoneNumber}</p>
              <p>כתובת: {order.location}</p>
            </td>
            <td className="px-4 py-2 border border-gray-200">
              <ul className="list-disc list-inside">
                {order.cart.map((product, idx) => (
                  <ul className="list-disc list-inside pl-4">
  {order.cart.map((product, idx) => (
    <li key={idx} className="flex items-start">
      <span className="mr-2">•</span> {/* נקודה בצד שמאל */}
      <div>
        <p>{product.name} (SKU: {product.sku})</p>
        <p>מחיר ליחידה: {product.priceForOne}</p>
        <p>כמות: {product.amount}</p>
      </div>
    </li>
  ))}
</ul>
                ))}
              </ul>
            </td>
          </tr>
        ))
      )}
    </tbody>
  </table>
  <br />
  <h3>כמות הזמנות שבוצעו בתאריך שנבחר :{ordersForCurrentDate}</h3>
  <br />
  <h3>כמות כוללת להזמנות שבוצעו עד כה :{totalOrders}</h3>
  <br />
  <br />

  <OrderChart  />

</div>
      <Footer />
    </div>
  );
};

export default OrderReportOld;
