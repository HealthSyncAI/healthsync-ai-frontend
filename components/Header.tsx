// components/Header.tsx
import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="bg-primary text-white p-4">
      <div className="container mx-auto flex justify-between items-center">
        <h1 className="text-xl font-semibold">Health Record System</h1>
        <nav>
          <ul className="flex space-x-4">
            <li>
              <a href="/" className="hover:text-gray-200">Home</a>
            </li>
            <li>
              <a href="/patients" className="hover:text-gray-200">Patients</a>
            </li>
            <li>
              <a href="/doctors" className="hover:text-gray-200">Doctors</a>
            </li>
            {/* Add more links as needed */}
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default Header;