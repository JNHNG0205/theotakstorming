let provider;
let signer;

const contractABI = [
  {
    inputs: [],
    name: "claimInsurance",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "user",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "claimAmount",
        type: "uint256",
      },
    ],
    name: "InsuranceClaimed",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "user",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "premiumPaid",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "claimableAmount",
        type: "uint256",
      },
    ],
    name: "InsurancePurchased",
    type: "event",
  },
  {
    inputs: [],
    name: "purchaseInsurance",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
  {
    stateMutability: "payable",
    type: "receive",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    name: "insurances",
    outputs: [
      {
        internalType: "uint256",
        name: "premiumPaid",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "claimableAmount",
        type: "uint256",
      },
      {
        internalType: "bool",
        name: "hasClaimed",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "owner",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
];

const contractAddress = "0xF822F70b6294B468d796983ED5245dA1bAeb95ce";

async function connectWallet() {
  if (typeof window.ethereum !== "undefined") {
    try {
      const accounts = await ethereum.request({
        method: "eth_requestAccounts",
      });

      if (accounts.length > 0) {
        provider = new ethers.providers.Web3Provider(window.ethereum);
        signer = provider.getSigner();
        const userAddress = await signer.getAddress();

        // Store the address in localStorage
        localStorage.setItem("walletAddress", userAddress);

        document.getElementById("walletAddress").innerText = userAddress;
        document.getElementById("disconnectButton").style.display =
          "inline-block";
        document.getElementById("connectButton").style.display = "none";
      } else {
        alert("No account found. Please connect to MetaMask.");
      }
    } catch (error) {
      console.error(error);
      alert("Error connecting to MetaMask");
    }
  } else {
    alert("MetaMask is not installed. Please install it to use this dApp.");
  }
}

document
  .getElementById("connectButton")
  .addEventListener("click", connectWallet);

document.getElementById("disconnectButton").addEventListener("click", () => {
  document.getElementById("walletAddress").innerText = "Not connected";
  provider = null;
  signer = null;
  localStorage.removeItem("walletAddress"); // Remove address from localStorage
  document.getElementById("disconnectButton").style.display = "none";
  document.getElementById("connectButton").style.display = "inline-block";
  alert(
    "Please disconnect from MetaMask or switch accounts to ensure a fresh connection next time."
  );
});

window.ethereum.on("accountsChanged", function (accounts) {
  if (accounts.length > 0) {
    document.getElementById("walletAddress").innerText = accounts[0];
    localStorage.setItem("walletAddress", accounts[0]);
  } else {
    document.getElementById("disconnectButton").click();
  }
});

window.ethereum.on("chainChanged", async (chainId) => {
  if (provider) {
    try {
      provider = null;
      signer = null;
      await connectWallet();
    } catch (error) {
      console.error("Error reconnecting after network change:", error);
      alert("Error reconnecting to MetaMask after network change.");
    }
  }
});

// Check connection state when the page loads
window.addEventListener("load", () => {
  const storedAddress = localStorage.getItem("walletAddress");
  if (storedAddress) {
    document.getElementById("walletAddress").innerText = storedAddress;
    document.getElementById("disconnectButton").style.display = "inline-block";
    document.getElementById("connectButton").style.display = "none";
    provider = new ethers.providers.Web3Provider(window.ethereum);
    signer = provider.getSigner();
  }
});

// New function to handle buying insurance
async function buyInsurance() {
  if (!provider || !signer) {
    alert("Please connect your wallet first.");
    return;
  }

  try {
    // Initialize the contract
    const contract = new ethers.Contract(contractAddress, contractABI, signer);

    // Call the purchaseInsurance function
    const tx = await contract.purchaseInsurance({
      value: ethers.utils.parseEther("0.01"), // Adjust the value as needed
    });

    // Wait for the transaction to be mined
    await tx.wait();
    alert("Insurance purchased successfully!");
  } catch (error) {
    console.error("Error purchasing insurance:", error);
    alert("Failed to purchase insurance. Please try again.");
  }
}

// Attach the buyInsurance function to all Buy buttons
document
  .querySelectorAll(
    ".rectangle-1 button, .rectangle-2 button, .rectangle-3 button"
  )
  .forEach((button) => {
    button.addEventListener("click", buyInsurance);
  });

async function claimInsurance() {
  if (!provider || !signer) {
    alert("Please connect your wallet first.");
    return;
  }

  try {
    // Initialize the contract
    const contract = new ethers.Contract(contractAddress, contractABI, signer);

    // Call the claimInsurance function
    const tx = await contract.claimInsurance();

    // Wait for the transaction to be mined
    await tx.wait();
    alert("Insurance claim submitted successfully!");
  } catch (error) {
    console.error("Error claiming insurance:", error);
    alert("Failed to claim insurance. Please try again.");
  }
}

// Attach the claimInsurance function to the submit button
document.getElementById("submitButton").addEventListener("click", (event) => {
  // Prevent the default form submission
  event.preventDefault();
  claimInsurance();
});
