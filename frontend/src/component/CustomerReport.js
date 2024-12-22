import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';  // You don't need useParams anymore
import '../App.css';
import Header from "../pages/header";
import Footer from "../pages/footer";
import axios from 'axios';
import OrderChart from './ordersGraph';
const CustomerReport=()=>{
    const [customers, setcustomers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [amountOfCustomers, setAmountOfCustomers] = useState(0);
    useEffect(() =>{
        setAmountOfCustomers(customers.length); 
    },[customers]);
    useEffect(()=>{
        const fetchCustomers= async ()=>{
            try {
                const response = await axios.get('/api/reportRoutes/pullAllCustomers');
                setcustomers(response.data);

            } catch (err) {
                setError("Failed to fetch orders.");

                
            }finally{
                setLoading(false);

            }
        };
        fetchCustomers();

    });
    if (loading) {
        return <div>Loading...</div>;
      }
    if (error) {
        return <div>{error}</div>;
    }
    return (
        <div>
          <Header />
          <h1 className='text-2xl font-bold text-center my-4'> דוח לקוחות </h1>
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border border-gray-200 rounded-lg shadow-md">
              <thead className="bg-gray-100 border-b border-gray-200">
                <tr>
                  <th className="text-center px-4 py-2 text-sm font-semibold text-gray-700 border border-gray-200"></th>
                  <th className="text-center px-4 py-2 text-sm font-semibold text-gray-700 border border-gray-200">שם מלא</th>
                  <th className="text-center px-4 py-2 text-sm font-semibold text-gray-700 border border-gray-200">בית עסק</th>
                  <th className="text-center px-4 py-2 text-sm font-semibold text-gray-700 border border-gray-200">מיקום</th>
                  <th className="text-center px-4 py-2 text-sm font-semibold text-gray-700 border border-gray-200">טל</th>
                  <th className="text-center px-4 py-2 text-sm font-semibold text-gray-700 border border-gray-200">מספר ת.ז</th>
                </tr>
              </thead>
              <tbody>
                {customers.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center py-4 text-gray-500 border border-gray-200">
                      לא נמצאו נתונים להצגה
                    </td>
                  </tr>
                ) : (
                    customers.map((customer, index) => (
                    <tr key={index} className={index % 2 === 0 ? "bg-gray-50" : "bg-white"}>
                      <td className="px-4 py-2 border border-gray-200">{index + 1}</td>
                      <td className="px-4 py-2 border border-gray-200">{customer.fullName}</td>
                      <td className="px-4 py-2 border border-gray-200">{customer.shopName}</td>
                      <td className="px-4 py-2 border border-gray-200">{customer.location}</td>
                      <td className="px-4 py-2 border border-gray-200">{customer.phoneNumber}</td>
                      <td className="px-4 py-2 border border-gray-200">{customer.customerId}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
            <h3>כמות לקוחות פעילים:{customers.length}</h3>
          </div>
        </div>
      );
      
}
export default CustomerReport;