let provider;
let signer;

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
