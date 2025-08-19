const { execSync } = require('child_process');

module.exports = function (plop) {
  // Helper function to convert text to different cases
  plop.setHelper('kebabCase', text => {
    return text
      .replace(/([a-z])([A-Z])/g, '$1-$2')
      .replace(/\s+/g, '-')
      .toLowerCase();
  });

  plop.setHelper('camelCase', text => {
    return text
      .replace(/(?:^\w|[A-Z]|\b\w)/g, (word, index) => {
        return index === 0 ? word.toLowerCase() : word.toUpperCase();
      })
      .replace(/\s+/g, '');
  });

  plop.setHelper('pascalCase', text => {
    return text
      .replace(/(?:^\w|[A-Z]|\b\w)/g, word => {
        return word.toUpperCase();
      })
      .replace(/\s+/g, '');
  });

  // Component generator
  plop.setGenerator('component', {
    description: 'Create a new React component',
    prompts: [
      {
        type: 'input',
        name: 'name',
        message: 'Component name (PascalCase):',
        validate: value => {
          if (!value) return 'Component name is required';
          if (!/^[A-Z][A-Za-z0-9]*$/.test(value)) {
            return 'Component name must be in PascalCase (e.g., MyComponent)';
          }
          return true;
        },
      },
      {
        type: 'list',
        name: 'type',
        message: 'Component type:',
        choices: ['ui', 'layout', 'forms', 'features'],
        default: 'ui',
      },
      {
        type: 'confirm',
        name: 'withTests',
        message: 'Include test file?',
        default: true,
      },
      {
        type: 'confirm',
        name: 'withStories',
        message: 'Include Storybook stories?',
        default: false,
      },
    ],
    actions: data => {
      const actions = [
        {
          type: 'add',
          path: 'apps/web/src/components/{{type}}/{{pascalCase name}}.tsx',
          templateFile: 'tools/plop-templates/component.hbs',
        },
      ];

      if (data.withTests) {
        actions.push({
          type: 'add',
          path: 'apps/web/tests/components/{{type}}/{{pascalCase name}}.test.tsx',
          templateFile: 'tools/plop-templates/component.test.hbs',
        });
      }

      if (data.withStories) {
        actions.push({
          type: 'add',
          path: 'apps/web/src/stories/{{pascalCase name}}.stories.tsx',
          templateFile: 'tools/plop-templates/component.stories.hbs',
        });
      }

      return actions;
    },
  });

  // Hook generator
  plop.setGenerator('hook', {
    description: 'Create a new custom React hook',
    prompts: [
      {
        type: 'input',
        name: 'name',
        message: 'Hook name (without "use" prefix):',
        validate: value => {
          if (!value) return 'Hook name is required';
          if (!/^[A-Z][A-Za-z0-9]*$/.test(value)) {
            return 'Hook name must be in PascalCase (e.g., Auth, LocalStorage)';
          }
          return true;
        },
      },
      {
        type: 'confirm',
        name: 'withTests',
        message: 'Include test file?',
        default: true,
      },
    ],
    actions: data => {
      const actions = [
        {
          type: 'add',
          path: 'apps/web/src/hooks/use{{pascalCase name}}.ts',
          templateFile: 'tools/plop-templates/hook.hbs',
        },
      ];

      if (data.withTests) {
        actions.push({
          type: 'add',
          path: 'apps/web/tests/hooks/use{{pascalCase name}}.test.ts',
          templateFile: 'tools/plop-templates/hook.test.hbs',
        });
      }

      return actions;
    },
  });

  // Page generator
  plop.setGenerator('page', {
    description: 'Create a new Next.js page',
    prompts: [
      {
        type: 'input',
        name: 'path',
        message: 'Page route (e.g., "about", "users/profile"):',
        validate: value => {
          if (!value) return 'Page path is required';
          if (!/^[a-z0-9\/\-_]+$/.test(value)) {
            return 'Page path must contain only lowercase letters, numbers, slashes, hyphens, and underscores';
          }
          return true;
        },
      },
      {
        type: 'input',
        name: 'name',
        message: 'Page component name (PascalCase):',
        validate: value => {
          if (!value) return 'Page name is required';
          if (!/^[A-Z][A-Za-z0-9]*$/.test(value)) {
            return 'Page name must be in PascalCase (e.g., AboutPage, UserProfile)';
          }
          return true;
        },
      },
      {
        type: 'confirm',
        name: 'withLayout',
        message: 'Use default layout?',
        default: true,
      },
      {
        type: 'confirm',
        name: 'withAuth',
        message: 'Require authentication?',
        default: false,
      },
    ],
    actions: [
      {
        type: 'add',
        path: 'apps/web/src/app/{{path}}/page.tsx',
        templateFile: 'tools/plop-templates/page.hbs',
      },
    ],
  });

  // Service generator
  plop.setGenerator('service', {
    description: 'Create a new service class',
    prompts: [
      {
        type: 'input',
        name: 'name',
        message: 'Service name (PascalCase, without "Service" suffix):',
        validate: value => {
          if (!value) return 'Service name is required';
          if (!/^[A-Z][A-Za-z0-9]*$/.test(value)) {
            return 'Service name must be in PascalCase (e.g., Auth, Payment)';
          }
          return true;
        },
      },
      {
        type: 'confirm',
        name: 'withTests',
        message: 'Include test file?',
        default: true,
      },
    ],
    actions: data => {
      const actions = [
        {
          type: 'add',
          path: 'apps/web/src/services/{{kebabCase name}}.ts',
          templateFile: 'tools/plop-templates/service.hbs',
        },
      ];

      if (data.withTests) {
        actions.push({
          type: 'add',
          path: 'apps/web/tests/services/{{kebabCase name}}.test.ts',
          templateFile: 'tools/plop-templates/service.test.hbs',
        });
      }

      return actions;
    },
  });

  // API route generator
  plop.setGenerator('api', {
    description: 'Create a new API route',
    prompts: [
      {
        type: 'input',
        name: 'path',
        message: 'API route path (e.g., "users", "auth/login"):',
        validate: value => {
          if (!value) return 'API path is required';
          if (!/^[a-z0-9\/\-_]+$/.test(value)) {
            return 'API path must contain only lowercase letters, numbers, slashes, hyphens, and underscores';
          }
          return true;
        },
      },
      {
        type: 'checkbox',
        name: 'methods',
        message: 'HTTP methods to support:',
        choices: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
        default: ['GET'],
        validate: value => {
          if (value.length === 0) return 'At least one HTTP method is required';
          return true;
        },
      },
    ],
    actions: [
      {
        type: 'add',
        path: 'apps/web/src/app/api/{{path}}/route.ts',
        templateFile: 'tools/plop-templates/api-route.hbs',
      },
    ],
  });

  // E2E test generator
  plop.setGenerator('e2e-test', {
    description: 'Create a new E2E test',
    prompts: [
      {
        type: 'input',
        name: 'name',
        message: 'Test name (kebab-case):',
        validate: value => {
          if (!value) return 'Test name is required';
          if (!/^[a-z0-9\-]+$/.test(value)) {
            return 'Test name must be in kebab-case (e.g., user-registration)';
          }
          return true;
        },
      },
      {
        type: 'input',
        name: 'description',
        message: 'Test description:',
        validate: value => {
          if (!value) return 'Test description is required';
          return true;
        },
      },
    ],
    actions: [
      {
        type: 'add',
        path: 'apps/web/e2e-tests/{{kebabCase name}}.spec.ts',
        templateFile: 'tools/plop-templates/e2e-test.hbs',
      },
    ],
  });
};
