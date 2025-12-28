/**
 * Full API Test Script with Database Setup
 * 
 * This script creates test data and tests all CRUD operations.
 * 
 * Prerequisites:
 *   1. Database must be set up and migrated
 *   2. Backend server must be running: npm run dev
 * 
 * Usage: node test-api-full.js
 */

const axios = require('axios');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
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

const results = {
  passed: 0,
  failed: 0,
  tests: [],
};

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
    return {
      success: false,
      error: error.response?.data?.error || error.message,
      status: error.response?.status,
      data: error.response?.data,
    };
  }
}

let testData = {
  supplierId: null,
  productId: null,
  sku: `TEST-SKU-${Date.now()}`,
  orderId: null,
};

async function setupTestData() {
  console.log(`${colors.cyan}Setting up test data...${colors.reset}\n`);
  
  try {
    // Create or get test supplier
    let supplier = await prisma.supplier.findFirst({
      where: { name: 'Test Supplier API' },
    });
    
    if (!supplier) {
      supplier = await prisma.supplier.create({
        data: {
          name: 'Test Supplier API',
          contact: '+91-9876543210',
          email: 'test@supplier.com',
        },
      });
    }
    
    testData.supplierId = supplier.id;
    console.log(`${colors.green}✓${colors.reset} Test supplier ready: ${supplier.name} (${supplier.id})\n`);
    
    return true;
  } catch (error) {
    console.error(`${colors.red}✗${colors.reset} Failed to setup test data:`, error.message);
    return false;
  }
}

async function cleanupTestData() {
  console.log(`\n${colors.cyan}Cleaning up test data...${colors.reset}`);
  
  try {
    // Delete test orders
    if (testData.orderId) {
      await prisma.pendingOrder.deleteMany({
        where: { id: testData.orderId },
      });
    }
    
    // Delete test inventory and products
    if (testData.productId) {
      await prisma.inventory.deleteMany({
        where: { productId: testData.productId },
      });
      await prisma.product.deleteMany({
        where: { id: testData.productId },
      });
    }
    
    // Clean up any products with test SKU pattern
    const testProducts = await prisma.product.findMany({
      where: { sku: { startsWith: 'TEST-SKU-' } },
    });
    
    for (const product of testProducts) {
      await prisma.inventory.deleteMany({ where: { productId: product.id } });
      await prisma.auditLog.deleteMany({ where: { productId: product.id } });
      await prisma.pendingOrder.deleteMany({ where: { productId: product.id } });
      await prisma.product.delete({ where: { id: product.id } });
    }
    
    console.log(`${colors.green}✓${colors.reset} Cleanup complete\n`);
  } catch (error) {
    console.error(`${colors.red}✗${colors.reset} Cleanup error:`, error.message);
  }
}

