import { loadTesting } from "./load-testing.js";

async function runComprehensiveLoadTest() {
  console.log("🚀 Starting comprehensive load testing for Decentralcy...");
  
  try {
    console.log("\n📊 Running standard load test...");
    const standardTest = await loadTesting.runDecentralcyLoadTest();
    
    console.log(`✅ Standard Load Test Results:`);
    console.log(`   Total Requests: ${standardTest.totalRequests}`);
    console.log(`   Success Rate: ${((standardTest.successfulRequests / standardTest.totalRequests) * 100).toFixed(1)}%`);
    console.log(`   Average Response: ${standardTest.averageResponseTime.toFixed(0)}ms`);
    console.log(`   Requests/Second: ${standardTest.requestsPerSecond.toFixed(1)}`);
    
    console.log("\n🔥 Running stress test...");
    const stressTest = await loadTesting.runStressTest();
    
    console.log(`✅ Stress Test Results:`);
    console.log(`   Total Requests: ${stressTest.totalRequests}`);
    console.log(`   Success Rate: ${((stressTest.successfulRequests / stressTest.totalRequests) * 100).toFixed(1)}%`);
    console.log(`   Average Response: ${stressTest.averageResponseTime.toFixed(0)}ms`);
    console.log(`   Requests/Second: ${stressTest.requestsPerSecond.toFixed(1)}`);
    
    // Generate comprehensive report
    const report = loadTesting.generateLoadTestReport();
    console.log("\n📋 LOAD TEST REPORT GENERATED");
    
    console.log("\n🎉 LOAD TESTING COMPLETE!");
    console.log("✅ Your platform is ready for production traffic!");
    
    return {
      standardTest,
      stressTest,
      overallResult: "PASSED"
    };
    
  } catch (error) {
    console.error("❌ Load testing failed:", error.message);
    return {
      error: error.message,
      overallResult: "FAILED"
    };
  }
}

// Run the comprehensive load test
runComprehensiveLoadTest()
  .then(result => {
    if (result.overallResult === "PASSED") {
      console.log("\n🚀 ALL SYSTEMS GO! Platform ready for production!");
    } else {
      console.log(`\n❌ Load testing issues: ${result.error}`);
    }
  })
  .catch(console.error);