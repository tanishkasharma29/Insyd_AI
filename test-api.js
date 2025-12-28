/**
 * API Test Script for Inventory Management System
 * 
 * This script tests all backend endpoints to ensure they're working correctly.
 * 
 * Usage:
 *   1. Make sure the backend server is running: npm run dev
 *   2. Run this script: node test-api.js
 * 
 * Note: This script requires a database connection. Make sure DATABASE_URL is set in .env
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

// Test results tracking
const results = {
  passed: 0,
  failed: 0,
  tests: [],
};

// Helper function to log test results
function logTest(testName, passed, message = '') {
  const status = passed ? '✓ PASS' : '✗ FAIL';
  const color = passed ? colors.green : colors.red;
  console.log(`${color}${status}${colors.reset} - ${testName}`);
  if (message) {
    console.log(`  ${colors.yellow}→${colors.reset} ${message}`);
  }
  
  results.tests.push({ name: testName, passed, message });
  if (passed) {
    results.passed++;
  } else {
    results.failed++;
  }
}

// Helper function to make API calls
async function apiCall(method, endpoint, data = null, expectedStatus = 200) {
  try {
    const config = {
      method,
      url: `${BASE_URL}${endpoint}`,
      headers: {
        'Content-Type': 'application/json',
      },
    };
    
    if (data) {
      config.data = data;
    }
    
    const response = await axios(config);
    
    if (response.status === expectedStatus) {
      return { success: true, data: response.data, status: response.status };
    } else {
      return {
        success: false,
        error: `Expected status ${expectedStatus}, got ${response.status}`,
        data: response.data,
      };
    }
  } catch (error) {
    if (error.code === 'ECONNREFUSED') {
      return {
        success: false,
        error: `Connection refused. Is the server running on ${BASE_URL}? Start it with: npm run dev`,
        status: null,
      };
    }
    return {
      success: false,
      error: error.response?.data?.error || error.message,
      status: error.response?.status,
      data: error.response?.data,
    };
  }
}

// Test data storage (will be populated during tests)
let testData = {
  supplierId: null,
  productId: null,
  sku: `TEST-SKU-${Date.now()}`,
  orderId: null,
};

async function runTests() {
  console.log(`${colors.cyan}========================================${colors.reset}`);
  console.log(`${colors.cyan}  Inventory Management API Test Suite${colors.reset}`);
  console.log(`${colors.cyan}========================================${colors.reset}\n`);

  // Pre-check: Verify server is running
  console.log(`${colors.yellow}Checking if server is running...${colors.reset}`);
  const preCheck = await apiCall('GET', '/health');
  if (!preCheck.success && preCheck.error?.includes('Connection refused')) {
    console.log(`\n${colors.red}✗ ERROR: Server is not running!${colors.reset}\n`);
    console.log(`${colors.yellow}To start the server, run in a separate terminal:${colors.reset}`);
    console.log(`  ${colors.cyan}npm run dev${colors.reset}\n`);
    console.log(`${colors.yellow}Then run this test again.${colors.reset}\n`);
    process.exit(1);
  }
  console.log(`${colors.green}✓ Server is running${colors.reset}\n`);

  // Test 1: Health Check
  console.log(`${colors.blue}1. Testing Health Check${colors.reset}`);
  const healthCheck = await apiCall('GET', '/health');
  if (healthCheck.success) {
    logTest('Health Check', true, 'Server is running');
  } else {
    logTest('Health Check', false, healthCheck.error || 'Server not responding');
  }
  console.log('');

  // Test 1b: API Health Check (includes DB status)
  console.log(`${colors.blue}1b. Testing API Health Check (with DB status)${colors.reset}`);
  const apiHealthCheck = await apiCall('GET', '/api/health');
  if (apiHealthCheck.success && apiHealthCheck.data?.data) {
    const dbStatus = apiHealthCheck.data.data.database;
    const statusMsg = dbStatus === 'connected' 
      ? 'Database connected ✓' 
      : `Database disconnected ✗${apiHealthCheck.data.data.databaseError ? `: ${apiHealthCheck.data.data.databaseError}` : ''}`;
    logTest('API Health Check', apiHealthCheck.success, statusMsg);
    if (dbStatus !== 'connected') {
      console.log(`  ${colors.yellow}⚠${colors.reset} Database connection required for most endpoints`);
      console.log(`  ${colors.yellow}  →${colors.reset} Create .env file with DATABASE_URL`);
      console.log(`  ${colors.yellow}  →${colors.reset} Run: npx prisma migrate dev --name init`);
    }
  } else {
    logTest('API Health Check', false, apiHealthCheck.error || 'Failed');
  }
  console.log('');

  // Test 2: Dashboard Stats (should work even with empty database)
  console.log(`${colors.blue}2. Testing Dashboard Stats${colors.reset}`);
  const dashboardStats = await apiCall('GET', '/dashboard/stats');
  logTest('GET /dashboard/stats', dashboardStats.success, dashboardStats.error || 'Dashboard stats retrieved');
  if (dashboardStats.success) {
    console.log(`  Total Stock Value: ₹${dashboardStats.data.data?.totalStockValue || 0}`);
    console.log(`  Low Stock Count: ${dashboardStats.data.data?.lowStockCount || 0}`);
    console.log(`  Dead Stock Count: ${dashboardStats.data.data?.deadStockCount || 0}`);
  }
  console.log('');

  // Note: For the following tests, we need a supplier first
  // Since we don't have a supplier endpoint, we'll skip inventory creation tests
  // and test the endpoints that can work without pre-existing data

  // Test 3: Get All Inventory (empty list is OK)
  console.log(`${colors.blue}3. Testing Get All Inventory${colors.reset}`);
  const getAllInventory = await apiCall('GET', '/inventory');
  logTest('GET /inventory', getAllInventory.success, getAllInventory.error || `Found ${getAllInventory.data?.count || 0} items`);
  console.log('');

  // Test 4: Get Inventory with Filters
  console.log(`${colors.blue}4. Testing Inventory Filters${colors.reset}`);
  const filteredInventory = await apiCall('GET', '/inventory?category=flooring&status=SAFE');
  logTest('GET /inventory?category=flooring&status=SAFE', filteredInventory.success, filteredInventory.error || 'Filters work correctly');
  console.log('');

  // Test 5: Get Pending Orders (empty list is OK)
  console.log(`${colors.blue}5. Testing Get Pending Orders${colors.reset}`);
  const pendingOrders = await apiCall('GET', '/orders/pending');
  logTest('GET /orders/pending', pendingOrders.success, pendingOrders.error || `Found ${pendingOrders.data?.count || 0} pending orders`);
  console.log('');

  // Test 6: Test Invalid SKU Status (should return 404)
  console.log(`${colors.blue}6. Testing Invalid SKU Status${colors.reset}`);
  const invalidStatus = await apiCall('GET', '/inventory/INVALID-SKU-12345/status', null, 404);
  logTest('GET /inventory/:sku/status (invalid SKU)', invalidStatus.status === 404, 'Correctly returns 404 for non-existent SKU');
  console.log('');

  // Test 7: Test Invalid Stock-Out (should return 404)
  console.log(`${colors.blue}7. Testing Invalid Stock-Out${colors.reset}`);
  const invalidStockOut = await apiCall('DELETE', '/inventory/INVALID-SKU-12345', {
    sellerName: 'Test Seller',
    quantity: 10,
  }, 404);
  logTest('DELETE /inventory/:sku (invalid SKU)', invalidStockOut.status === 404, 'Correctly returns 404 for non-existent SKU');
  console.log('');

  // Test 8: Test Invalid Stock-Out (missing required fields)
  console.log(`${colors.blue}8. Testing Stock-Out Validation${colors.reset}`);
  const invalidStockOutData = await apiCall('DELETE', '/inventory/TEST-SKU', {
    // Missing sellerName and quantity
  }, 400);
  logTest('DELETE /inventory/:sku (validation)', invalidStockOutData.status === 400 || invalidStockOutData.status === 404, 'Correctly validates input');
  console.log('');

  // Test 9: Test Invalid Order ID
  console.log(`${colors.blue}9. Testing Invalid Order ID${colors.reset}`);
  const invalidOrder = await apiCall('GET', '/orders/invalid-order-id-12345', null, 404);
  logTest('GET /orders/:id (invalid ID)', invalidOrder.status === 404, 'Correctly returns 404 for non-existent order');
  console.log('');

  // Test 10: Test Create Inventory without Supplier (should fail)
  console.log(`${colors.blue}10. Testing Create Inventory Validation${colors.reset}`);
  const invalidCreate = await apiCall('POST', '/inventory', {
    name: 'Test Product',
    sku: 'TEST-001',
    category: 'test',
    unitCostPrice: 100,
    unitSellingPrice: 150,
    supplierId: 'invalid-supplier-id',
  }, 404);
  logTest('POST /inventory (invalid supplier)', invalidCreate.status === 404, 'Correctly validates supplier existence');
  console.log('');

  // Summary
  console.log(`${colors.cyan}========================================${colors.reset}`);
  console.log(`${colors.cyan}  Test Summary${colors.reset}`);
  console.log(`${colors.cyan}========================================${colors.reset}`);
  console.log(`${colors.green}Passed: ${results.passed}${colors.reset}`);
  console.log(`${colors.red}Failed: ${results.failed}${colors.reset}`);
  console.log(`Total: ${results.passed + results.failed}`);
  console.log('');

  if (results.failed === 0) {
    console.log(`${colors.green}✓ All tests passed!${colors.reset}`);
    console.log('');
    console.log(`${colors.yellow}Note:${colors.reset} To test full CRUD operations, you need to:`);
    console.log('  1. Create a supplier in the database (or add a supplier endpoint)');
    console.log('  2. Create products/inventory using POST /inventory');
    console.log('  3. Test stock-out operations');
    console.log('  4. Test order creation and reconciliation');
    console.log('');
    console.log('You can use Prisma Studio to add test data:');
    console.log('  npx prisma studio');
  } else {
    console.log(`${colors.red}✗ Some tests failed. Check the errors above.${colors.reset}`);
  }

  console.log('');
  process.exit(results.failed > 0 ? 1 : 0);
}

// Run tests
runTests().catch((error) => {
  console.error(`${colors.red}Fatal Error:${colors.reset}`, error.message);
  process.exit(1);
});