async function runFullTests() {
  console.log(`${colors.cyan}========================================${colors.reset}`);
  console.log(`${colors.cyan}  Full API Test Suite${colors.reset}`);
  console.log(`${colors.cyan}========================================${colors.reset}\n`);

  // Setup
  const setupSuccess = await setupTestData();
  if (!setupSuccess) {
    console.log(`${colors.red}Failed to setup test data. Exiting.${colors.reset}`);
    process.exit(1);
  }

  try {
    // Test 1: Health Check
    console.log(`${colors.blue}1. Health Check${colors.reset}`);
    const healthCheck = await apiCall('GET', '/health');
    logTest('Health Check', healthCheck.success);
    console.log('');

    // Test 2: Create Inventory
    console.log(`${colors.blue}2. Create Inventory (POST /inventory)${colors.reset}`);
    const createInventory = await apiCall('POST', '/inventory', {
      name: 'Test Marble Tiles',
      sku: testData.sku,
      category: 'flooring',
      unitCostPrice: 500,
      unitSellingPrice: 750,
      supplierId: testData.supplierId,
      minThreshold: 50,
      initialQuantity: 100,
      storageLocation: 'Warehouse A, Aisle 1',
    }, 201);
    
    logTest('POST /inventory', createInventory.success, createInventory.error);
    if (createInventory.success) {
      testData.productId = createInventory.data.data.product.id;
      console.log(`  Created product: ${createInventory.data.data.product.name} (SKU: ${createInventory.data.data.product.sku})`);
    }
    console.log('');

    // Test 3: Get Inventory Status
    console.log(`${colors.blue}3. Get Inventory Status${colors.reset}`);
    const getStatus = await apiCall('GET', `/inventory/${testData.sku}/status`);
    logTest('GET /inventory/:sku/status', getStatus.success, getStatus.error);
    if (getStatus.success) {
      console.log(`  Current Quantity: ${getStatus.data.data.currentQuantity}`);
      console.log(`  Status: ${getStatus.data.data.status}`);
    }
    console.log('');

    // Test 4: Get All Inventory
    console.log(`${colors.blue}4. Get All Inventory${colors.reset}`);
    const getAll = await apiCall('GET', '/inventory');
    logTest('GET /inventory', getAll.success, getAll.error || `Found ${getAll.data?.count || 0} items`);
    console.log('');

    // Test 5: Update Inventory
    console.log(`${colors.blue}5. Update Inventory (PATCH /inventory/:sku)${colors.reset}`);
    const updateInventory = await apiCall('PATCH', `/inventory/${testData.sku}`, {
      unitSellingPrice: 800,
      minThreshold: 75,
      storageLocation: 'Warehouse B, Aisle 2',
    });
    logTest('PATCH /inventory/:sku', updateInventory.success, updateInventory.error);
    console.log('');

    // Test 6: Create Order
    console.log(`${colors.blue}6. Create Order (POST /orders)${colors.reset}`);
    const createOrder = await apiCall('POST', '/orders', {
      productId: testData.productId,
      sku: testData.sku,
      quantity: 50,
      expectedDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
      supplierId: testData.supplierId,
      unitCostPrice: 480,
      notes: 'Test order for API testing',
    }, 201);
    
    logTest('POST /orders', createOrder.success, createOrder.error);
    if (createOrder.success) {
      testData.orderId = createOrder.data.data.id;
      console.log(`  Created order: ${createOrder.data.data.id}`);
    }
    console.log('');

    // Test 7: Get Pending Orders
    console.log(`${colors.blue}7. Get Pending Orders${colors.reset}`);
    const pendingOrders = await apiCall('GET', '/orders/pending');
    logTest('GET /orders/pending', pendingOrders.success, pendingOrders.error || `Found ${pendingOrders.data?.count || 0} orders`);
    console.log('');

    // Test 8: Get Order by ID
    if (testData.orderId) {
      console.log(`${colors.blue}8. Get Order by ID${colors.reset}`);
      const getOrder = await apiCall('GET', `/orders/${testData.orderId}`);
      logTest('GET /orders/:id', getOrder.success, getOrder.error);
      console.log('');
    }

    // Test 9: Stock-Out (Sell Inventory)
    console.log(`${colors.blue}9. Stock-Out (DELETE /inventory/:sku)${colors.reset}`);
    const stockOut = await apiCall('DELETE', `/inventory/${testData.sku}`, {
      sellerName: 'Test Seller',
      customerName: 'Test Customer',
      quantity: 30,
      notes: 'Test sale for API testing',
    });
    logTest('DELETE /inventory/:sku (Stock-Out)', stockOut.success, stockOut.error);
    if (stockOut.success) {
      console.log(`  Sold ${stockOut.data.data.newQuantity} units remaining`);
    }
    console.log('');

    // Test 10: Reconcile Order (Mark as Received)
    if (testData.orderId) {
      console.log(`${colors.blue}10. Reconcile Order (DELETE /orders/:id)${colors.reset}`);
      const reconcileOrder = await apiCall('DELETE', `/orders/${testData.orderId}`, {
        actualQuantity: 50,
        notes: 'Order received successfully',
      });
      logTest('DELETE /orders/:id (Reconcile)', reconcileOrder.success, reconcileOrder.error);
      if (reconcileOrder.success) {
        console.log(`  Order reconciled, inventory updated`);
      }
      console.log('');
    }

    // Test 11: Dashboard Stats
    console.log(`${colors.blue}11. Dashboard Stats${colors.reset}`);
    const dashboardStats = await apiCall('GET', '/dashboard/stats');
    logTest('GET /dashboard/stats', dashboardStats.success, dashboardStats.error);
    if (dashboardStats.success) {
      const stats = dashboardStats.data.data;
      console.log(`  Total Stock Value: ₹${stats.totalStockValue}`);
      console.log(`  Low Stock Count: ${stats.lowStockCount}`);
      console.log(`  Dead Stock Count: ${stats.deadStockCount}`);
      console.log(`  Total Products: ${stats.totalProducts}`);
    }
    console.log('');

    // Test 12: Verify Inventory After Operations
    console.log(`${colors.blue}12. Verify Final Inventory Status${colors.reset}`);
    const finalStatus = await apiCall('GET', `/inventory/${testData.sku}/status`);
    logTest('Final Inventory Status', finalStatus.success, finalStatus.error);
    if (finalStatus.success) {
      console.log(`  Current Quantity: ${finalStatus.data.data.currentQuantity}`);
      console.log(`  Status: ${finalStatus.data.data.status}`);
    }
    console.log('');

  } finally {
    // Cleanup
    await cleanupTestData();
  }

  // Summary
  console.log(`${colors.cyan}========================================${colors.reset}`);
  console.log(`${colors.cyan}  Test Summary${colors.reset}`);
  console.log(`${colors.cyan}========================================${colors.reset}`);
  console.log(`${colors.green}Passed: ${results.passed}${colors.reset}`);
  console.log(`${colors.red}Failed: ${results.failed}${colors.reset}`);
  console.log(`Total: ${results.passed + results.failed}`);
  console.log('');

  if (results.failed === 0) {
    console.log(`${colors.green}✓ All tests passed! Backend API is working correctly.${colors.reset}`);
  } else {
    console.log(`${colors.red}✗ Some tests failed. Please check the errors above.${colors.reset}`);
  }

  await prisma.$disconnect();
  process.exit(results.failed > 0 ? 1 : 0);
}

// Run tests
runFullTests().catch(async (error) => {
  console.error(`${colors.red}Fatal Error:${colors.reset}`, error.message);
  await cleanupTestData();
  await prisma.$disconnect();
  process.exit(1);
});

