"use client";

import Link from 'next/link';
import './globals.css';
import { useEffect, useState } from 'react';
import { auth } from '../../firebaseConfig';
import firebase from 'firebase/compat/app';
import { useRouter } from 'next/navigation';

const Layout = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<firebase.User | null>(null);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [showDeleteWarning, setShowDeleteWarning] = useState<boolean>(false);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    await auth.signOut();
    setShowModal(false);
    router.push('/login'); 
  };

  const handleDeleteAccount = async () => {
    if (user) {
      await user.delete();
      setUser(null);
      setShowModal(false);
      setShowDeleteWarning(false);
      router.push('/');
    }
  };

  const confirmDeleteAccount = () => {
    setShowDeleteWarning(true);
  };

  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body>
        <nav className="bg-gray-800 p-4">
          <div className="container mx-auto flex justify-between">
            <div className="text-white">
              <Link href="/">Home</Link>
            </div>
            <div className="space-x-4 text-white flex items-center">
              <Link href="/chart">Chart</Link>
              {user ? (
                <span
                  onClick={() => setShowModal(true)}
                  className="cursor-pointer"
                >
                  Account
                </span>
              ) : (
                <Link href="/login">Login/Register</Link>
              )}
            </div>
          </div>
        </nav>
        <main>{children}</main>

        {showModal && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white p-6 rounded shadow-md w-full max-w-sm">
              <h2 className="text-xl font-bold mb-4">User Details</h2>
              <p>Email: {user?.email}</p>
              <button onClick={handleLogout} className="w-full bg-red-500 text-white p-2 rounded hover:bg-red-700 mt-4">
                Logout
              </button>
              <button onClick={confirmDeleteAccount} className="w-full bg-red-500 text-white p-2 rounded hover:bg-red-700 mt-4">
                Delete Account
              </button>
              <button onClick={() => setShowModal(false)} className="w-full bg-gray-500 text-white p-2 rounded hover:bg-gray-700 mt-4">
                Close
              </button>
            </div>
          </div>
        )}

        {showDeleteWarning && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white p-6 rounded shadow-md w-full max-w-sm">
              <h2 className="text-xl font-bold mb-4">Confirm Delete</h2>
              <p>Are you sure you want to delete your account? This action cannot be undone.</p>
              <button onClick={handleDeleteAccount} className="w-full bg-red-500 text-white p-2 rounded hover:bg-red-700 mt-4">
                Confirm Delete
              </button>
              <button onClick={() => setShowDeleteWarning(false)} className="w-full bg-gray-500 text-white p-2 rounded hover:bg-gray-700 mt-4">
                Cancel
              </button>
            </div>
          </div>
        )}
      </body>
    </html>
  );
};

export default Layout;