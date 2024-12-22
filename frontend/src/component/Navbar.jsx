import { useState } from "react";
import { Link } from "react-scroll";
import { useNavigate } from "react-router-dom";

const Navbar = () => {
  const logoUrl = `${process.env.PUBLIC_URL}/SSE_logo.png`;
  const navigate = useNavigate();

  const [toggleMenu, setToggleMenu] = useState(false);
  const handleLogin = () => {
    navigate("/login");
  };
  return (
    <nav className="relative container mx-auto p-6">
      {/* Flex Container */}
      <div className="flex items-center justify-between">
        {/* Logo */}
        <div className="pt-2 w-[8rem] h-[4.5rem]">
          <img src={logoUrl} alt="" />
        </div>
        {/* Menu Items */}
        <div className="hidden space-x-6 md:flex">
          <Link
            to="contact"
            smooth={true}
            duration={500}
            className="hover:text-darkGrayishBlue cursor-pointer"
          >
            Contact us
          </Link>

          <Link
            to="AboutUs"
            smooth={true}
            duration={500}
            className="hover:text-darkGrayishBlue cursor-pointer"
          >
            About us
          </Link>
          <Link to="#" className="hover:text-darkGrayishBlue"></Link>
        </div>
        {/* Button */}
        <button>
          <Link
            onClick={handleLogin}
            to="/login"
            className="hidden p-3 px-6 pt-2 text-white bg-green-500 rounded-full baseline hover:bg-green-600 md:block"
          >
            Sign in
          </Link>
        </button>
        {/* Hamburger Icon */}
        <button
          className={
            toggleMenu
              ? "open block hamburger md:hidden focus:outline-none"
              : "block hamburger md:hidden focus:outline-none"
          }
          onClick={() => setToggleMenu(!toggleMenu)}
        >
          <span className="hamburger-top"></span>
          <span className="hamburger-middle"></span>
          <span className="hamburger-bottom"></span>
        </button>
      </div>

      {/* Mobile Menu */}
      <div className="md:hidden">
        <div
          className={
            toggleMenu
              ? "absolute flex flex-col items-center self-end py-8 mt-10 space-y-6 font-bold bg-white sm:w-auto sm:self-center left-6 right-6 drop-shadow-md"
              : "absolute flex-col items-center hidden self-end py-8 mt-10 space-y-6 font-bold bg-white sm:w-auto sm:self-center left-6 right-6 drop-shadow-md"
          }
        >
          <Link to="contact">Contact Us</Link>
          <Link to="AboutUs">About Us</Link>
          <Link onClick={handleLogin}>Sign in</Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
