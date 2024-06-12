"use client";

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { auth } from '../../firebaseConfig';
import firebase from 'firebase/compat/app';
import { useRouter } from 'next/navigation';

const Home = () => {
  const [user, setUser] = useState<firebase.User | null>(null);
  const [showModal, setShowModal] = useState<boolean>(false);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    await auth.signOut();
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center">
      <h1 className="text-4xl font-bold mb-4">Welcome to the Stock Tracker App</h1>
      <p className="text-lg mb-8 text-center max-w-xl">
        This application allows you to track stock index values, view graphical representations of index data, and set alerts for price thresholds.
      </p>
      <nav>
        <ul className="flex space-x-4">
          <li>
            <Link href="/chart">
              <span className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-700 cursor-pointer">View Stock Chart</span>
            </Link>
          </li>
        </ul>
      </nav>
    </div>
  );
};

export default Home;