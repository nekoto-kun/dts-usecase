import { Bars3Icon, ShoppingCartIcon, XMarkIcon } from '@heroicons/react/24/outline';
import React, { useState } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';

const Layout = ({ cartId }) => {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-blue-600 text-white shadow-md">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <Link to="/" className="text-2xl font-bold">E-Shop</Link>
              <nav className="hidden md:flex space-x-4">
                <Link
                  to="/"
                  className={`hover:text-blue-200 ${location.pathname === '/' ? 'font-semibold' : ''}`}
                >
                  Products
                </Link>
                <Link
                  to="/manage-products"
                  className={`hover:text-blue-200 ${location.pathname === '/manage-products' ? 'font-semibold' : ''}`}
                >
                  Manage Products
                </Link>
                <Link
                  to="/orders"
                  className={`hover:text-blue-200 ${location.pathname === '/orders' ? 'font-semibold' : ''}`}
                >
                  Orders
                </Link>
                <Link
                  to="/system-status"
                  className={`hover:text-blue-200 ${location.pathname === '/system-status' ? 'font-semibold' : ''}`}
                >
                  System Status
                </Link>
              </nav>
            </div>
            <div className="flex items-center space-x-4">
              {cartId && (
                <Link
                  to="/cart"
                  className="flex items-center space-x-1 hover:text-blue-200"
                  onClick={closeMobileMenu}
                >
                  <ShoppingCartIcon className="h-6 w-6" />
                  <span>Cart</span>
                </Link>
              )}

              {/* Mobile menu button */}
              <button
                className="md:hidden text-white focus:outline-none"
                onClick={toggleMobileMenu}
                aria-label="Toggle menu"
              >
                {mobileMenuOpen ? (
                  <XMarkIcon className="h-6 w-6" />
                ) : (
                  <Bars3Icon className="h-6 w-6" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile drawer menu */}
        <div
          className={`md:hidden fixed inset-0 z-50 bg-blue-700 transform transition-transform duration-300 ease-in-out ${mobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
            }`}
          style={{ top: '69px' }}
        >
          <div className="flex flex-col px-4 py-6 space-y-4">
            <Link
              to="/"
              className={`text-lg hover:text-blue-200 ${location.pathname === '/' ? 'font-semibold' : ''}`}
              onClick={closeMobileMenu}
            >
              Products
            </Link>
            <Link
              to="/manage-products"
              className={`text-lg hover:text-blue-200 ${location.pathname === '/manage-products' ? 'font-semibold' : ''}`}
              onClick={closeMobileMenu}
            >
              Manage Products
            </Link>
            <Link
              to="/orders"
              className={`text-lg hover:text-blue-200 ${location.pathname === '/orders' ? 'font-semibold' : ''}`}
              onClick={closeMobileMenu}
            >
              Orders
            </Link>
            <Link
              to="/system-status"
              className={`text-lg hover:text-blue-200 ${location.pathname === '/system-status' ? 'font-semibold' : ''}`}
              onClick={closeMobileMenu}
            >
              System Status
            </Link>
          </div>
        </div>

        {/* Backdrop for mobile menu */}
        {mobileMenuOpen && (
          <div
            className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
            style={{ top: '69px' }}
            onClick={closeMobileMenu}
          ></div>
        )}
      </header>

      <main className="container mx-auto px-4 py-6 flex-grow">
        <Outlet />
      </main>

      <footer className="bg-gray-800 text-white py-6">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <h2 className="text-xl font-bold">E-Shop Demo</h2>
              <p className="text-gray-400 text-sm">A demonstration of microservices architecture</p>
            </div>
            <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-4 text-center md:text-left">
              <div>
                <h3 className="font-semibold">Microservices</h3>
                <ul className="text-sm text-gray-400">
                  <li>Catalog Service</li>
                  <li>Cart Service</li>
                  <li>Order Service</li>
                </ul>
              </div>
            </div>
          </div>
          <div className="mt-6 border-t border-gray-700 pt-4 text-center text-sm text-gray-400">
            &copy; {new Date().getFullYear()} E-Shop Demo. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;