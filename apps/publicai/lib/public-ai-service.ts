import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class PublicAIService {
  // AI Provider Management
  async getProviders(includeInactive = false) {
    return await prisma.aIProvider.findMany({
      where: includeInactive ? {} : { isActive: true },
      include: {
        models: {
          where: { isActive: true, isPublic: true },
          orderBy: { name: 'asc' }
        },
        _count: {
          select: {
            models: true,
            requests: true
          }
        }
      },
      orderBy: { name: 'asc' }
    });
  }

  async getProvider(providerId: string) {
    return await prisma.aIProvider.findUnique({
      where: { id: providerId },
      include: {
        models: {
          where: { isActive: true },
          orderBy: { name: 'asc' }
        }
      }
    });
  }

  // AI Model Management
  async getModels(options: {
    providerId?: string;
    type?: string;
    isPublic?: boolean;
    userId?: string;
  } = {}) {
    const { providerId, type, isPublic = true, userId } = options;

    let whereCondition: any = {
      isActive: true
    };

    if (providerId) {
      whereCondition.providerId = providerId;
    }

    if (type) {
      whereCondition.type = type;
    }

    if (isPublic !== undefined) {
      whereCondition.isPublic = isPublic;
    }

    if (userId) {
      whereCondition.OR = [
        { isPublic: true },
        { ownerId: userId }
      ];
    }

    return await prisma.aIModel.findMany({
      where: whereCondition,
      include: {
        provider: {
          select: {
            id: true,
            name: true,
            displayName: true,
            logoUrl: true
          }
        },
        owner: userId ? {
          select: {
            id: true,
            name: true
          }
        } : false,
        _count: {
          select: {
            requests: true
          }
        }
      },
      orderBy: [
        { provider: { name: 'asc' } },
        { name: 'asc' }
      ]
    });
  }

  async getModel(modelId: string) {
    return await prisma.aIModel.findUnique({
      where: { id: modelId },
      include: {
        provider: true,
        owner: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });
  }

  // AI Request Processing
  async processAIRequest(data: {
    userId: string;
    modelId: string;
    prompt: string;
    parameters?: Record<string, any>;
    endpoint?: string;
  }) {
    const { userId, modelId, prompt, parameters = {}, endpoint = '/chat' } = data;

    // Check user's usage limits
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        usageQuotas: true
      }
    });

    if (!user) {
      throw new Error('User not found');
    }

    // Check monthly usage limit
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const monthStart = new Date(currentYear, currentMonth, 1);

    const monthlyUsage = await prisma.aIApiRequest.count({
      where: {
        userId,
        createdAt: { gte: monthStart }
      }
    });

    if (monthlyUsage >= user.usageLimit) {
      throw new Error('Monthly usage limit exceeded');
    }

    // Get model details
    const model = await prisma.aIModel.findUnique({
      where: { id: modelId },
      include: { provider: true }
    });

    if (!model) {
      throw new Error('Model not found');
    }

    // Process AI request (mock implementation)
    const startTime = Date.now();
    let response: string;
    let inputTokens: number;
    let outputTokens: number;
    let cost: number;

    try {
      // Mock AI processing
      const result = await this.mockAIProcess(model, prompt, parameters);
      response = result.response;
      inputTokens = result.inputTokens;
      outputTokens = result.outputTokens;
      cost = this.calculateCost(model, inputTokens, outputTokens);

      const responseTime = Date.now() - startTime;

      // Log the request
      const apiRequest = await prisma.aIApiRequest.create({
        data: {
          userId,
          providerId: model.providerId,
          modelId,
          prompt,
          response,
          parameters: JSON.stringify(parameters),
          inputTokens,
          outputTokens,
          totalTokens: inputTokens + outputTokens,
          endpoint,
          statusCode: 200,
          responseTime,
          cost
        }
      });

      // Update user's monthly usage
      await prisma.user.update({
        where: { id: userId },
        data: {
          monthlyUsage: {
            increment: 1
          }
        }
      });

      return {
        id: apiRequest.id,
        response,
        usage: {
          inputTokens,
          outputTokens,
          totalTokens: inputTokens + outputTokens
        },
        cost,
        model: {
          id: model.id,
          name: model.name,
          provider: model.provider.name
        },
        responseTime
      };
    } catch (error) {
      // Log failed request
      await prisma.aIApiRequest.create({
        data: {
          userId,
          providerId: model.providerId,
          modelId,
          prompt,
          parameters: JSON.stringify(parameters),
          endpoint,
          statusCode: 500,
          responseTime: Date.now() - startTime,
          cost: 0
        }
      });

      throw error;
    }
  }

  private async mockAIProcess(model: any, prompt: string, parameters: any) {
    // Mock AI processing - in real implementation, this would call actual AI APIs
    const delay = Math.random() * 1000 + 500; // 500-1500ms delay
    await new Promise(resolve => setTimeout(resolve, delay));

    const inputTokens = Math.ceil(prompt.length / 4); // Rough token estimation
    let response: string;

    switch (model.type) {
      case 'chat':
        response = `AI Response to: "${prompt.substring(0, 50)}${prompt.length > 50 ? '...' : ''}"`;
        break;
      case 'completion':
        response = `${prompt} [AI completion continues here...]`;
        break;
      case 'embedding':
        response = JSON.stringify(Array.from({ length: 1536 }, () => Math.random()));
        break;
      default:
        response = `Processed by ${model.name}: ${prompt}`;
    }

    const outputTokens = Math.ceil(response.length / 4);

    return {
      response,
      inputTokens,
      outputTokens
    };
  }

  private calculateCost(model: any, inputTokens: number, outputTokens: number): number {
    const inputCost = (inputTokens / 1000) * model.inputPrice;
    const outputCost = (outputTokens / 1000) * model.outputPrice;
    return Number((inputCost + outputCost).toFixed(6));
  }

  // User Management
  async getUserUsage(userId: string, timeframe: 'day' | 'week' | 'month' = 'month') {
    const now = new Date();
    let startDate: Date;

    switch (timeframe) {
      case 'day':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        break;
      case 'week':
        const weekStart = now.getDate() - now.getDay();
        startDate = new Date(now.getFullYear(), now.getMonth(), weekStart);
        break;
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
    }

    const [requests, totalCost, usage] = await Promise.all([
      prisma.aIApiRequest.count({
        where: {
          userId,
          createdAt: { gte: startDate }
        }
      }),
      prisma.aIApiRequest.aggregate({
        where: {
          userId,
          createdAt: { gte: startDate }
        },
        _sum: {
          cost: true,
          totalTokens: true
        }
      }),
      prisma.aIApiRequest.groupBy({
        by: ['modelId'],
        where: {
          userId,
          createdAt: { gte: startDate }
        },
        _count: {
          id: true
        },
        _sum: {
          cost: true,
          totalTokens: true
        }
      })
    ]);

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        usageLimit: true,
        monthlyUsage: true,
        tier: true
      }
    });

    return {
      timeframe,
      requests,
      totalCost: totalCost._sum.cost || 0,
      totalTokens: totalCost._sum.totalTokens || 0,
      usageByModel: usage,
      limits: {
        monthly: user?.usageLimit || 0,
        used: user?.monthlyUsage || 0,
        remaining: (user?.usageLimit || 0) - (user?.monthlyUsage || 0)
      },
      tier: user?.tier || 'FREE'
    };
  }

  async generateAPIKey(userId: string, name: string, permissions: string[] = ['read']) {
    const key = `pk_${Math.random().toString(36).substring(2)}_${Date.now()}`;

    return await prisma.aPIKey.create({
      data: {
        key,
        name,
        permissions: JSON.stringify(permissions),
        ownerId: userId
      }
    });
  }

  async validateAPIKey(key: string) {
    const apiKey = await prisma.aPIKey.findUnique({
      where: { key, isActive: true },
      include: {
        owner: {
          select: {
            id: true,
            tier: true,
            usageLimit: true,
            monthlyUsage: true
          }
        }
      }
    });

    if (!apiKey) {
      return null;
    }

    if (apiKey.expiresAt && apiKey.expiresAt < new Date()) {
      return null;
    }

    // Update usage count
    await prisma.aPIKey.update({
      where: { id: apiKey.id },
      data: {
        lastUsed: new Date(),
        usageCount: {
          increment: 1
        }
      }
    });

    return apiKey;
  }

  // Prompt Management
  async getPrompts(options: {
    category?: string;
    isPublic?: boolean;
    isFeatured?: boolean;
    userId?: string;
    search?: string;
    limit?: number;
    offset?: number;
  } = {}) {
    const {
      category,
      isPublic = true,
      isFeatured,
      userId,
      search,
      limit = 20,
      offset = 0
    } = options;

    let whereCondition: any = {};

    if (category) {
      whereCondition.category = category;
    }

    if (isPublic !== undefined) {
      if (userId) {
        whereCondition.OR = [
          { isPublic: true },
          { ownerId: userId }
        ];
      } else {
        whereCondition.isPublic = isPublic;
      }
    }

    if (isFeatured !== undefined) {
      whereCondition.isFeatured = isFeatured;
    }

    if (search) {
      whereCondition.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { content: { contains: search, mode: 'insensitive' } }
      ];
    }

    return await prisma.prompt.findMany({
      where: whereCondition,
      include: {
        owner: {
          select: {
            id: true,
            name: true
          }
        }
      },
      orderBy: [
        { isFeatured: 'desc' },
        { usageCount: 'desc' },
        { createdAt: 'desc' }
      ],
      take: limit,
      skip: offset
    });
  }

  async createPrompt(data: {
    userId: string;
    title: string;
    description?: string;
    content: string;
    category: string;
    tags?: string[];
    isPublic?: boolean;
  }) {
    const { userId, tags, ...promptData } = data;

    return await prisma.prompt.create({
      data: {
        ...promptData,
        tags: tags ? JSON.stringify(tags) : null,
        ownerId: userId
      }
    });
  }

  // Dataset Management
  async getDatasets(options: {
    type?: string;
    isPublic?: boolean;
    userId?: string;
    search?: string;
    limit?: number;
    offset?: number;
  } = {}) {
    const {
      type,
      isPublic = true,
      userId,
      search,
      limit = 20,
      offset = 0
    } = options;

    let whereCondition: any = {};

    if (type) {
      whereCondition.type = type;
    }

    if (isPublic !== undefined) {
      if (userId) {
        whereCondition.OR = [
          { isPublic: true },
          { ownerId: userId }
        ];
      } else {
        whereCondition.isPublic = isPublic;
      }
    }

    if (search) {
      whereCondition.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ];
    }

    return await prisma.dataset.findMany({
      where: whereCondition,
      include: {
        owner: {
          select: {
            id: true,
            name: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset
    });
  }

  // Service Status
  async getServiceStatus() {
    return await prisma.serviceStatus.findMany({
      orderBy: { service: 'asc' }
    });
  }

  async updateServiceStatus(service: string, status: string, message?: string) {
    return await prisma.serviceStatus.upsert({
      where: { service },
      update: {
        status,
        message,
        updatedAt: new Date(),
        endTime: status === 'operational' ? new Date() : undefined
      },
      create: {
        service,
        status,
        message
      }
    });
  }

  // Analytics and Insights
  async getPublicAnalytics() {
    const [totalRequests, totalUsers, activeModels, recentActivity] = await Promise.all([
      prisma.aIApiRequest.count(),
      prisma.user.count(),
      prisma.aIModel.count({ where: { isActive: true, isPublic: true } }),
      prisma.aIApiRequest.groupBy({
        by: ['modelId'],
        _count: { id: true },
        _sum: { totalTokens: true },
        orderBy: { _count: { id: 'desc' } },
        take: 10
      })
    ]);

    return {
      totalRequests,
      totalUsers,
      activeModels,
      popularModels: recentActivity
    };
  }

  // Feedback Management
  async submitFeedback(data: {
    type: string;
    title: string;
    description: string;
    category?: string;
    userId?: string;
    email?: string;
  }) {
    return await prisma.feedback.create({
      data
    });
  }
}
