import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

// Registering Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

// ForwardRef to expose methods for generating the PNG image
const OrderChart = React.forwardRef((_, ref) => {
  const [chartData, setChartData] = useState(null); // Holds the chart data
  const [isLoading, setIsLoading] = useState(true); // Loading state for better user experience
  const chartRef = useRef(); // Ref to access the canvas element rendered by Chart.js

  useEffect(() => {
    // Fetch the data for the chart
    const fetchOrders = async () => {
      try {
        const response = await axios.get(
          "/api/reportRoutes/pullAllOrdersReportData"
        ); // Replace with your endpoint
        const orders = response.data;

        if (Array.isArray(orders) && orders.length > 0) {
          const yearCount = {};

          // Count orders by year
          orders.forEach((order) => {
            if (order.date) {
              const orderYear = new Date(order.date).getFullYear();
              yearCount[orderYear] = (yearCount[orderYear] || 0) + 1;
            }
          });

          // Prepare the chart data
          const years = Object.keys(yearCount);
          const counts = Object.values(yearCount);

          setChartData({
            labels: years,
            datasets: [
              {
                label: "כמות הזמנות",
                data: counts,
                backgroundColor: "rgba(75, 192, 192, 0.2)",
                borderColor: "rgba(75, 192, 192, 1)",
                borderWidth: 1,
              },
            ],
          });
        } else {
          console.warn("No orders data available for the chart.");
        }
      } catch (error) {
        console.error("Error fetching chart data:", error);
      } finally {
        setIsLoading(false); // Stop loading regardless of success or failure
      }
    };

    fetchOrders(); // Fetch chart data on component mount
  }, []);

  // Expose the method to generate a PNG image via the ref
  React.useImperativeHandle(ref, () => ({
    generatePNG: () => {
      if (chartRef.current && chartRef.current.canvas) {
        return chartRef.current.canvas.toDataURL("image/png"); // Convert the canvas to a PNG image
      }
      return null; // Return null if the canvas is not available
    },
  }));

  // Show loading state
  if (isLoading) {
    return <div>Loading chart...</div>;
  }

  // Show error state if data is not available
  if (!chartData) {
    return <div>No data available to display.</div>;
  }

  // Render the chart
  return (
    <div className="flex justify-center items-center p-4">
      <div className="w-full max-w-xl">
        <h2 className="text-center text-xl font-semibold mb-4">
          כמות הזמנות לפי שנה
        </h2>
        <div className="relative">
          <Bar
            ref={chartRef} // Attach the ref to the Bar component
            data={chartData}
            options={{
              responsive: true,
              maintainAspectRatio: false, // Adjust chart size dynamically
              scales: {
                y: {
                  ticks: {
                    stepSize: 1, // Ensure only whole numbers
                    callback: (value) =>
                      Number.isInteger(value) ? value : null, // Display only integers
                  },
                  beginAtZero: true, // Start Y-axis at 0
                },
              },
            }}
            className="h-64" // Set chart height
          />
        </div>
      </div>
    </div>
  );
});

export default OrderChart;
