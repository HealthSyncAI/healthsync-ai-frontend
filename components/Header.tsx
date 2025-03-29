// components/Header.tsx
import Link from 'next/link';
import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="bg-primary text-white p-4">
      <div className="container mx-auto flex justify-between items-center">
        <h1 className="text-xl font-semibold">Health Record System</h1>
        <nav>
          <ul className="flex space-x-4">
            <li>
              <Link href="/" className="hover:text-gray-200">Home</Link>
            </li>
            <li>
              <Link href="/patients" className="hover:text-gray-200">Patients</Link>
            </li>
            <li>
              <Link href="/doctors" className="hover:text-gray-200">Doctors</Link>
            </li>
            {/* Add more links as needed */}
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default Header;