'use client';

import React from 'react';
import Link from 'next/link';
import { LogOut } from 'react-feather';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

const NavBar = () => {
  const router = useRouter();
  const [userName, setUserName] = useState('');

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch('http://localhost:5000/get_user', {
          method: 'GET',
          credentials: 'include',
        });
        const data = await response.json();
        if (response.ok && data.user) {
          setUserName(data.user.name);
        } else {
          router.push('/signin');
        }
      } catch (error) {
        console.error('Error fetching user:', error);
        router.push('/signin');
      }
    };

    fetchUser();
  }, [router]);

  const handleLogout = async () => {
    try {
      await fetch('http://localhost:5000/logout', {
        method: 'POST',
        credentials: 'include',
      });
      router.push('/signin');
    } catch (error) {
      console.error('Logout failed', error);
    }
  };

  return (
    <div className="navbar">
      <div className="navbar-start">
        <div className="dropdown">
          <div tabIndex={0} role="button" className="btn btn-ghost btn-circle">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 text-primary"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 6h16M4 12h16M4 18h7"
              />
            </svg>
          </div>
          <ul
            tabIndex={0}
            className="menu menu-sm dropdown-content bg-white rounded-box z-[1] mt-3 w-52 p-2 shadow"
          >
            <li>
              <Link href={"/forms"}>Home Page</Link>
            </li>
            <li>
              <Link href={"/addforms"}>Add Forms</Link>
            </li>
          </ul>
        </div>
      </div>
      <div className="navbar-center">
        <Link href={"/forms"}>
          <img
            className="w-30 h-12"
            src="https://www2.0zz0.com/2024/12/22/07/158501144.png"
            alt=""
          />
        </Link>
      </div>
      <div className="navbar-end">
        <h1 className="mx-4 text-sm font-bold text-primary max-sm:hidden">
          Welcome {userName}
        </h1>
        <button className="btn btn-ghost text-primary btn-circle" onClick={handleLogout}>
          <div className="indicator">
            <LogOut />
          </div>
        </button>
      </div>
    </div>
  );
};

export default NavBar;
