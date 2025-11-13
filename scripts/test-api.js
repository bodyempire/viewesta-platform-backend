import dotenv from 'dotenv';

dotenv.config();

const API_BASE = `http://localhost:${process.env.PORT || 3000}/api/${process.env.API_VERSION || 'v1'}`;

const tests = [
  {
    name: 'Health Check',
    method: 'GET',
    url: `http://localhost:${process.env.PORT || 3000}/health`,
    expectedStatus: 200
  },
  {
    name: 'Get Categories',
    method: 'GET',
    url: `${API_BASE}/categories`,
    expectedStatus: 200
  },
  {
    name: 'Get Movies',
    method: 'GET',
    url: `${API_BASE}/movies`,
    expectedStatus: 200
  },
  {
    name: 'Register User',
    method: 'POST',
    url: `${API_BASE}/auth/register`,
    body: {
      email: `test${Date.now()}@example.com`,
      password: 'Test123456',
      first_name: 'Test',
      last_name: 'User',
      user_type: 'viewer'
    },
    expectedStatus: 201
  }
];

(async () => {
  console.log('🧪 Testing Viewesta API Endpoints\n');
  console.log(`API Base URL: ${API_BASE}\n`);

  let passed = 0;
  let failed = 0;

  for (const test of tests) {
    try {
      const options = {
        method: test.method,
        headers: {
          'Content-Type': 'application/json'
        }
      };

      if (test.body) {
        options.body = JSON.stringify(test.body);
      }

      const response = await fetch(test.url, options);
      const data = await response.json();

      if (response.status === test.expectedStatus) {
        console.log(`✅ ${test.name} - PASSED (${response.status})`);
        passed++;
      } else {
        console.log(`❌ ${test.name} - FAILED (Expected ${test.expectedStatus}, got ${response.status})`);
        console.log('   Response:', JSON.stringify(data, null, 2));
        failed++;
      }
    } catch (error) {
      console.log(`❌ ${test.name} - ERROR`);
      console.log(`   ${error.message}`);
      failed++;
    }
  }

  console.log(`\n📊 Test Results: ${passed} passed, ${failed} failed`);

  if (failed === 0) {
    console.log('🎉 All tests passed!');
    process.exit(0);
  } else {
    console.log('⚠️  Some tests failed');
    process.exit(1);
  }
})();

