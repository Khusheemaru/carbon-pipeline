// src/pages/MyPortfolio.tsx
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ethers } from "ethers";
import { supabase } from "../lib/supabaseClient";
import CreditTokenABI from "../lib/CreditTokenABI.json";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Recycle } from "lucide-react";

const contractAddress = "0x9729daf7c5815205cd133cb7dbb5ee7eb07928d8"; 

export default function MyPortfolio() {
  const [ownedTokens, setOwnedTokens] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [retiringId, setRetiringId] = useState<number | null>(null);

  async function fetchOwnedTokens() {
    if (typeof window.ethereum === "undefined") return;
    setLoading(true);

    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const userAddress = await signer.getAddress();
    const contract = new ethers.Contract(
      contractAddress,
      CreditTokenABI,
      provider
    );

    const totalSupply = await contract.totalSupply();
    const tokens = [];

    // This is a simple method for demos. For production, a more efficient indexer would be used.
    for (let i = 1; i <= totalSupply; i++) {
      try {
        const owner = await contract.ownerOf(i);
        if (owner.toLowerCase() === userAddress.toLowerCase()) {
          tokens.push(i);
        }
      } catch (error) {
        // This token might have been burned, so ownerOf will fail. We can ignore it.
      }
    }

    setOwnedTokens(tokens);
    setLoading(false);
  }

  useEffect(() => {
    fetchOwnedTokens();
  }, []);

  const handleRetire = async (tokenId: number) => {
    setRetiringId(tokenId);
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(
        contractAddress,
        CreditTokenABI,
        signer
      );

      const transaction = await contract.burn(tokenId);
      await transaction.wait();

      alert(`Token #${tokenId} has been successfully retired (burned)!`);
      fetchOwnedTokens(); // Refresh the list of tokens
    } catch (error) {
      console.error("Retirement failed:", error);
      alert("Retirement failed. Check the console for details.");
    }
    setRetiringId(null);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="container mx-auto">
        <Link
          to="/dashboard"
          className="flex items-center gap-2 text-green-400 hover:underline mb-6 w-fit"
        >
          <ArrowLeft size={18} />
          Back to Dashboard
        </Link>
        <h1 className="text-4xl font-bold mb-8">My Carbon Credit Portfolio</h1>

        {loading ? (
          <p>Loading your on-chain assets...</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {ownedTokens.length > 0 ? (
              ownedTokens.map((tokenId) => (
                <Card key={tokenId} className="bg-gray-800 border-gray-700">
                  <CardHeader>
                    <CardTitle>CarbonTrust Credit</CardTitle>
                    <p className="text-sm text-gray-400">
                      Token ID: #{tokenId}
                    </p>
                  </CardHeader>
                  <CardContent>
                    <Button
                      className="w-full bg-red-600 hover:bg-red-700"
                      onClick={() => handleRetire(tokenId)}
                      disabled={retiringId === tokenId}
                    >
                      <Recycle className="h-4 w-4 mr-2" />
                      {retiringId === tokenId ? "Retiring..." : "Retire Credit"}
                    </Button>
                  </CardContent>
                </Card>
              ))
            ) : (
              <p>You do not own any Carbon Credit Tokens.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
