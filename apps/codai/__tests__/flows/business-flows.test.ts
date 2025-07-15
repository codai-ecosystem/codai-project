
import { describe, it, expect, beforeEach } from 'vitest';
import { codeGenerationFlow } from '../../lib/flows/code-generation';
import { projectManagementFlow } from '../../lib/flows/project-management';

describe('Codai Business Flow Tests', () => {
  
  describe('Code Generation Flow', () => {
    it('should generate code successfully', async () => {
      const testRequest = {
        prompt: 'Create a simple calculator function',
        language: 'typescript',
        complexity: 'simple' as const
      };

      const result = await codeGenerationFlow.generateCode(testRequest);

      expect(result).toBeDefined();
      expect(result.generatedCode).toBeDefined();
      expect(result.explanation).toBeDefined();
      expect(result.testCases).toBeDefined();
      expect(result.explanation).toContain('typescript');
      expect(result.explanation).toContain(testRequest.prompt);
    });

    it('should handle complex code generation', async () => {
      const testRequest = {
        prompt: 'Create a distributed caching system',
        language: 'go',
        complexity: 'complex' as const
      };

      const result = await codeGenerationFlow.generateCode(testRequest);

      expect(result).toBeDefined();
      expect(result.generatedCode).toContain('go');
      expect(result.explanation).toContain('distributed');
    });

    it('should generate appropriate test cases', async () => {
      const testRequest = {
        prompt: 'Create user authentication service',
        language: 'javascript',
        complexity: 'moderate' as const
      };

      const result = await codeGenerationFlow.generateCode(testRequest);

      expect(result.testCases).toHaveLength(1);
      expect(result.testCases[0]).toContain('Test');
    });
  });

  describe('Project Management Flow', () => {
    it('should create project successfully', async () => {
      const projectName = 'Test Project';

      const result = await projectManagementFlow.createProject(projectName);

      expect(result).toBeDefined();
      expect(result.name).toBe(projectName);
      expect(result.status).toBe('planning');
      expect(result.progress).toBe(0);
      expect(result.tasks).toHaveLength(0);
      expect(result.id).toBeDefined();
    });

    it('should add task to project', async () => {
      const projectId = 'test-project-id';
      const taskTitle = 'Test Task';

      const result = await projectManagementFlow.addTask(projectId, taskTitle);

      expect(result).toBeDefined();
      expect(result.title).toBe(taskTitle);
      expect(result.status).toBe('todo');
      expect(result.priority).toBe('medium');
      expect(result.id).toBeDefined();
    });

    it('should generate unique IDs', async () => {
      const project1 = await projectManagementFlow.createProject('Project 1');
      const project2 = await projectManagementFlow.createProject('Project 2');

      expect(project1.id).not.toBe(project2.id);
    });
  });

  describe('Cross-Flow Integration', () => {
    it('should handle multiple flow execution', async () => {
      const codeRequest = {
        prompt: 'Create API endpoint',
        language: 'typescript',
        complexity: 'moderate' as const
      };

      const results = await Promise.all([
        codeGenerationFlow.generateCode(codeRequest),
        projectManagementFlow.createProject('API Project')
      ]);

      expect(results).toHaveLength(2);
      expect(results[0].generatedCode).toBeDefined();
      expect(results[1].name).toBe('API Project');
    });

    it('should maintain consistency across flows', async () => {
      const projectName = 'Consistent Project';
      const codePrompt = `Generate code for ${projectName}`;

      const project = await projectManagementFlow.createProject(projectName);
      const code = await codeGenerationFlow.generateCode({
        prompt: codePrompt,
        language: 'typescript',
        complexity: 'simple' as const
      });

      expect(project.name).toBe(projectName);
      expect(code.explanation).toContain(projectName);
    });
  });

  describe('Performance and Scalability', () => {
    it('should handle concurrent code generation requests', async () => {
      const requests = Array.from({ length: 10 }, (_, i) => ({
        prompt: `Generate function ${i}`,
        language: 'javascript',
        complexity: 'simple' as const
      }));

      const startTime = Date.now();
      const results = await Promise.all(
        requests.map(req => codeGenerationFlow.generateCode(req))
      );
      const endTime = Date.now();

      expect(results).toHaveLength(10);
      expect(results.every(r => r.generatedCode !== undefined)).toBe(true);
      expect(endTime - startTime).toBeLessThan(5000); // Should complete within 5 seconds
    });

    it('should handle concurrent project creation', async () => {
      const projectNames = Array.from({ length: 20 }, (_, i) => `Project ${i}`);

      const startTime = Date.now();
      const results = await Promise.all(
        projectNames.map(name => projectManagementFlow.createProject(name))
      );
      const endTime = Date.now();

      expect(results).toHaveLength(20);
      expect(results.every(p => p.id !== undefined)).toBe(true);
      expect(endTime - startTime).toBeLessThan(2000); // Should complete within 2 seconds
    });
  });
});
