// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Aggregator {
    address public aggregatorWallet;
    uint256 public constant AGGREGATOR_FEE_PERCENT = 20;

    struct Farmer {
        address wallet;
        uint256 shares;
        bool isRegistered;
    }

    mapping(address => Farmer) public farmers;
    address[] public farmerAddresses;

    constructor() {
        // The person who deploys this is the Aggregator (Admin)
        aggregatorWallet = msg.sender;
    }

    // Function to add a farmer to the co-op
    function addFarmer(address _wallet, uint256 _shares) public {
        require(msg.sender == aggregatorWallet, "Only aggregator can add farmers");
        if (!farmers[_wallet].isRegistered) {
            farmerAddresses.push(_wallet);
        }
        farmers[_wallet] = Farmer(_wallet, _shares, true);
    }

    function getFarmerCount() public view returns (uint256) {
        return farmerAddresses.length;
    }

    // This logic handles the automated payout based on shares
    function distributeFunds() public payable {
        uint256 totalAmount = msg.value;
        require(totalAmount > 0, "No funds to distribute");

        // 1. Take 20% Aggregator Fee
        uint256 fee = (totalAmount * AGGREGATOR_FEE_PERCENT) / 100;
        uint256 amountToDistribute = totalAmount - fee;
        payable(aggregatorWallet).transfer(fee);

        // 2. Calculate Total Shares
        uint256 totalShares = 0;
        for (uint256 i = 0; i < farmerAddresses.length; i++) {
            totalShares += farmers[farmerAddresses[i]].shares;
        }

        // 3. Distribute to Farmers
        if (totalShares > 0) {
            for (uint256 i = 0; i < farmerAddresses.length; i++) {
                address farmerAddr = farmerAddresses[i];
                uint256 payment = (amountToDistribute * farmers[farmerAddr].shares) / totalShares;
                if (payment > 0) {
                    payable(farmerAddr).transfer(payment);
                }
            }
        }
    }

    // Fallback: This allows the contract to receive MATIC/POL and auto-distribute
    receive() external payable {
        distributeFunds();
    }
}