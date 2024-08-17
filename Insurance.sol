// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract SimpleInsurance {

    struct Insurance {
        uint256 premiumPaid;
        uint256 claimableAmount;
        bool hasClaimed;
    }

    mapping(address => Insurance) public insurances;
    address public owner;

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can execute this");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    // Function to purchase insurance
    function purchaseInsurance() external payable {
        require(msg.value > 0, "Ether value must be greater than 0");
        require(insurances[msg.sender].premiumPaid == 0, "Insurance already purchased");

        uint256 claimable = msg.value * 2;

        insurances[msg.sender] = Insurance({
            premiumPaid: msg.value,
            claimableAmount: claimable,
            hasClaimed: false
        });

        // Immediately send the claimable amount to the user's wallet
        sendClaimToUser(msg.sender);
    }

    // Internal function to handle sending the claim
    function sendClaimToUser(address user) internal {
        Insurance storage userInsurance = insurances[user];

        require(userInsurance.premiumPaid > 0, "No insurance purchased");
        require(!userInsurance.hasClaimed, "Insurance already claimed");
        require(userInsurance.claimableAmount <= address(this).balance, "Contract has insufficient funds");

        uint256 claimAmount = userInsurance.claimableAmount;
        userInsurance.hasClaimed = true;

        // Send the claimable amount to the user's wallet
        (bool success, ) = user.call{value: claimAmount}("");
        require(success, "Transfer failed");
    }

    // Fallback function to receive Ether
    receive() external payable {}
}
