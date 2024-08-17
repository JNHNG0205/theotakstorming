// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;


contract SimpleTransaction {
    // Mapping to store the balance of each address
    mapping(address => uint256) public balances;

    // Event to emit when a transaction is made
    event Transaction(address indexed from, address indexed to, uint256 amount);

    // Function to deposit Ether into the contract
    function deposit() public payable {
        require(msg.value > 0, "Deposit amount must be greater than zero.");
        balances[msg.sender] += msg.value;
    }

    // Function to withdraw Ether from the contract
    function withdraw(uint256 _amount) public {
        require(_amount <= balances[msg.sender], "Insufficient balance.");
        balances[msg.sender] -= _amount;
        payable(msg.sender).transfer(_amount);
    }

    // Function to transfer Ether to another address
    function transfer(address payable _to, uint256 _amount) public {
        require(_amount <= balances[msg.sender], "Insufficient balance.");
        require(_to != address(0), "Invalid address.");
        
        balances[msg.sender] -= _amount;
        balances[_to] += _amount;
        _to.transfer(_amount);

        emit Transaction(msg.sender, _to, _amount);
    }

    // Function to check the balance of an address
    function getBalance(address _address) public view returns (uint256) {
        return balances[_address];
    }

    // Fallback function to accept Ether sent directly to the contract
    receive() external payable {
        balances[msg.sender] += msg.value;
    }
}
