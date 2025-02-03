'use client';
import BottomNavigation from '@/components/BottomNavigation';
import { useState, useEffect, useCallback } from 'react';
import { useTonConnectUI } from '@tonconnect/ui-react';
import { Address } from "@ton/core";

export default function Home() {
  const [tonConnectUI] = useTonConnectUI();
  const [tonWalletAddress, setTonWalletAddress] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const handleWalletConnection = useCallback((address: string) => {
    setTonWalletAddress(address);
    console.log("Wallet connected successfully!");
    setIsLoading(false);
  }, []);

  const handleWalletDisconnection = useCallback(() => {
    setTonWalletAddress(null);
    console.log("Wallet disconnected successfully!");
    setIsLoading(false);
  }, []);

  useEffect(() => {
    const checkWalletConnection = async () => {
      if (tonConnectUI.account?.address) {
        handleWalletConnection(tonConnectUI.account?.address);
      } else {
        handleWalletDisconnection();
      }
    };

    checkWalletConnection();

    const unsubscribe = tonConnectUI.onStatusChange((wallet) => {
      if (wallet) {
        handleWalletConnection(wallet.account.address);
      } else {
        handleWalletDisconnection();
      }
    });

    return () => {
      unsubscribe();
    };
  }, [tonConnectUI, handleWalletConnection, handleWalletDisconnection]);

  const handleWalletAction = async () => {
    if (tonConnectUI.connected) {
      setIsLoading(true);
      await tonConnectUI.disconnect();
    } else {
      await tonConnectUI.openModal();
    }
  };

  const formatAddress = (address: string) => {
    const tempAddress = Address.parse(address).toString();
    return `${tempAddress.slice(0, 4)}...${tempAddress.slice(-4)}`;
  };

  if (isLoading) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-gray-800 to-gray-900">
        <div className="bg-gray-700 text-white font-bold py-2 px-4 rounded shadow-lg animate-pulse">
          Loading...
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-gray-800 to-gray-900 text-white">
      <h1 className="text-4xl font-bold mb-8 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
        Connect TON wallet
      </h1>
      
      {tonWalletAddress ? (
        <div className="flex flex-col items-center">
          <p className="mb-4 text-lg bg-gray-700 py-2 px-4 rounded-lg shadow-md">
            Connected: <span className="font-mono">{formatAddress(tonWalletAddress)}</span>
          </p>
          <button
            onClick={handleWalletAction}
            className="bg-red-500 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-xl shadow-lg transition duration-300 ease-in-out transform hover:scale-105 mb-4"
          >
            Disconnect Wallet
          </button>
        </div>
      ) : (
        <button
          onClick={handleWalletAction}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-xl shadow-lg transition duration-300 ease-in-out transform hover:scale-105"
        >
          Connect Wallet
        </button>
      )}

      {/* قائمة المهام */}
      <div className="mt-8 w-full max-w-md bg-gray-800 p-6 rounded-lg shadow-lg">
        <h2 className="text-xl font-bold mb-4 text-center">Hints</h2>
        <ul className="space-y-3 text-lg">
          <li className="bg-gray-700 px-4 py-2 rounded-lg shadow">
            1️⃣ Invite friends 
          </li>
          <li className="bg-gray-700 px-4 py-2 rounded-lg shadow">
            2️⃣ collect point
          </li>
          <li className="bg-gray-700 px-4 py-2 rounded-lg shadow">
            3️⃣ connect wallet
          </li>
          <li className="bg-gray-700 px-4 py-2 rounded-lg shadow">
            4️⃣ wait...
          </li>
        </ul>
      </div>

      <BottomNavigation />
    </main>
  );
}
