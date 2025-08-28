// Load test processor functions for Artillery
module.exports = {
  // Generate random search queries for testing
  randomSearchQuery,
  randomAdvancedQuery,
  randomCompositionQuery,
  randomLanguage,
  randomContentType,
  randomDateRange,
  randomCompositionStyle,
  randomCitationStyle,
  
  // Custom metrics collection
  recordSearchMetrics,
  recordComposeMetrics,
  recordCitationMetrics,
  
  // Setup and teardown
  beforeScenario,
  afterResponse
};

// Search query datasets
const basicQueries = [
  'artificial intelligence',
  'machine learning',
  'web development',
  'data science',
  'cloud computing',
  'cybersecurity',
  'blockchain technology',
  'mobile development',
  'user experience design',
  'software architecture',
  'database design',
  'api development',
  'microservices',
  'devops practices',
  'agile methodology'
];

const advancedQueries = [
  'deep learning neural networks applications',
  'kubernetes container orchestration best practices',
  'react native cross platform development',
  'postgresql performance optimization techniques',
  'oauth2 jwt authentication security',
  'serverless architecture aws lambda',
  'graphql api design patterns',
  'machine learning model deployment',
  'continuous integration delivery pipelines',
  'typescript functional programming patterns'
];

const compositionQueries = [
  'explain quantum computing',
  'compare web frameworks',
  'summarize ai trends 2024',
  'analyze cloud security',
  'overview of microservices'
];

const languages = ['en', 'ro'];
const contentTypes = ['web', 'academic', 'news', 'blog'];
const dateRanges = ['week', 'month', 'year', 'all'];
const compositionStyles = ['informative', 'summary', 'detailed', 'brief'];
const citationStyles = ['apa', 'mla', 'chicago', 'ieee'];

function randomSearchQuery(context, events, done) {
  context.vars.randomSearchQuery = function() {
    return basicQueries[Math.floor(Math.random() * basicQueries.length)];
  };
  return done();
}

function randomAdvancedQuery(context, events, done) {
  context.vars.randomAdvancedQuery = function() {
    return advancedQueries[Math.floor(Math.random() * advancedQueries.length)];
  };
  return done();
}

function randomCompositionQuery(context, events, done) {
  context.vars.randomCompositionQuery = function() {
    return compositionQueries[Math.floor(Math.random() * compositionQueries.length)];
  };
  return done();
}

function randomLanguage(context, events, done) {
  context.vars.randomLanguage = function() {
    return languages[Math.floor(Math.random() * languages.length)];
  };
  return done();
}

function randomContentType(context, events, done) {
  context.vars.randomContentType = function() {
    return contentTypes[Math.floor(Math.random() * contentTypes.length)];
  };
  return done();
}

function randomDateRange(context, events, done) {
  context.vars.randomDateRange = function() {
    return dateRanges[Math.floor(Math.random() * dateRanges.length)];
  };
  return done();
}

function randomCompositionStyle(context, events, done) {
  context.vars.randomCompositionStyle = function() {
    return compositionStyles[Math.floor(Math.random() * compositionStyles.length)];
  };
  return done();
}

function randomCitationStyle(context, events, done) {
  context.vars.randomCitationStyle = function() {
    return citationStyles[Math.floor(Math.random() * citationStyles.length)];
  };
  return done();
}

function beforeScenario(context, events, done) {
  // Initialize custom metrics
  context.vars.startTime = Date.now();
  context.vars.requestCount = 0;
  context.vars.errorCount = 0;
  
  return done();
}

function afterResponse(requestParams, response, context, events, done) {
  // Record custom metrics
  const responseTime = Date.now() - context.vars.startTime;
  context.vars.requestCount++;
  
  if (response.statusCode >= 400) {
    context.vars.errorCount++;
  }
  
  // Record endpoint-specific metrics
  if (requestParams.url.includes('/api/search')) {
    recordSearchMetrics(response, responseTime, events);
  } else if (requestParams.url.includes('/api/compose')) {
    recordComposeMetrics(response, responseTime, events);
  } else if (requestParams.url.includes('/api/cite')) {
    recordCitationMetrics(response, responseTime, events);
  }
  
  return done();
}

function recordSearchMetrics(response, responseTime, events) {
  events.emit('customStat', 'search_response_time', responseTime);
  
  if (response.body) {
    try {
      const data = JSON.parse(response.body);
      if (data.results) {
        events.emit('customStat', 'results_per_query', data.results.length);
        events.emit('customStat', 'search_processing_time', data.processingTime || 0);
      }
    } catch (error) {
      events.emit('customStat', 'search_parse_errors', 1);
    }
  }
  
  if (response.statusCode !== 200) {
    events.emit('customStat', 'search_errors', 1);
  }
}

function recordComposeMetrics(response, responseTime, events) {
  events.emit('customStat', 'compose_response_time', responseTime);
  
  if (response.body) {
    try {
      const data = JSON.parse(response.body);
      if (data.composition) {
        events.emit('customStat', 'composition_length', data.composition.length);
        events.emit('customStat', 'sources_used', data.sources ? data.sources.length : 0);
      }
    } catch (error) {
      events.emit('customStat', 'compose_parse_errors', 1);
    }
  }
  
  if (response.statusCode !== 200) {
    events.emit('customStat', 'compose_errors', 1);
  }
}

function recordCitationMetrics(response, responseTime, events) {
  events.emit('customStat', 'citation_response_time', responseTime);
  
  if (response.body) {
    try {
      const data = JSON.parse(response.body);
      if (data.citations) {
        events.emit('customStat', 'citations_generated', data.citations.length);
      }
    } catch (error) {
      events.emit('customStat', 'citation_parse_errors', 1);
    }
  }
  
  if (response.statusCode !== 200) {
    events.emit('customStat', 'citation_errors', 1);
  }
}

// Utility functions for context setup
function setupTestContext(context, events, done) {
  // Add any global test context setup here
  context.vars.testStartTime = Date.now();
  context.vars.sessionId = Math.random().toString(36).substring(7);
  
  return done();
}

// Error handling and reporting
function handleError(error, context, events, done) {
  console.error('Load test error:', error);
  events.emit('customStat', 'test_errors', 1);
  return done();
}