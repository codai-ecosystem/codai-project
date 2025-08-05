/**
 * Integration example for MemorAI SDK
 * 
 * Demonstrates how to integrate MemorAI with common frameworks
 * and tools like React, Express.js, and Worker processes.
 */

// React Hook for MemorAI
const useMemorAI = () => {
  const [client, setClient] = useState(null);
  const [memories, setMemories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const memorAI = new MemorAI({
      baseUrl: process.env.REACT_APP_MEMORAI_URL || 'http://localhost:4006',
      enableWebSocket: true
    });

    // Real-time updates
    memorAI.on('memory:created', (memory) => {
      setMemories(prev => [memory, ...prev]);
    });

    memorAI.on('memory:updated', (memory) => {
      setMemories(prev => prev.map(m => m.id === memory.id ? memory : m));
    });

    memorAI.on('memory:deleted', ({ id }) => {
      setMemories(prev => prev.filter(m => m.id !== id));
    });

    setClient(memorAI);

    return () => memorAI.destroy();
  }, []);

  const searchMemories = useCallback(async (query, options = {}) => {
    if (!client) return;

    setLoading(true);
    setError(null);

    try {
      const result = await client.search.query(query, options);
      setMemories(result.memories);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [client]);

  const createMemory = useCallback(async (memoryData) => {
    if (!client) return;

    try {
      const memory = await client.memories.create(memoryData);
      return memory;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, [client]);

  return {
    client,
    memories,
    loading,
    error,
    searchMemories,
    createMemory
  };
};

// Express.js middleware for MemorAI
const memorAIMiddleware = (options = {}) => {
  const client = new MemorAI({
    baseUrl: options.baseUrl || 'http://localhost:4006',
    apiKey: options.apiKey || process.env.MEMORAI_API_KEY
  });

  return (req, res, next) => {
    req.memorai = client;
    next();
  };
};

// Express.js routes example
const express = require('express');
const router = express.Router();

router.use(memorAIMiddleware());

router.post('/memories', async (req, res) => {
  try {
    const memory = await req.memorai.memories.create(req.body);
    res.json(memory);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/memories/search', async (req, res) => {
  try {
    const { query, algorithm, limit } = req.query;
    const result = await req.memorai.search.query(query, {
      algorithm,
      limit: parseInt(limit) || 20
    });
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/analytics', async (req, res) => {
  try {
    const analytics = await req.memorai.analytics.overview();
    res.json(analytics);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Worker process for background memory processing
const { Worker, isMainThread, parentPort, workerData } = require('worker_threads');

if (isMainThread) {
  // Main thread - create worker for background processing
  const createMemoryWorker = (data) => {
    return new Promise((resolve, reject) => {
      const worker = new Worker(__filename, { workerData: data });

      worker.on('message', resolve);
      worker.on('error', reject);
      worker.on('exit', (code) => {
        if (code !== 0) {
          reject(new Error(`Worker stopped with exit code ${code}`));
        }
      });
    });
  };

  // Usage example
  const processMemoriesInBackground = async (memories) => {
    const results = await Promise.all(
      memories.map(memory => createMemoryWorker({
        action: 'process',
        memory,
        config: {
          baseUrl: 'http://localhost:4006'
        }
      }))
    );
    return results;
  };

} else {
  // Worker thread - process memories
  const processMemory = async (memoryData, config) => {
    const client = new MemorAI(config);

    try {
      // Enhanced processing with categorization
      const enhanced = await client.memories.enhance(memoryData);

      // Auto-categorization based on content
      const category = await client.categories.suggest(enhanced.content);
      if (category) {
        enhanced.category = category.name;
      }

      // Auto-tagging based on content analysis
      const suggestedTags = await client.tags.suggest(enhanced.content);
      enhanced.tags = [...(enhanced.tags || []), ...suggestedTags];

      return enhanced;
    } finally {
      client.destroy();
    }
  };

  // Worker message handler
  parentPort.on('message', async (data) => {
    try {
      if (data.action === 'process') {
        const result = await processMemory(data.memory, data.config);
        parentPort.postMessage(result);
      }
    } catch (error) {
      parentPort.postMessage({ error: error.message });
    }
  });
}

// Next.js API route example
const memorAINextJSHandler = async (req, res) => {
  const client = new MemorAI({
    baseUrl: process.env.MEMORAI_URL || 'http://localhost:4006',
    apiKey: process.env.MEMORAI_API_KEY
  });

  try {
    switch (req.method) {
      case 'GET':
        if (req.query.search) {
          const results = await client.search.query(req.query.search, {
            algorithm: req.query.algorithm || 'semantic',
            limit: parseInt(req.query.limit) || 20
          });
          return res.json(results);
        } else {
          const memories = await client.memories.list({
            limit: parseInt(req.query.limit) || 20,
            offset: parseInt(req.query.offset) || 0
          });
          return res.json(memories);
        }

      case 'POST':
        const memory = await client.memories.create(req.body);
        return res.status(201).json(memory);

      case 'PUT':
        const updated = await client.memories.update(req.query.id, req.body);
        return res.json(updated);

      case 'DELETE':
        await client.memories.delete(req.query.id);
        return res.status(204).end();

      default:
        res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
        return res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  } catch (error) {
    console.error('MemorAI API error:', error);
    return res.status(500).json({ error: error.message });
  } finally {
    client.destroy();
  }
};

// Vue.js composable
const useMemorAIVue = () => {
  const memories = ref([]);
  const loading = ref(false);
  const error = ref(null);

  let client = null;

  onMounted(() => {
    client = new MemorAI({
      baseUrl: process.env.VUE_APP_MEMORAI_URL || 'http://localhost:4006',
      enableWebSocket: true
    });

    client.on('memory:created', (memory) => {
      memories.value.unshift(memory);
    });

    client.on('memory:updated', (memory) => {
      const index = memories.value.findIndex(m => m.id === memory.id);
      if (index !== -1) {
        memories.value[index] = memory;
      }
    });

    client.on('memory:deleted', ({ id }) => {
      memories.value = memories.value.filter(m => m.id !== id);
    });
  });

  onUnmounted(() => {
    if (client) {
      client.destroy();
    }
  });

  const search = async (query, options = {}) => {
    loading.value = true;
    error.value = null;

    try {
      const result = await client.search.query(query, options);
      memories.value = result.memories;
    } catch (err) {
      error.value = err.message;
    } finally {
      loading.value = false;
    }
  };

  return {
    memories: readonly(memories),
    loading: readonly(loading),
    error: readonly(error),
    search
  };
};

// Svelte store
const createMemorAIStore = () => {
  const { subscribe, set, update } = writable({
    memories: [],
    loading: false,
    error: null
  });

  let client = null;

  const init = () => {
    client = new MemorAI({
      baseUrl: 'http://localhost:4006',
      enableWebSocket: true
    });

    client.on('memory:created', (memory) => {
      update(state => ({
        ...state,
        memories: [memory, ...state.memories]
      }));
    });
  };

  const search = async (query, options = {}) => {
    update(state => ({ ...state, loading: true, error: null }));

    try {
      const result = await client.search.query(query, options);
      update(state => ({
        ...state,
        memories: result.memories,
        loading: false
      }));
    } catch (error) {
      update(state => ({
        ...state,
        error: error.message,
        loading: false
      }));
    }
  };

  const destroy = () => {
    if (client) {
      client.destroy();
    }
  };

  return {
    subscribe,
    init,
    search,
    destroy
  };
};

// Testing helpers
const createMockMemorAI = (overrides = {}) => {
  return {
    memories: {
      create: jest.fn().mockResolvedValue({ id: '1', content: 'test' }),
      get: jest.fn().mockResolvedValue({ id: '1', content: 'test' }),
      list: jest.fn().mockResolvedValue({ memories: [], total: 0 }),
      update: jest.fn().mockResolvedValue({ id: '1', content: 'updated' }),
      delete: jest.fn().mockResolvedValue(undefined),
      ...overrides.memories
    },
    search: {
      query: jest.fn().mockResolvedValue({ memories: [], total: 0 }),
      ...overrides.search
    },
    analytics: {
      overview: jest.fn().mockResolvedValue({ memoryCount: 0 }),
      ...overrides.analytics
    },
    on: jest.fn(),
    destroy: jest.fn(),
    ...overrides
  };
};

module.exports = {
  useMemorAI,
  memorAIMiddleware,
  memorAINextJSHandler,
  useMemorAIVue,
  createMemorAIStore,
  createMockMemorAI,
  processMemoriesInBackground
};
