import fetch from 'node-fetch';

export async function verifyContractOnEtherscan() {
  console.log("🔍 Starting contract verification on Sepolia Etherscan...");
  
  const contractAddress = "0x2394bf201e9e2b245047e6a11c73241c82cf2b57";
  const apiKey = process.env.ETHERSCAN_API_KEY;
  
  // Contract source code for verification
  const sourceCode = `
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
}`;

  const verificationData = {
    apikey: apiKey,
    module: 'contract',
    action: 'verifysourcecode',
    contractaddress: contractAddress,
    sourceCode: sourceCode,
    codeformat: 'solidity-single-file',
    contractname: 'DecentralcyTest',
    compilerversion: 'v0.8.19+commit.7dd6d404',
    optimizationUsed: '0',
    runs: '200',
    constructorArguements: '',
    evmversion: 'default',
    licenseType: '3'
  };

  try {
    console.log(`📝 Submitting source code for verification...`);
    
    const response = await fetch('https://api-sepolia.etherscan.io/api', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams(verificationData)
    });

    const result = await response.json();
    
    if (result.status === '1') {
      console.log(`✅ Verification submitted successfully!`);
      console.log(`📋 GUID: ${result.result}`);
      console.log(`🔍 Check status at: https://sepolia.etherscan.io/address/${contractAddress}#code`);
      
      return {
        success: true,
        guid: result.result,
        message: "Contract verification submitted successfully"
      };
    } else {
      console.log(`❌ Verification failed: ${result.result}`);
      return {
        success: false,
        error: result.result
      };
    }
    
  } catch (error) {
    console.error("❌ Verification error:", error.message);
    return {
      success: false,
      error: error.message
    };
  }
}

// Run verification
verifyContractOnEtherscan()
  .then(result => {
    if (result.success) {
      console.log("\n🎉 CONTRACT VERIFICATION INITIATED!");
      console.log("⏳ Etherscan will process verification in 1-2 minutes");
      console.log("🌍 View your contract: https://sepolia.etherscan.io/address/0x2394bf201e9e2b245047e6a11c73241c82cf2b57#code");
    } else {
      console.log(`\n❌ Verification failed: ${result.error}`);
    }
  })
  .catch(console.error);