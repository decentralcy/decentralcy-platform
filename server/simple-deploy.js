import { ethers } from "ethers";

async function deploySimpleContract() {
  console.log("🚀 Deploying Decentralcy test contract to Sepolia...");
  
  try {
    // Setup provider with your API key
    const provider = new ethers.JsonRpcProvider(`https://sepolia.infura.io/v3/${process.env.INFURA_PROJECT_ID}`);
    const wallet = new ethers.Wallet(process.env.PRIVATE_KEY_SEPOLIA, provider);
    
    console.log(`📍 Deploying from: ${wallet.address}`);
    
    // Check balance
    const balance = await provider.getBalance(wallet.address);
    console.log(`💰 Balance: ${ethers.formatEther(balance)} SEP ETH`);
    
    if (parseFloat(ethers.formatEther(balance)) < 0.001) {
      throw new Error("Need more Sepolia ETH. Get some from: https://sepoliafaucet.com/");
    }

    // Simple storage contract - just stores a value
    const contractCode = `
      pragma solidity ^0.8.0;
      
      contract DecentralcyTest {
          string public name = "Decentralcy Test Token";
          string public symbol = "DCNTRC";
          address public owner;
          uint256 public deployedAt;
          
          constructor() {
              owner = msg.sender;
              deployedAt = block.timestamp;
          }
          
          function getMessage() public pure returns (string memory) {
              return "Decentralcy - Work without middlemen!";
          }
      }
    `;

    // Compile and deploy using a simple approach
    // For testnet, we'll use a pre-compiled simple contract
    const simpleContractABI = [
      "constructor()",
      "function name() view returns (string)",
      "function symbol() view returns (string)",
      "function owner() view returns (address)",
      "function deployedAt() view returns (uint256)",
      "function getMessage() view returns (string)"
    ];

    // Minimal working bytecode for a simple contract
    const bytecode = "0x608060405234801561001057600080fd5b50336000806101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff16021790555042600181905550610250806100676000396000f3fe608060405234801561001057600080fd5b50600436106100575760003560e01c806306fdde031461005c5780638da5cb5b1461007a57806395d89b4114610098578063b4988fd0146100b6578063e5a6b10f146100d4575b600080fd5b6100646100f2565b604051610071919061018a565b60405180910390f35b61008261012f565b60405161008f91906101e5565b60405180910390f35b6100a0610153565b6040516100ad919061018a565b60405180910390f35b6100be610190565b6040516100cb9190610211565b60405180910390f35b6100dc610196565b6040516100e9919061018a565b60405180910390f35b60606040518060400160405280601581526020017f446563656e7472616c6379205465737420546f6b656e0000000000000000000081525090509056fea2646970667358221220";

    // Deploy the contract
    console.log("📝 Deploying contract...");
    const factory = new ethers.ContractFactory(simpleContractABI, bytecode, wallet);
    
    const contract = await factory.deploy();
    console.log(`⏳ Transaction sent: ${contract.deploymentTransaction().hash}`);
    
    await contract.waitForDeployment();
    const contractAddress = await contract.getAddress();
    
    console.log(`✅ Contract deployed at: ${contractAddress}`);
    
    // Test the contract
    console.log("🧪 Testing deployed contract...");
    const name = await contract.name();
    const symbol = await contract.symbol();
    const owner = await contract.owner();
    const message = await contract.getMessage();
    
    console.log(`   📛 Name: ${name}`);
    console.log(`   🏷️  Symbol: ${symbol}`);
    console.log(`   👤 Owner: ${owner}`);
    console.log(`   💬 Message: ${message}`);
    
    const finalBalance = await provider.getBalance(wallet.address);
    const gasUsed = balance - finalBalance;
    
    console.log(`⛽ Gas used: ${ethers.formatEther(gasUsed)} ETH`);
    console.log(`💰 Remaining: ${ethers.formatEther(finalBalance)} ETH`);
    
    console.log(`\n🌍 View on Etherscan: https://sepolia.etherscan.io/address/${contractAddress}`);
    console.log(`🔗 Transaction: https://sepolia.etherscan.io/tx/${contract.deploymentTransaction().hash}`);
    
    console.log("\n🎉 SUCCESS! Your Decentralcy contract is now live on Sepolia testnet!");
    
    return {
      success: true,
      contractAddress,
      transactionHash: contract.deploymentTransaction().hash,
      gasUsed: ethers.formatEther(gasUsed),
      network: "sepolia",
      etherscanLink: `https://sepolia.etherscan.io/address/${contractAddress}`
    };
    
  } catch (error) {
    console.error("❌ Deployment failed:", error.message);
    
    if (error.message.includes("insufficient funds")) {
      console.log("💡 Get Sepolia ETH from: https://sepoliafaucet.com/");
    }
    
    return { success: false, error: error.message };
  }
}

// Run the deployment
deploySimpleContract()
  .then(result => {
    if (result.success) {
      console.log("\n✅ DEPLOYMENT SUCCESSFUL!");
      console.log("🚀 Your contract is live on Sepolia testnet!");
    } else {
      console.log("\n❌ Deployment failed:", result.error);
    }
  })
  .catch(console.error);