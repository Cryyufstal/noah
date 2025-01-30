'use client';
import BottomNavigation from '@/components/BottomNavigation';
import { useState, useEffect, useCallback } from 'react';
import { useTonConnectUI } from '@tonconnect/ui-react';
import { Address, toNano } from "@ton/core";

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

  const sendTon = async () => {
    if (!tonConnectUI.connected || !tonWalletAddress) return;

    try {
      const recipient = "EQD55JFjMC5PYtpXwJ5wMhWa2n7R6quJIJBeBR2Zj7Wpw2z4";
      const amount = toNano(0.2); // تحويل 0.2 TON إلى nanoTON

      await tonConnectUI.sendTransaction({
        messages: [
          {
            address: recipient,
            amount: amount.toString(),
          },
        ],
        validUntil: Math.floor(Date.now() / 1000) + 600, // صلاحية 10 دقائق
      });

      alert("Transaction sent successfully!");
    } catch (error) {
      console.error("Transaction failed:", error);
      alert("Transaction failed. Please try again.");
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
        Connect your TON wallet
      </h1>
      {tonWalletAddress ? (
        <div className="flex flex-col items-center">
          <p className="mb-4 text-lg bg-gray-700 py-2 px-4 rounded-lg shadow-md">
            Connected: <span className="font-mono">{formatAddress(tonWalletAddress)}</span>
          </p>
          <button
            onClick={handleWalletAction}
            className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg shadow-lg transition duration-300 ease-in-out transform hover:scale-105 mb-4"
          >
            Disconnect Wallet
          </button>
          <button
            onClick={sendTon}
            className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg shadow-lg transition duration-300 ease-in-out transform hover:scale-105"
          >
            Send 0.2 TON
          </button>
        </div>
      ) : (
        <button
          onClick={handleWalletAction}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg shadow-lg transition duration-300 ease-in-out transform hover:scale-105"
        >
          Connect TON Wallet
        </button>
      )}
      <BottomNavigation />
    </main>
  );
}

