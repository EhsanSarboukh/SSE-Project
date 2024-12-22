import React, { useState } from "react";
import axios from "axios";
import { useNavigate, Navigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUser } from "@fortawesome/free-solid-svg-icons";
import LoginWithGoogle from "./loginWithGoogle";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const logoURL = `${process.env.PUBLIC_URL}/SSE_logo.png`;

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    try {
      const response = await axios.post(
        "http://localhost:5000/userRoutes/login",
        { username, password }
      );
      if (response.data.accessToken) {
        localStorage.setItem("token", response.data.accessToken);
        localStorage.setItem("businessName", response.data.businessName);
        navigate("/order", {
          state: { businessName: response.data.businessName },
        });
      } else {
        setErrorMessage(
          response.data.message || "Invalid username or password."
        );
      }
    } catch (error) {
      if (error.response && error.response.status === 401) {
        setErrorMessage("Invalid username or password.");
      } else {
        setErrorMessage("An error occurred while logging in.");
      }
    }
  };

  /*if (localStorage.getItem("token")) {
    return <Navigate to="/order" />;96
  }*/

  return (
    <div>

      <div className="min-h-screen bg-gray-100 text-gray-900 flex justify-center">
        <div className="max-w-screen-xl m-0 sm:m-10 bg-white shadow sm:rounded-lg flex justify-center flex-1">
          <div className="lg:w-1/2 xl:w-5/12 p-6 sm:p-12">
            <div>
              <img src={logoURL} alt="Logo" className="mx-auto w-32" />
            </div>
            <div className="mt-12 flex flex-col items-center">
              <div className="w-full flex-1 mt-8">
                <LoginWithGoogle />
                <div className="my-12 border-b text-center">
                  <div className="leading-none px-2 inline-block text-sm text-gray-600 tracking-wide font-medium bg-white transform translate-y-1/2">
                    Or sign in with your account
                  </div>
                </div>

                <form onSubmit={handleLoginSubmit} className="mx-auto max-w-xs">
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Username"
                    className="w-full px-8 py-4 rounded-lg font-medium bg-gray-100 border border-gray-200 placeholder-gray-500 text-sm focus:outline-none focus:border-gray-400 focus:bg-white"
                    required
                  />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Password"
                    className="w-full px-8 py-4 rounded-lg font-medium bg-gray-100 border border-gray-200 placeholder-gray-500 text-sm focus:outline-none focus:border-gray-400 focus:bg-white mt-5"
                    required
                  />
                  <div className="flex items-center justify-between mt-5">
                    <label className="inline-flex items-center text-sm text-gray-600">
                      <input
                        type="checkbox"
                        checked={showPassword}
                        onChange={() => setShowPassword((prev) => !prev)}
                        className="mr-2 rounded"
                      />
                      Show Password
                    </label>
                  </div>
                  <button
                    type="submit"
                    className="mt-5 tracking-wide font-semibold bg-green-400 text-white w-full py-4 rounded-lg hover:bg-green-700 transition-all duration-300 ease-in-out flex items-center justify-center focus:shadow-outline focus:outline-none"
                  >
                    <FontAwesomeIcon icon={faUser} className="w-6 h-6 -ml-2" />
                    <span className="ml-2">Login</span>
                  </button>
                  {errorMessage && (
                    <p className="text-red-500 text-center mt-4">
                      {errorMessage}
                    </p>
                  )}
                </form>
                <p className="mt-6 text-xs text-gray-600 text-center">
                  By logging in, you agree to our
                  <a
                    href="#"
                    className="border-b border-gray-500 border-dotted mx-1"
                  >
                    Terms of Service
                  </a>
                  and
                  <a
                    href="#"
                    className="border-b border-gray-500 border-dotted mx-1"
                  >
                    Privacy Policy
                  </a>
                </p>
              </div>
            </div>
          </div>
          {/* Right Side - Image Section */}
          <div className="flex-1 bg-green-100 text-center hidden lg:flex">
            <div
              className="m-12 xl:m-16 w-full bg-contain bg-center bg-no-repeat"
              style={{
                backgroundImage: "url('/images/Login.jpg')", // Direct path from public folder,
              }}
            >
              {/* Optionally, you can place text or additional content inside */}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
