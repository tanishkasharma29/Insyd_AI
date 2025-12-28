/**
 * Quick script to check if server is running and provide helpful message
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:5000';

async function checkServer() {
  try {
    const response = await axios.get(`${BASE_URL}/health`, { timeout: 2000 });
    console.log('✓ Server is running!');
    console.log(`  Response: ${JSON.stringify(response.data, null, 2)}`);
    return true;
  } catch (error) {
    if (error.code === 'ECONNREFUSED') {
      console.log('✗ Server is NOT running');
      console.log('');
      console.log('To start the server, run:');
      console.log('  npm run dev');
      console.log('');
      console.log('Then run the tests in another terminal:');
      console.log('  npm run test:api');
    } else {
      console.log('✗ Error checking server:', error.message);
    }
    return false;
  }
}

checkServer().then((isRunning) => {
  process.exit(isRunning ? 0 : 1);
});

