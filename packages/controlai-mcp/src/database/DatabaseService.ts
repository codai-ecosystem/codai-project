import initSqlJs from 'sql.js';
import path from 'path';
import fs from 'fs/promises';
import os from 'os';
import {
    Project,
    Task,
    Agent,
    TaskAssignment,
    TaskDependency,
    AgentSession,
    ProjectStatus,
    TaskStatus,
    AgentStatus,
    AssignmentStatus,
    SessionStatus
} from '../types/index.js';

export class DatabaseService {
    private db: any = null;
    private SQL: any = null;
    private dbPath: string;
    private dataDir: string;
    private isInitialized = false;

    constructor(dataDir?: string) {
        this.dataDir = dataDir || process.env.CONTROLAI_DATA_PATH || path.join(os.homedir(), '.controlai-mcp');
        this.dbPath = path.join(this.dataDir, 'controlai.db');
    }

    async initialize(): Promise<void> {
        try {
            // Initialize SQL.js
            this.SQL = await initSqlJs();

            // Create data directory if it doesn't exist
            await fs.mkdir(this.dataDir, { recursive: true });

            // Load or create database
            let dbBuffer = null;
            try {
                const dbData = await fs.readFile(this.dbPath);
                dbBuffer = new Uint8Array(dbData);
            } catch (error) {
                // Database doesn't exist, will create new one
                console.log('Creating new ControlAI database');
            }

            // Create database connection
            this.db = new this.SQL.Database(dbBuffer);

            // Create schema if needed
            await this.createTables();

            // Save initial database
            if (!dbBuffer) {
                await this.saveDatabase();
            }

            this.isInitialized = true;
            console.log('ControlAI Database initialized successfully');
            console.log(`Database path: ${this.dbPath}`);
        } catch (error) {
            console.error('Failed to initialize ControlAI database:', error);
            throw error;
        }
    }

