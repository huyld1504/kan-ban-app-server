import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend } from 'k6/metrics';
import { randomString } from 'https://jslib.k6.io/k6-utils/1.2.0/index.js';

// Tạo metric
const failureRate = new Rate('failed_requests'); // Tỉ lệ lỗi
const registerDuration = new Trend('register_duration'); // Thời gian đăng ký

// Định nghĩa các scenario
export const options = {
  scenarios: {
    register_flow: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '30s', target: 10 },  // 30s tăng 10 user
        { duration: '1m', target: 10 },  // 1 phút giữ nguyên 10 user
        { duration: '20s', target: 20 }, // 20s tăng 20 user
        { duration: '1m', target: 20 }, // 1 phút giữ nguyên 20 user
        { duration: '20s', target: 0 }, // 20s giảm 20 user
      ],
    },
  },
  thresholds: {
    'failed_requests': ['rate<0.1'], // Tỉ lệ lỗi < 10%
    'http_req_duration': ['p(95)<2000'], // Thời gian phản hồi < 2s
    'register_duration': ['p(95)<3000'], // Thời gian đăng ký < 3s
  },
};

// Tạo user test
function generateTestUser() {
  const randomId = randomString(8);
  return {
    username: `testuser_${randomId}`,
    password: `Password123!${randomId}`,
    confirmPassword: `Password123!${randomId}`
  };
}

// Chạy test
export default function () {
  const user = generateTestUser();

  // Định dạng JSON
  const params = {
    headers: {
      'Content-Type': 'application/json',
    },
  };

  // Gửi request POST
  const startTime = new Date().getTime();
  const response = http.post('http://localhost:5000/api/v1/auth/signup', JSON.stringify(user), params);
  const duration = new Date().getTime() - startTime;

  // Thêm thời gian đăng ký vào metric
  registerDuration.add(duration);

  // Kiểm tra kết quả
  const checkResult = check(response, {
    'Đăng ký thành công': (r) => r.status === 201, // Kiểm tra status code
    'Response có định dạng JSON': (r) => r.headers['Content-Type'] && r.headers['Content-Type'].includes('application/json'), // Kiểm tra định dạng JSON
    'Response chứa user và token': (r) => { // Kiểm tra response có chứa user và token
      try {
        const body = JSON.parse(r.body);
        return body.user && body.token; // Kiểm tra response có chứa user và token
      } catch (e) {
        return false; // Nếu không parse được thì trả về false
      }
    }
  });

  // Thêm tỉ lệ lỗi vào metric
  failureRate.add(!checkResult);

  // Log kết quả
  if (!checkResult) {
    console.log(`Register failed for user ${user.username}. Status: ${response.status}. Body: ${response.body}`); // Log lỗi
  } else {
    console.log(`Register success for user ${user.username}. Status: ${response.status}. Body: ${response.body}`); // Log thành công
  }

  // Chờ 1 giây
  sleep(1);
} 