import 'dotenv/config';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    env: {
      // Tests must hit a real Postgres — point the app at the test database.
      DATABASE_URL: process.env.TEST_DATABASE_URL ?? '',
    },
    globalSetup: ['./src/tests/global-setup.ts'],
  },
});