    private async createTables(): Promise<void> {
        if (!this.db) throw new Error('Database not initialized');

        const schema = `
      -- Projects table
      CREATE TABLE IF NOT EXISTS projects (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT NOT NULL,
        status TEXT NOT NULL,
        priority TEXT NOT NULL,
        created_at DATETIME NOT NULL,
        updated_at DATETIME NOT NULL,
        completed_at DATETIME,
        tags TEXT DEFAULT '[]', -- JSON array
        metadata TEXT DEFAULT '{}' -- JSON object
      );

      -- Tasks table
      CREATE TABLE IF NOT EXISTS tasks (
        id TEXT PRIMARY KEY,
        project_id TEXT NOT NULL,
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        status TEXT NOT NULL,
        priority TEXT NOT NULL,
        category TEXT NOT NULL,
        estimated_hours REAL,
        actual_hours REAL,
        assigned_agent_id TEXT,
        dependencies TEXT DEFAULT '[]', -- JSON array
        tags TEXT DEFAULT '[]', -- JSON array
        created_at DATETIME NOT NULL,
        updated_at DATETIME NOT NULL,
        started_at DATETIME,
        completed_at DATETIME,
        due_date DATETIME,
        metadata TEXT DEFAULT '{}', -- JSON object
        FOREIGN KEY (project_id) REFERENCES projects (id),
        FOREIGN KEY (assigned_agent_id) REFERENCES agents (id)
      );

      -- Agents table
      CREATE TABLE IF NOT EXISTS agents (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        type TEXT NOT NULL,
        capabilities TEXT NOT NULL, -- JSON array
        status TEXT NOT NULL,
        current_task_id TEXT,
        workspace_id TEXT NOT NULL,
        max_concurrent_tasks INTEGER NOT NULL DEFAULT 1,
        performance TEXT NOT NULL, -- JSON object
        last_active_at DATETIME NOT NULL,
        created_at DATETIME NOT NULL,
        metadata TEXT DEFAULT '{}', -- JSON object
        FOREIGN KEY (current_task_id) REFERENCES tasks (id)
      );

      -- Task assignments table
      CREATE TABLE IF NOT EXISTS task_assignments (
        id TEXT PRIMARY KEY,
        task_id TEXT NOT NULL,
        agent_id TEXT NOT NULL,
        status TEXT NOT NULL,
        assigned_at DATETIME NOT NULL,
        started_at DATETIME,
        completed_at DATETIME,
        notes TEXT,
        quality INTEGER, -- 0-100
        FOREIGN KEY (task_id) REFERENCES tasks (id),
        FOREIGN KEY (agent_id) REFERENCES agents (id)
      );

      -- Task dependencies table
      CREATE TABLE IF NOT EXISTS task_dependencies (
        id TEXT PRIMARY KEY,
        task_id TEXT NOT NULL,
        depends_on_task_id TEXT NOT NULL,
        type TEXT NOT NULL,
        created_at DATETIME NOT NULL,
        FOREIGN KEY (task_id) REFERENCES tasks (id),
        FOREIGN KEY (depends_on_task_id) REFERENCES tasks (id)
      );

      -- Agent sessions table
      CREATE TABLE IF NOT EXISTS agent_sessions (
        id TEXT PRIMARY KEY,
        agent_id TEXT NOT NULL,
        workspace_id TEXT NOT NULL,
        status TEXT NOT NULL,
        started_at DATETIME NOT NULL,
        last_active_at DATETIME NOT NULL,
        ended_at DATETIME,
        tasks_completed INTEGER NOT NULL DEFAULT 0,
        tasks_in_progress TEXT DEFAULT '[]', -- JSON array of task IDs
        FOREIGN KEY (agent_id) REFERENCES agents (id)
      );

      -- Create indexes for better performance
      CREATE INDEX IF NOT EXISTS idx_tasks_project_id ON tasks (project_id);
      CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks (status);
      CREATE INDEX IF NOT EXISTS idx_tasks_assigned_agent ON tasks (assigned_agent_id);
      CREATE INDEX IF NOT EXISTS idx_agents_status ON agents (status);
      CREATE INDEX IF NOT EXISTS idx_agents_workspace ON agents (workspace_id);
      CREATE INDEX IF NOT EXISTS idx_task_assignments_task ON task_assignments (task_id);
      CREATE INDEX IF NOT EXISTS idx_task_assignments_agent ON task_assignments (agent_id);
      CREATE INDEX IF NOT EXISTS idx_agent_sessions_agent ON agent_sessions (agent_id);
    `;

        try {
            this.db.exec(schema);
            console.log('Database schema created successfully');
        } catch (error) {
            console.error('Failed to create database schema:', error);
            throw error;
        }
    }

    private async saveDatabase(): Promise<void> {
        if (!this.db) throw new Error('Database not initialized');

        try {
            const data = this.db.export();
            await fs.writeFile(this.dbPath, data);
        } catch (error) {
            console.error('Failed to save database:', error);
            throw error;
        }
    }

