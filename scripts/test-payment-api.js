import dotenv from 'dotenv';

dotenv.config();

const API_BASE = `http://localhost:${process.env.PORT || 3000}/api/${process.env.API_VERSION || 'v1'}`;

let authToken = null;
let userId = null;

// Helper function to make API calls
async function apiCall(method, endpoint, body = null, token = null) {
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json'
    }
  };

  if (token) {
    options.headers['Authorization'] = `Bearer ${token}`;
  }

  if (body) {
    options.body = JSON.stringify(body);
  }

  try {
    const response = await fetch(`${API_BASE}${endpoint}`, options);
    const data = await response.json();
    return { status: response.status, data };
  } catch (error) {
    return { error: error.message };
  }
}

// Test suite
const tests = [
  {
    name: 'Health Check',
    test: async () => {
      try {
        const response = await fetch(`http://localhost:${process.env.PORT || 3000}/health`);
        const data = await response.json();
        return response.status === 200;
      } catch (error) {
        return false;
      }
    }
  },
  {
    name: 'Register Test User',
    test: async () => {
      const email = `test${Date.now()}@example.com`;
      const result = await apiCall('POST', '/auth/register', {
        email,
        password: 'Test123456',
        first_name: 'Test',
        last_name: 'User',
        user_type: 'viewer'
      });
      
      if (result.status === 201 && result.data?.data?.token) {
        authToken = result.data.data.token;
        userId = result.data.data.user.id;
        return true;
      }
      return false;
    }
  },
  {
    name: 'Get Wallet Balance',
    test: async () => {
      if (!authToken) return false;
      const result = await apiCall('GET', '/wallet', null, authToken);
      return result.status === 200 && result.data?.success;
    }
  },
  {
    name: 'Get Subscription Plans',
    test: async () => {
      const result = await apiCall('GET', '/subscriptions/plans');
      return result.status === 200 && result.data?.data?.plans?.length > 0;
    }
  },
  {
    name: 'Get My Subscription (No Active)',
    test: async () => {
      if (!authToken) return false;
      const result = await apiCall('GET', '/subscriptions/me', null, authToken);
      return result.status === 200 && result.data?.success;
    }
  },
  {
    name: 'Get Transaction History',
    test: async () => {
      if (!authToken) return false;
      const result = await apiCall('GET', '/wallet/transactions', null, authToken);
      return result.status === 200 && result.data?.success;
    }
  },
  {
    name: 'Get My Purchases (Empty)',
    test: async () => {
      if (!authToken) return false;
      const result = await apiCall('GET', '/payments/purchases', null, authToken);
      return result.status === 200 && result.data?.success;
    }
  },
  {
    name: 'Update Wallet Currency',
    test: async () => {
      if (!authToken) return false;
      const result = await apiCall('PUT', '/wallet/currency', { currency: 'USD' }, authToken);
      return result.status === 200 && result.data?.success;
    }
  }
];

(async () => {
  console.log('🧪 Testing Payment & Wallet API Endpoints\n');
  console.log(`API Base URL: ${API_BASE}\n`);

  let passed = 0;
  let failed = 0;
  const failedTests = [];

  for (const test of tests) {
    try {
      const result = await test.test();
      if (result) {
        console.log(`✅ ${test.name} - PASSED`);
        passed++;
      } else {
        console.log(`❌ ${test.name} - FAILED`);
        failed++;
        failedTests.push(test.name);
      }
    } catch (error) {
      console.log(`❌ ${test.name} - ERROR: ${error.message}`);
      failed++;
      failedTests.push(test.name);
    }
  }

  console.log(`\n📊 Test Results: ${passed} passed, ${failed} failed`);
  
  if (failed > 0) {
    console.log(`\n❌ Failed tests: ${failedTests.join(', ')}`);
  }

  if (failed === 0) {
    console.log('🎉 All tests passed!');
    process.exit(0);
  } else {
    console.log('⚠️  Some tests failed');
    process.exit(1);
  }
})();

