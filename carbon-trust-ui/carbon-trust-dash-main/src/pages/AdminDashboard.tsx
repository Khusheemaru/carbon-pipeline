// src/pages/AdminDashboard.tsx
import { useState } from "react";
import { ethers } from "ethers";
import CreditTokenABI from "../lib/CreditTokenABI.json";


export default function AdminDashboard(){
    const [isMinting, setIsMinting] = useState(false);

    // --- Add your deployed contract address here ---
    const contractAddress = "0xe2845a07c6d5089ac86556d9f8453a677daeadc9";

    const handleMint = async () => {
      if (typeof window.ethereum === "undefined" || !contractAddress) {
        return alert("Please install MetaMask and add the contract address.");
      }
      setIsMinting(true);
      console.log("Minting process started...");

      try {
        // Step 1: Initialize provider, telling it to accept any network at first
        const provider = new ethers.BrowserProvider(window.ethereum, "any");
        console.log("Provider initialized.");

        // Step 2: Request account access from MetaMask
        await provider.send("eth_requestAccounts", []);
        const signer = await provider.getSigner();
        console.log("Signer obtained:", signer.address);

        // Step 3: Create the contract instance connected to the signer
        const creditTokenContract = new ethers.Contract(
          contractAddress,
          CreditTokenABI,
          signer
        );
        console.log("Contract instance created. Sending transaction...");

        // Step 4: Call the safeMint function
        const transaction = await creditTokenContract.safeMint(signer.address, {
          gasLimit: 500000,
        });
        console.log("Transaction sent. Hash:", transaction.hash);

        console.log("Waiting for transaction confirmation...");
        await transaction.wait();
        console.log("Transaction confirmed!");

        alert(`Successfully minted a new Carbon Credit Token!`);
      } catch (error) {
        console.error("MINTING FAILED:", error);
        alert(
          `Minting failed. Reason: ${
            error.reason || error.message
          }. Check console for details.`
        );
      }
      setIsMinting(false);
    };

    return (
      <div className="p-8 text-white">
        <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
        <p className="mb-4">
          This is the control panel for platform administrators.
        </p>
        <div className="mb-6">
          <button
            onClick={handleMint}
            disabled={isMinting}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:bg-gray-500"
          >
            {isMinting ? "Minting..." : "Mint Test Credit"}
          </button>
        </div>
        {/* We will add more admin features here later */}
      </div>
    );
}





