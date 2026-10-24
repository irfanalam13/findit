const API_BASE_URL = (
  process.env.API_BASE_URL ||
  'http://localhost:5000/api'
).replace(/\/+$/, '');

const checks = [
  {
    name: 'Health and database connection',
    path: '/health',
    method: 'GET',
    expectedStatus: 200,
    validate: (data) =>
      data.success === true &&
      data.database === 'connected',
  },
  {
    name: 'Public item listing',
    path: '/items',
    method: 'GET',
    expectedStatus: 200,
    validate: (data) =>
      data.success === true &&
      Array.isArray(data.items),
  },
  {
    name: 'Claims endpoint requires authentication',
    path: '/claims/mine',
    method: 'GET',
    expectedStatus: 401,
    validate: (data) => data.success === false,
  },
  {
    name: 'Rewards endpoint requires authentication',
    path: '/rewards/me',
    method: 'GET',
    expectedStatus: 401,
    validate: (data) => data.success === false,
  },
  {
    name: 'Profile endpoint requires authentication',
    path: '/profiles/me',
    method: 'GET',
    expectedStatus: 401,
    validate: (data) => data.success === false,
  },
];

async function runSmokeTests() {
  let failed = 0;

  console.log(`Testing API at ${API_BASE_URL}\n`);

  for (const check of checks) {
    try {
      const response = await fetch(
        `${API_BASE_URL}${check.path}`,
        { method: check.method },
      );

      const data = await response.json().catch(() => null);

      const statusMatches =
        response.status === check.expectedStatus;

      const bodyMatches =
        data !== null && check.validate(data);

      if (!statusMatches || !bodyMatches) {
        failed += 1;

        console.error(
          `FAIL: ${check.name} — HTTP ${response.status}`,
        );

        if (!statusMatches) {
          console.error(
            `  Expected HTTP ${check.expectedStatus}`,
          );
        }

        if (!bodyMatches) {
          console.error(
            '  Response body did not match expectations.',
          );
        }

        continue;
      }

      console.log(`PASS: ${check.name}`);
    } catch (error) {
      failed += 1;
      console.error(`FAIL: ${check.name}`);
      console.error(`  ${error.message}`);
    }
  }

  console.log(
    `\nSmoke tests finished: ${checks.length - failed} passed, ${failed} failed.`,
  );

  if (failed > 0) {
    process.exitCode = 1;
  }
}

runSmokeTests().catch((error) => {
  console.error('Smoke test runner failed:', error);
  process.exitCode = 1;
});