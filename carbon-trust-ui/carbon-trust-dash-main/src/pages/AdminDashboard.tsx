// src/pages/AdminDashboard.tsx
import { useState, useEffect } from "react"; // 
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { ethers } from "ethers";
import { supabase } from "../lib/supabaseClient";
import CreditTokenABI from "../lib/CreditTokenABI.json";
import AggregatorABI from "../lib/AggregatorABI.json";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [isMinting, setIsMinting] = useState(false);
  const [isAddingFarmer, setIsAddingFarmer] = useState(false);
  const [newFarmerWallet, setNewFarmerWallet] = useState("");
  const [newFarmerShares, setNewFarmerShares] = useState("");

  // --- NEW: State for the farmer list ---
  const [registeredFarmers, setRegisteredFarmers] = useState<
    { address: string; shares: string }[]
  >([]);
  const [isFetchingFarmers, setIsFetchingFarmers] = useState(false);

  const creditTokenContractAddress ="0x5D864BdC3F00f9e249165A312A2d5aCdC3a43FA1";
  const aggregatorContractAddress ="0x26bb4ba7887482768C484275FA1A4aEdC7ac6A35";

  // --- Working Mint Function (Unchanged) ---
  const handleMint = async () => {
    if (typeof window.ethereum === "undefined" || !creditTokenContractAddress) {
      return alert("Please install MetaMask and add the contract address.");
    }
    setIsMinting(true);
    console.log("Minting process started...");
    try {
      // Use the robust provider initialization
      const provider = new ethers.BrowserProvider(window.ethereum, "any");
      await provider.send("eth_requestAccounts", []);
      const signer = await provider.getSigner();

      const creditTokenContract = new ethers.Contract(
        creditTokenContractAddress,
        CreditTokenABI,
        signer
      );

      const transaction = await creditTokenContract.safeMint(signer.address, {
        gasLimit: 500000,
      });
      await transaction.wait();
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

  // --- CORRECTED Add Farmer Function (Unchanged) ---
  const handleAddFarmer = async (event: React.FormEvent) => {
    event.preventDefault();
    if (typeof window.ethereum === "undefined" || !aggregatorContractAddress) {
      return alert(
        "Please install MetaMask and add the Aggregator contract address."
      );
    }
    if (!newFarmerWallet || !newFarmerShares) {
      return alert("Please enter both a wallet address and a share amount.");
    }

    setIsAddingFarmer(true);
    try {
      // Use the same robust initialization as the handleMint function
      const provider = new ethers.BrowserProvider(window.ethereum, "any");
      await provider.send("eth_requestAccounts", []);
      const signer = await provider.getSigner();

      const aggregatorContract = new ethers.Contract(
        aggregatorContractAddress,
        AggregatorABI,
        signer
      );

      console.log(
        `Adding farmer ${newFarmerWallet} with ${newFarmerShares} shares...`
      );
      // Make sure the share amount is sent as a number
      const transaction = await aggregatorContract.addFarmer(
        newFarmerWallet,
        Number(newFarmerShares),
        { gasLimit: 500000 }
      );
      await transaction.wait();

      alert(
        `Successfully added new farmer! Transaction Hash: ${transaction.hash}`
      );
      setNewFarmerWallet("");
      setNewFarmerShares("");
    } catch (error) {
      console.error("Failed to add farmer:", error);
      alert(
        `Failed to add farmer. Reason: ${
          error.reason || error.message
        }. Check console for details.`
      );
    }
    setIsAddingFarmer(false);
  };

  // --- NEW: Function to read farmer data from the contract ---
  const fetchRegisteredFarmers = async () => {
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const contract = new ethers.Contract(
        aggregatorContractAddress,
        AggregatorABI,
        provider
      );

      // This is the line that was failing:
      const addresses = await contract.getFarmerAddresses();
      console.log("Found addresses from contract:", addresses);

      const farmerData = await Promise.all(
        addresses.map(async (addr: string) => {
          const farmer = await contract.farmers(addr);
          return {
            wallet: addr,
            shares: Number(farmer.shares),
            isRegistered: farmer.isRegistered,
          };
        })
      );

      setFarmers(farmerData);
    } catch (err) {
      console.error("Failed to fetch farmers:", err);
    }
  };

  // --- NEW: Fetch farmers when the page loads ---
  useEffect(() => {
    // Only fetch if we actually have an address
    if (aggregatorContractAddress && aggregatorContractAddress.length > 0 ) {
      fetchRegisteredFarmers();
    }
  }, []); // Re-run if the address changes


  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/login"); // Redirect to login page after logout
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* --- Header (Unchanged) --- */}
      <header className="border-b border-gray-700 bg-gray-800/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-red-400">Admin Panel</h1>
          <nav className="flex items-center gap-4">
            <Link to="/dashboard">
              <Button variant="outline">View Buyer Dashboard</Button>
            </Link>
            <Link to="/portfolio">
              <Button variant="outline">My Portfolio</Button>
            </Link>
            <Button variant="destructive" onClick={handleLogout}>
              Logout
            </Button>
          </nav>
        </div>
      </header>

      {/* --- Admin content --- */}
      <div className="container mx-auto p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Module 1: Minting Tool (Unchanged) */}
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle>Token Minter (ERC-721)</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-gray-400">
              Create a new, unique carbon credit token (NFT) and send it to your
              wallet.
            </p>
            <Button
              onClick={handleMint}
              disabled={isMinting}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:bg-gray-500"
            >
              {isMinting ? "Minting..." : "Mint Test Credit"}
            </Button>
          </CardContent>
        </Card>

        {/* Module 2: Aggregator Portal (Unchanged) */}
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle>Aggregator Portal (Farmer Co-op)</CardTitle>
            <p className="text-sm text-gray-400 pt-2">
              Contract: {aggregatorContractAddress}
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAddFarmer} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="farmerWallet">New Farmer Wallet Address</Label>
                <Input
                  id="farmerWallet"
                  type="text"
                  placeholder="0x..."
                  value={newFarmerWallet}
                  onChange={(e) => setNewFarmerWallet(e.target.value)}
                  className="bg-gray-700 border-gray-600"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="farmerShares">
                  Farmer's Shares (e.g., Hectares)
                </Label>
                <Input
                  id="farmerShares"
                  type="number"
                  placeholder="100"
                  value={newFarmerShares}
                  onChange={(e) => setNewFarmerShares(e.target.value)}
                  className="bg-gray-700 border-gray-600"
                />
              </div>
              <Button
                type="submit"
                disabled={isAddingFarmer}
                className="bg-green-600 hover:bg-green-700"
              >
                {isAddingFarmer ? "Adding Farmer..." : "Add Farmer to Contract"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* --- NEW: Module 3: Registered Farmers List --- */}
        <Card className="bg-gray-800 border-gray-700 md:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Registered Farmer Co-op</CardTitle>
            <Button
              variant="outline"
              onClick={fetchRegisteredFarmers}
              disabled={isFetchingFarmers}
            >
              {isFetchingFarmers ? "Refreshing..." : "Refresh List"}
            </Button>
          </CardHeader>
          <CardContent>
            {isFetchingFarmers ? (
              <p>Loading farmer list...</p>
            ) : registeredFarmers.length === 0 ? (
              <p className="text-gray-400">
                No farmers registered in this contract yet.
              </p>
            ) : (
              <div className="max-h-64 overflow-y-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-gray-700">
                      <th className="p-2">Farmer Wallet Address</th>
                      <th className="p-2">Shares (e.g., Hectares)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {registeredFarmers.map((farmer, index) => (
                      <tr key={index} className="border-b border-gray-700">
                        <td
                          className="p-2 truncate"
                          style={{ maxWidth: "200px" }}
                        >
                          {farmer.address}
                        </td>
                        <td className="p-2">{farmer.shares}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
