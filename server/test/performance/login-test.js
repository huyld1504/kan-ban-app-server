import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend } from 'k6/metrics';
import { randomString } from 'https://jslib.k6.io/k6-utils/1.2.0/index.js';

// Custom metrics
const failureRate = new Rate('failed_requests');
const loginDuration = new Trend('login_duration');

export const options = {
  scenarios: {
    login_flow: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '30s', target: 10 },  // Ramp up to 10 users
        { duration: '1m', target: 10 },   // Stay at 10 users
        { duration: '20s', target: 20 },  // Ramp up to 20 users
        { duration: '1m', target: 20 },   // Stay at 20 users
        { duration: '20s', target: 0 },   // Ramp down to 0 users
      ],
    },
  },
  thresholds: {
    'failed_requests': ['rate<0.1'],      // Less than 10% of requests should fail
    'http_req_duration': ['p(95)<2000'],  // 95% of requests should be below 2s
    'login_duration': ['p(95)<3000'],     // 95% of login operations should be below 3s
  },
};

function generateTestCredentials() {
  const randomId = randomString(8);
  // Using a fixed test user for login testing
  return {
    username: `testuser_${randomId}`,  // Replace with a valid test user
    password: `Password123!${randomId}` // Replace with the correct password
  };
}

export default function () {
  // Get test credentials
  const credentials = generateTestCredentials();

  // Headers
  const params = {
    headers: {
      'Content-Type': 'application/json',
    },
  };

  // Send login request
  const startTime = new Date().getTime();
  const response = http.post('http://localhost:5000/api/v1/auth/login', JSON.stringify(credentials), params);
  const duration = new Date().getTime() - startTime;

  // Record login duration
  loginDuration.add(duration);

  // Check results
  const checkResult = check(response, {
    'Login successful': (r) => r.status === 200,
    'Response is JSON': (r) => r.headers['Content-Type'] && r.headers['Content-Type'].includes('application/json'),
    'Response contains user and token': (r) => {
      try {
        const body = JSON.parse(r.body);
        return body.user && body.token;
      } catch (e) {
        return false;
      }
    }
  });

  // Record failures
  failureRate.add(!checkResult);

  // Log details if request failed
  if (!checkResult) {
    console.log(`Login failed for user ${credentials.username}. Status: ${response.status}. Body: ${response.body}`);
  }

  // Sleep for 1 second before next request
  sleep(1);
} 