    // Project methods
    async createProject(project: Omit<Project, 'createdAt' | 'updatedAt'>): Promise<Project> {
        if (!this.db || !this.isInitialized) throw new Error('Database not initialized');

        const now = new Date();
        const fullProject: Project = {
            ...project,
            createdAt: now,
            updatedAt: now
        };

        const query = `
      INSERT INTO projects (id, name, description, status, priority, created_at, updated_at, completed_at, tags, metadata)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

        try {
            const stmt = this.db.prepare(query);
            stmt.run([
                fullProject.id,
                fullProject.name,
                fullProject.description,
                fullProject.status,
                fullProject.priority,
                fullProject.createdAt.toISOString(),
                fullProject.updatedAt.toISOString(),
                fullProject.completedAt?.toISOString() || null,
                JSON.stringify(fullProject.tags),
                JSON.stringify(fullProject.metadata)
            ]);

            await this.saveDatabase();
            return fullProject;
        } catch (error) {
            console.error('Failed to create project:', error);
            throw error;
        }
    }

    async getProject(id: string): Promise<Project | null> {
        if (!this.db || !this.isInitialized) throw new Error('Database not initialized');

        const query = 'SELECT * FROM projects WHERE id = ?';

        try {
            const stmt = this.db.prepare(query);
            const result = stmt.getAsObject([id]);

            if (!result.id) return null;

            return this.parseProjectRow(result);
        } catch (error) {
            console.error('Failed to get project:', error);
            throw error;
        }
    }

    async getAllProjects(): Promise<Project[]> {
        if (!this.db || !this.isInitialized) throw new Error('Database not initialized');

        const query = 'SELECT * FROM projects ORDER BY created_at DESC';

        try {
            const results = this.db.exec(query);
            if (!results || results.length === 0) return [];

            const resultSet = results[0];
            const columns = resultSet.columns;
            const values = resultSet.values;

            return values.map((row: any[]) => {
                const rowObj: any = {};
                columns.forEach((col: string, i: number) => {
                    rowObj[col] = row[i];
                });
                return this.parseProjectRow(rowObj);
            });
        } catch (error) {
            console.error('Failed to get all projects:', error);
            throw error;
        }
    }

    async updateProject(id: string, updates: Partial<Project>): Promise<Project | null> {
        if (!this.db || !this.isInitialized) throw new Error('Database not initialized');

        const now = new Date();
        const updateFields: string[] = [];
        const values: any[] = [];

        Object.entries(updates).forEach(([key, value]) => {
            if (key === 'id' || key === 'createdAt') return;

            const dbKey = key.replace(/([A-Z])/g, '_$1').toLowerCase();
            updateFields.push(`${dbKey} = ?`);

            if (key === 'tags' || key === 'metadata') {
                values.push(JSON.stringify(value));
            } else if (value instanceof Date) {
                values.push(value.toISOString());
            } else {
                values.push(value);
            }
        });

        updateFields.push('updated_at = ?');
        values.push(now.toISOString());
        values.push(id);

        const query = `UPDATE projects SET ${updateFields.join(', ')} WHERE id = ?`;

        try {
            const stmt = this.db.prepare(query);
            stmt.run(values);
            await this.saveDatabase();
            return this.getProject(id);
        } catch (error) {
            console.error('Failed to update project:', error);
            throw error;
        }
    }

    // Task methods
    async createTask(task: Omit<Task, 'createdAt' | 'updatedAt'>): Promise<Task> {
        if (!this.db || !this.isInitialized) throw new Error('Database not initialized');

        const now = new Date();
        const fullTask: Task = {
            ...task,
            createdAt: now,
            updatedAt: now
        };

        const query = `
      INSERT INTO tasks (
        id, project_id, title, description, status, priority, category,
        estimated_hours, actual_hours, assigned_agent_id, dependencies, tags,
        created_at, updated_at, started_at, completed_at, due_date, metadata
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

        try {
            const stmt = this.db.prepare(query);
            stmt.run([
                fullTask.id,
                fullTask.projectId,
                fullTask.title,
                fullTask.description,
                fullTask.status,
                fullTask.priority,
                fullTask.category,
                fullTask.estimatedHours || null,
                fullTask.actualHours || null,
                fullTask.assignedAgentId || null,
                JSON.stringify(fullTask.dependencies),
                JSON.stringify(fullTask.tags),
                fullTask.createdAt.toISOString(),
                fullTask.updatedAt.toISOString(),
                fullTask.startedAt?.toISOString() || null,
                fullTask.completedAt?.toISOString() || null,
                fullTask.dueDate?.toISOString() || null,
                JSON.stringify(fullTask.metadata)
            ]);

            await this.saveDatabase();
            return fullTask;
        } catch (error) {
            console.error('Failed to create task:', error);
            throw error;
        }
    }

    async getTask(id: string): Promise<Task | null> {
        if (!this.db || !this.isInitialized) throw new Error('Database not initialized');

        const query = 'SELECT * FROM tasks WHERE id = ?';

        try {
            const stmt = this.db.prepare(query);
            const result = stmt.getAsObject([id]);

            if (!result.id) return null;

            return this.parseTaskRow(result);
        } catch (error) {
            console.error('Failed to get task:', error);
            throw error;
        }
    }

    async getTasksByProject(projectId: string): Promise<Task[]> {
        if (!this.db || !this.isInitialized) throw new Error('Database not initialized');

        const query = 'SELECT * FROM tasks WHERE project_id = ? ORDER BY created_at ASC';

        try {
            const results = this.db.exec(query, [projectId]);
            if (!results || results.length === 0) return [];

            const resultSet = results[0];
            const columns = resultSet.columns;
            const values = resultSet.values;

            return values.map((row: any[]) => {
                const rowObj: any = {};
                columns.forEach((col: string, i: number) => {
                    rowObj[col] = row[i];
                });
                return this.parseTaskRow(rowObj);
            });
        } catch (error) {
            console.error('Failed to get tasks by project:', error);
            throw error;
        }
    }

    async getAvailableTasks(_agentCapabilities?: string[]): Promise<Task[]> {
        if (!this.db || !this.isInitialized) throw new Error('Database not initialized');

        const query = `
      SELECT * FROM tasks 
      WHERE status = ? AND assigned_agent_id IS NULL 
      ORDER BY 
        CASE priority 
          WHEN 'critical' THEN 4 
          WHEN 'high' THEN 3 
          WHEN 'medium' THEN 2 
          WHEN 'low' THEN 1 
          ELSE 0 
        END DESC,
        created_at ASC
      LIMIT 20
    `;

        try {
            const results = this.db.exec(query, [TaskStatus.TODO]);
            if (!results || results.length === 0) return [];

            const resultSet = results[0];
            const columns = resultSet.columns;
            const values = resultSet.values;

            return values.map((row: any[]) => {
                const rowObj: any = {};
                columns.forEach((col: string, i: number) => {
                    rowObj[col] = row[i];
                });
                return this.parseTaskRow(rowObj);
            });
        } catch (error) {
            console.error('Failed to get available tasks:', error);
            throw error;
        }
    }

    async updateTask(id: string, updates: Partial<Task>): Promise<Task | null> {
        if (!this.db || !this.isInitialized) throw new Error('Database not initialized');

        const now = new Date();
        const updateFields: string[] = [];
        const values: any[] = [];

        Object.entries(updates).forEach(([key, value]) => {
            if (key === 'id' || key === 'createdAt') return;

            const dbKey = key.replace(/([A-Z])/g, '_$1').toLowerCase();
            updateFields.push(`${dbKey} = ?`);

            if (key === 'dependencies' || key === 'tags' || key === 'metadata') {
                values.push(JSON.stringify(value));
            } else if (value instanceof Date) {
                values.push(value.toISOString());
            } else {
                values.push(value);
            }
        });

        updateFields.push('updated_at = ?');
        values.push(now.toISOString());
        values.push(id);

        const query = `UPDATE tasks SET ${updateFields.join(', ')} WHERE id = ?`;

        try {
            const stmt = this.db.prepare(query);
            stmt.run(values);
            await this.saveDatabase();
            return this.getTask(id);
        } catch (error) {
            console.error('Failed to update task:', error);
            throw error;
        }
    }

    // Agent methods
    async registerAgent(agent: Omit<Agent, 'createdAt' | 'lastActiveAt'>): Promise<Agent> {
        if (!this.db || !this.isInitialized) throw new Error('Database not initialized');

        const now = new Date();
        const fullAgent: Agent = {
            ...agent,
            createdAt: now,
            lastActiveAt: now
        };

        const query = `
      INSERT OR REPLACE INTO agents (
        id, name, type, capabilities, status, current_task_id, workspace_id,
        max_concurrent_tasks, performance, last_active_at, created_at, metadata
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

        try {
            const stmt = this.db.prepare(query);
            stmt.run([
                fullAgent.id,
                fullAgent.name,
                fullAgent.type,
                JSON.stringify(fullAgent.capabilities),
                fullAgent.status,
                fullAgent.currentTaskId || null,
                fullAgent.workspaceId,
                fullAgent.maxConcurrentTasks,
                JSON.stringify(fullAgent.performance),
                fullAgent.lastActiveAt.toISOString(),
                fullAgent.createdAt.toISOString(),
                JSON.stringify(fullAgent.metadata)
            ]);

            await this.saveDatabase();
            return fullAgent;
        } catch (error) {
            console.error('Failed to register agent:', error);
            throw error;
        }
    }

    async getAgent(id: string): Promise<Agent | null> {
        if (!this.db || !this.isInitialized) throw new Error('Database not initialized');

        const query = 'SELECT * FROM agents WHERE id = ?';

        try {
            const stmt = this.db.prepare(query);
            const result = stmt.getAsObject([id]);

            if (!result.id) return null;

            return this.parseAgentRow(result);
        } catch (error) {
            console.error('Failed to get agent:', error);
            throw error;
        }
    }

    async getAllAgents(): Promise<Agent[]> {
        if (!this.db || !this.isInitialized) throw new Error('Database not initialized');

        const query = 'SELECT * FROM agents ORDER BY last_active_at DESC';

        try {
            const results = this.db.exec(query);
            if (!results || results.length === 0) return [];

            const resultSet = results[0];
            const columns = resultSet.columns;
            const values = resultSet.values;

            return values.map((row: any[]) => {
                const rowObj: any = {};
                columns.forEach((col: string, i: number) => {
                    rowObj[col] = row[i];
                });
                return this.parseAgentRow(rowObj);
            });
        } catch (error) {
            console.error('Failed to get all agents:', error);
            throw error;
        }
    }

    async updateAgent(id: string, updates: Partial<Agent>): Promise<Agent | null> {
        if (!this.db || !this.isInitialized) throw new Error('Database not initialized');

        const updateFields: string[] = [];
        const values: any[] = [];

        Object.entries(updates).forEach(([key, value]) => {
            if (key === 'id' || key === 'createdAt') return;

            const dbKey = key.replace(/([A-Z])/g, '_$1').toLowerCase();
            updateFields.push(`${dbKey} = ?`);

            if (key === 'capabilities' || key === 'performance' || key === 'metadata') {
                values.push(JSON.stringify(value));
            } else if (value instanceof Date) {
                values.push(value.toISOString());
            } else {
                values.push(value);
            }
        });

        values.push(id);

        const query = `UPDATE agents SET ${updateFields.join(', ')} WHERE id = ?`;

        try {
            const stmt = this.db.prepare(query);
            stmt.run(values);
            await this.saveDatabase();
            return this.getAgent(id);
        } catch (error) {
            console.error('Failed to update agent:', error);
            throw error;
        }
    }

    // Helper methods for parsing database rows
    private parseProjectRow(row: any): Project {
        return {
            id: row.id,
            name: row.name,
            description: row.description,
            status: row.status as ProjectStatus,
            priority: row.priority,
            createdAt: new Date(row.created_at),
            updatedAt: new Date(row.updated_at),
            completedAt: row.completed_at ? new Date(row.completed_at) : undefined,
            tags: JSON.parse(row.tags || '[]'),
            metadata: JSON.parse(row.metadata || '{}')
        };
    }

    private parseTaskRow(row: any): Task {
        return {
            id: row.id,
            projectId: row.project_id,
            title: row.title,
            description: row.description,
            status: row.status as TaskStatus,
            priority: row.priority,
            category: row.category,
            estimatedHours: row.estimated_hours,
            actualHours: row.actual_hours,
            assignedAgentId: row.assigned_agent_id,
            dependencies: JSON.parse(row.dependencies || '[]'),
            tags: JSON.parse(row.tags || '[]'),
            createdAt: new Date(row.created_at),
            updatedAt: new Date(row.updated_at),
            startedAt: row.started_at ? new Date(row.started_at) : undefined,
            completedAt: row.completed_at ? new Date(row.completed_at) : undefined,
            dueDate: row.due_date ? new Date(row.due_date) : undefined,
            metadata: JSON.parse(row.metadata || '{}')
        };
    }

    private parseAgentRow(row: any): Agent {
        return {
            id: row.id,
            name: row.name,
            type: row.type,
            capabilities: JSON.parse(row.capabilities),
            status: row.status as AgentStatus,
            currentTaskId: row.current_task_id,
            workspaceId: row.workspace_id,
            maxConcurrentTasks: row.max_concurrent_tasks,
            performance: JSON.parse(row.performance),
            lastActiveAt: new Date(row.last_active_at),
            createdAt: new Date(row.created_at),
            metadata: JSON.parse(row.metadata || '{}')
        };
    }

    async close(): Promise<void> {
        if (this.db && this.isInitialized) {
            await this.saveDatabase();
            this.db.close();
            this.db = null;
            this.isInitialized = false;
        }
    }
}
