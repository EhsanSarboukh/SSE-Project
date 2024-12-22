import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./App.css";
import Login from "./services/login";
//import Home from "./pages/home";
import ViewOrderDetails from "./component/view-order-details";
import PrivateRoute from "./component/privateRoutes";
import Order from "./component/order";
import Inventory from "./component/inventory";
import CustomerForm from "./component/CustomerForm";
import Hero from "./component/Hero";
import Loading from "./component/Loading";
import OrderDetails from "./component/OrderDetails";
import ReportsPage from "./component/ReportsPage";
import InventoryReport from "./component/InventoryReport";
import OrderReport from "./component/OrderReport";
import CustomerReport from "./component/CustomerReport";
import HomePage from "./component/HomePage";
import Contact from "./pages/contactUs";
import  About from "./pages/aboutSSE";
import PrivacyPolicy from "./pages/privacyPolicy";
function App() {
  window.onbeforeunload = function () {
    const dbName = "OrderDB"; // Replace with your database name

    const request = indexedDB.open(dbName);

    request.onsuccess = function (event) {
      const db = event.target.result;

      // Open a transaction to clear the "cart" store
      const transactionCart = db.transaction(["cart"], "readwrite");
      const cartStore = transactionCart.objectStore("cart");
      const clearCart = cartStore.clear();
      clearCart.onsuccess = function () {
        console.log("Cart store cleared.");
      };
      clearCart.onerror = function (event) {
        console.error("Failed to clear Cart store:", event.target.error);
      };

      // Open a transaction to clear the "items" store
      const transactionItems = db.transaction(["items"], "readwrite");
      const itemsStore = transactionItems.objectStore("items");
      const clearItems = itemsStore.clear();
      clearItems.onsuccess = function () {
        console.log("Items store cleared.");
      };
      clearItems.onerror = function (event) {
        console.error("Failed to clear Items store:", event.target.error);
      };
    };

    request.onerror = function (event) {
      console.error("Failed to open IndexedDB:", event.target.error);
    };
  };

  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/Login" element={<Login />} />

          <Route
            path="/Home"
            element={
              <PrivateRoute>
                <HomePage />{" "}
              </PrivateRoute>
            }
          />

          <Route
            path="/View-order-details"
            element={
              <PrivateRoute>
                <ViewOrderDetails />
              </PrivateRoute>
            }
          />
          
          <Route
            path="/Privacy-Policy"
            element={
              <PrivateRoute>
                <PrivacyPolicy />
              </PrivateRoute>
            }
          />
              <Route
            path="/contact-us"
            element={
              <PrivateRoute>
                <Contact />
              </PrivateRoute>
            }
          />
               <Route
            path="/About-SSE"
            element={
              <PrivateRoute>
                <About />
              </PrivateRoute>
            }
          />
          <Route
            path="/Order"
            element={
              <PrivateRoute>
                <Order />
              </PrivateRoute>
            }
          />
          <Route
            path="/View-Inventory"
            element={
              <PrivateRoute>
                <Inventory />
              </PrivateRoute>
            }
          />
          <Route
            path="/Customer-Details"
            element={
              <PrivateRoute>
                <CustomerForm />
              </PrivateRoute>
            }
          />
          <Route path="/" element={<Hero />} />
          <Route
            path="/testing"
            element={
              <PrivateRoute>
                <Loading />
              </PrivateRoute>
            }
          ></Route>
          <Route
            path="/order-details"
            element={
              <PrivateRoute>
                <OrderDetails />
              </PrivateRoute>
            }
          />
          <Route
            path="/report"
            element={
              <PrivateRoute>
                <ReportsPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/inventoryReport"
            element={
              <PrivateRoute>
                <InventoryReport />
              </PrivateRoute>
            }
          />
          <Route
            path="/orderReport"
            element={
              <PrivateRoute>
                <OrderReport />
              </PrivateRoute>
            }
          />
          <Route
            path="/customerReport"
            element={
              <PrivateRoute>
                <CustomerReport />
              </PrivateRoute>
            }
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
