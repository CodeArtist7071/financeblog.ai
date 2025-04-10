import { useState } from "react";
import { Link, useLocation } from "wouter";
import { BookOpen } from "lucide-react";

const Header = () => {
  const [location] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const navItems = [
    { name: "Home", path: "/" },
    { name: "Articles", path: "/" },
    { name: "Categories", path: "/" },
    { name: "About", path: "/" }
  ];

  return (
    <header className="bg-white shadow-sm sticky top-0 z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex-shrink-0 flex items-center">
              <BookOpen className="h-8 w-8 text-primary" />
              <span className="ml-2 text-xl font-bold text-secondary">DevBlog</span>
            </Link>
            <nav className="hidden md:ml-8 md:flex md:space-x-8">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.path}
                  className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                    location === item.path
                      ? "border-primary text-gray-900"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  {item.name}
                </Link>
              ))}
            </nav>
          </div>
          
          <div className="flex items-center">
            <div className="hidden md:block">
              <div className="ml-4 flex items-center md:ml-6">
                <button
                  type="button"
                  className="p-1 rounded-full text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                  aria-label="Search"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </button>
              </div>
            </div>
            
            <div className="-mr-2 flex md:hidden">
              <button
                type="button"
                onClick={toggleMobileMenu}
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary"
                aria-expanded="false"
              >
                <span className="sr-only">Open main menu</span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="block h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div className={`md:hidden ${mobileMenuOpen ? "" : "hidden"}`} id="mobile-menu">
        <div className="pt-2 pb-3 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.name}
              href={item.path}
              className={`${
                location === item.path
                  ? "bg-primary bg-opacity-10 border-l-4 border-primary text-primary"
                  : "border-l-4 border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700"
              } block pl-3 pr-4 py-2 text-base font-medium`}
            >
              {item.name}
            </Link>
          ))}
        </div>
      </div>
    </header>
  );
};

export default Header;
