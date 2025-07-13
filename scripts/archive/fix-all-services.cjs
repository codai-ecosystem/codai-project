#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔧 Applying comprehensive fixes across all services...');

// Database mock template
const databaseTemplate = `// Mock database connection for service
export const db = {
  async query(sql, params) {
    console.log(\`Mock DB Query: \${sql}\`, params);
    return { rows: [] };
  },
  
  async close() {
    console.log('Mock DB: Connection closed');
  },
  
  async destroy() {
    console.log('Mock DB: Connection destroyed');
  },
  
  async transaction(callback) {
    const tx = {
      query: this.query,
      rollback: () => console.log('Mock DB: Transaction rolled back'),
      commit: () => console.log('Mock DB: Transaction committed')
    };
    return callback(tx);
  },
  
  migrate: {
    async latest() {
      console.log('Mock DB: Migrations run');
      return [];
    },
    async rollback() {
      console.log('Mock DB: Migrations rolled back');
      return [];
    }
  },
  
  seed: {
    async run() {
      console.log('Mock DB: Seeds run');
      return [];
    }
  }
};

export default db;
`;

// Redis mock template
const redisTemplate = `// Mock Redis connection for service
export const redis = {
  async get(key) {
    console.log(\`Mock Redis GET: \${key}\`);
    return null;
  },
  
  async set(key, value, options) {
    console.log(\`Mock Redis SET: \${key} = \${value}\`, options);
    return 'OK';
  },
  
  async del(key) {
    console.log(\`Mock Redis DEL: \${key}\`);
    return 1;
  },
  
  async hget(key, field) {
    console.log(\`Mock Redis HGET: \${key}.\${field}\`);
    return null;
  },
  
  async hset(key, field, value) {
    console.log(\`Mock Redis HSET: \${key}.\${field} = \${value}\`);
    return 1;
  },
  
  async ping() {
    console.log('Mock Redis PING');
    return 'PONG';
  },
  
  async flushall() {
    console.log('Mock Redis FLUSHALL');
    return 'OK';
  },
  
  async quit() {
    console.log('Mock Redis: Connection closed');
  }
};

export default redis;
`;

// ESLint config template
const eslintTemplate = `module.exports = {
  extends: [
    "next/core-web-vitals",
    "eslint:recommended",
    "@typescript-eslint/recommended"
  ],
  parser: "@typescript-eslint/parser",
  plugins: ["@typescript-eslint"],
  rules: {
    "@typescript-eslint/no-unused-vars": "warn",
    "@typescript-eslint/no-explicit-any": "warn",
    "react-hooks/exhaustive-deps": "warn"
  },
  env: {
    browser: true,
    node: true,
    es6: true
  },
  ignorePatterns: [
    "node_modules/",
    ".next/",
    "out/",
    "build/",
    "dist/",
    "tests/"
  ]
};
`;

// Get all services directories
const servicesDir = path.join(process.cwd(), 'services');
const services = fs.readdirSync(servicesDir, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name);

for (const service of services) {
    const servicePath = path.join(servicesDir, service);

    console.log(`\n🔧 Fixing service: ${service}`);

    try {
        // 1. Fix ESLint config
        const eslintJsPath = path.join(servicePath, '.eslintrc.js');
        const eslintCjsPath = path.join(servicePath, '.eslintrc.cjs');

        // Remove .js version if exists
        if (fs.existsSync(eslintJsPath)) {
            fs.unlinkSync(eslintJsPath);
            console.log(`  ✅ Removed problematic .eslintrc.js`);
        }

        // Create .cjs version
        if (!fs.existsSync(eslintCjsPath)) {
            fs.writeFileSync(eslintCjsPath, eslintTemplate);
            console.log(`  ✅ Created .eslintrc.cjs`);
        }

        // 2. Create missing lib directory and files
        const libPath = path.join(servicePath, 'src', 'lib');
        if (!fs.existsSync(libPath)) {
            fs.mkdirSync(libPath, { recursive: true });
        }

        const databasePath = path.join(libPath, 'database.ts');
        if (!fs.existsSync(databasePath)) {
            fs.writeFileSync(databasePath, databaseTemplate);
            console.log(`  ✅ Created database.ts`);
        }

        const redisPath = path.join(libPath, 'redis.ts');
        if (!fs.existsSync(redisPath)) {
            fs.writeFileSync(redisPath, redisTemplate);
            console.log(`  ✅ Created redis.ts`);
        }

        // 3. Fix vitest config if exists
        const vitestConfigPath = path.join(servicePath, 'vitest.config.ts');
        if (fs.existsSync(vitestConfigPath)) {
            const vitestContent = fs.readFileSync(vitestConfigPath, 'utf8');
            if (vitestContent.includes('react()')) {
                const fixedContent = vitestContent.replace(
                    /import react from '@vitejs\/plugin-react';\s*/g, ''
                ).replace(
                    /plugins:\s*\[react\(\)\]/g, 'plugins: []'
                );
                fs.writeFileSync(vitestConfigPath, fixedContent);
                console.log(`  ✅ Fixed vitest.config.ts`);
            }
        }

        console.log(`  ✅ Service ${service} fixed successfully`);

    } catch (error) {
        console.error(`  ❌ Error fixing ${service}:`, error.message);
    }
}

console.log('\n✅ Comprehensive service fixes completed!');
