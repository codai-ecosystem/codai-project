/**
 * ContentAnalyzer - NLP-powered content analysis for memory categorization
 * Provides text analysis, topic extraction, and categorization suggestions
 */

export interface ContentAnalysis {
    topics: Array<{ topic: string; confidence: number; keywords: string[] }>;
    suggestedTags: Array<{ tag: string; confidence: number; reason: string }>;
    suggestedProject: { project: string; confidence: number; reason: string } | null;
    suggestedImportance: { score: number; reason: string };
    contentType: 'code' | 'documentation' | 'note' | 'task' | 'idea' | 'reference' | 'other';
    sentiment: { score: number; label: 'positive' | 'neutral' | 'negative' };
    complexity: { score: number; level: 'simple' | 'medium' | 'complex' };
    language: { detected: string; confidence: number };
    entities: Array<{ entity: string; type: string; confidence: number }>;
    keyPhrases: Array<{ phrase: string; importance: number }>;
    readabilityScore: number;
    wordCount: number;
    uniqueWordCount: number;
    avgWordLength: number;
}

export interface CategorizationRules {
    projectPatterns: Array<{ pattern: RegExp; project: string; weight: number }>;
    tagPatterns: Array<{ pattern: RegExp; tag: string; weight: number }>;
    importanceFactors: Array<{ pattern: RegExp; factor: number; reason: string }>;
    contentTypeIndicators: Array<{ pattern: RegExp; type: ContentAnalysis['contentType']; weight: number }>;
}

export class ContentAnalyzer {
    private rules!: CategorizationRules;
    private stopWords!: Set<string>;
    private techTerms!: Map<string, { category: string; importance: number }>;

    constructor() {
        this.initializeStopWords();
        this.initializeTechTerms();
        this.initializeCategorizationRules();
    }

    /**
     * Analyze content and provide comprehensive insights
     */
    async analyzeContent(content: string, context?: {
        existingTags?: string[];
        existingProjects?: string[];
        userPreferences?: any;
    }): Promise<ContentAnalysis> {
        if (!content || content.trim().length === 0) {
            throw new Error('Content is required for analysis');
        }

        const text = content.trim();
        const words = this.tokenize(text);
        const sentences = this.splitIntoSentences(text);

        // Basic text statistics
        const wordCount = words.length;
        const uniqueWords = new Set(words.map(w => w.toLowerCase()));
        const uniqueWordCount = uniqueWords.size;
        const avgWordLength = words.reduce((sum, word) => sum + word.length, 0) / wordCount;

        // Perform various analyses
        const topics = this.extractTopics(text, words);
        const suggestedTags = this.suggestTags(text, words, context?.existingTags);
        const suggestedProject = this.suggestProject(text, words, context?.existingProjects);
        const suggestedImportance = this.calculateImportance(text, words);
        const contentType = this.classifyContentType(text, words);
        const sentiment = this.analyzeSentiment(text, words);
        const complexity = this.analyzeComplexity(text, words, sentences);
        const language = this.detectLanguage(text, words);
        const entities = this.extractEntities(text, words);
        const keyPhrases = this.extractKeyPhrases(text, words);
        const readabilityScore = this.calculateReadability(text, sentences, words);

        return {
            topics,
            suggestedTags,
            suggestedProject,
            suggestedImportance,
            contentType,
            sentiment,
            complexity,
            language,
            entities,
            keyPhrases,
            readabilityScore,
            wordCount,
            uniqueWordCount,
            avgWordLength
        };
    }

    /**
     * Extract main topics from content
     */
    private extractTopics(text: string, words: string[]): ContentAnalysis['topics'] {
        const topicCandidates = new Map<string, { count: number; keywords: Set<string> }>();
        const lowerText = text.toLowerCase();

        // Technical topics
        const techTopics = [
            { topic: 'Frontend Development', keywords: ['react', 'vue', 'angular', 'html', 'css', 'javascript', 'typescript', 'component', 'ui', 'ux'] },
            { topic: 'Backend Development', keywords: ['server', 'api', 'database', 'node', 'express', 'mongodb', 'sql', 'rest', 'graphql', 'microservice'] },
            { topic: 'DevOps', keywords: ['docker', 'kubernetes', 'deployment', 'ci/cd', 'aws', 'azure', 'gcp', 'jenkins', 'pipeline'] },
            { topic: 'Mobile Development', keywords: ['ios', 'android', 'react native', 'flutter', 'mobile', 'app store', 'swift', 'kotlin'] },
            { topic: 'Data Science', keywords: ['machine learning', 'ai', 'data', 'analytics', 'python', 'pandas', 'numpy', 'tensorflow', 'model'] },
            { topic: 'Security', keywords: ['security', 'authentication', 'authorization', 'encryption', 'jwt', 'oauth', 'ssl', 'vulnerability'] },
            { topic: 'Testing', keywords: ['test', 'testing', 'unit test', 'integration', 'e2e', 'jest', 'cypress', 'selenium', 'qa'] },
            { topic: 'Documentation', keywords: ['documentation', 'readme', 'guide', 'tutorial', 'manual', 'spec', 'api docs'] },
            { topic: 'Project Management', keywords: ['project', 'task', 'milestone', 'deadline', 'planning', 'agile', 'scrum', 'kanban'] },
            { topic: 'Performance', keywords: ['performance', 'optimization', 'speed', 'memory', 'cache', 'benchmark', 'profiling'] }
        ];

        // Count topic matches
        techTopics.forEach(({ topic, keywords }) => {
            let matches = 0;
            const foundKeywords = new Set<string>();

            keywords.forEach(keyword => {
                const keywordMatches = (lowerText.match(new RegExp(keyword, 'g')) || []).length;
                if (keywordMatches > 0) {
                    matches += keywordMatches;
                    foundKeywords.add(keyword);
                }
            });

            if (matches > 0) {
                topicCandidates.set(topic, {
                    count: matches,
                    keywords: foundKeywords
                });
            }
        });

        // Convert to results with confidence scores
        const topics = Array.from(topicCandidates.entries())
            .map(([topic, data]) => ({
                topic,
                confidence: Math.min(data.count / words.length * 10, 1), // Normalize confidence
                keywords: Array.from(data.keywords)
            }))
            .sort((a, b) => b.confidence - a.confidence)
            .slice(0, 5); // Top 5 topics

        return topics;
    }

    /**
     * Suggest relevant tags based on content analysis
     */
    private suggestTags(text: string, words: string[], existingTags?: string[]): ContentAnalysis['suggestedTags'] {
        const suggestions = new Map<string, { confidence: number; reason: string }>();
        const lowerText = text.toLowerCase();

        // Apply tag patterns from rules
        this.rules.tagPatterns.forEach(({ pattern, tag, weight }) => {
            const matches = (lowerText.match(pattern) || []).length;
            if (matches > 0) {
                const confidence = Math.min(matches * weight, 1);
                suggestions.set(tag, {
                    confidence,
                    reason: `Pattern match: "${pattern.source}" (${matches} occurrences)`
                });
            }
        });

        // Technology-specific tags
        const techTags = new Map([
            ['react', 'React'],
            ['vue', 'Vue.js'],
            ['angular', 'Angular'],
            ['node', 'Node.js'],
            ['typescript', 'TypeScript'],
            ['javascript', 'JavaScript'],
            ['python', 'Python'],
            ['docker', 'Docker'],
            ['kubernetes', 'Kubernetes'],
            ['aws', 'AWS'],
            ['api', 'API'],
            ['database', 'Database'],
            ['frontend', 'Frontend'],
            ['backend', 'Backend'],
            ['mobile', 'Mobile'],
            ['testing', 'Testing'],
            ['security', 'Security'],
            ['performance', 'Performance'],
            ['documentation', 'Documentation'],
            ['bug', 'Bug'],
            ['feature', 'Feature'],
            ['refactor', 'Refactoring'],
            ['deployment', 'Deployment'],
            ['monitoring', 'Monitoring'],
            ['analytics', 'Analytics']
        ]);

        techTags.forEach((tag, keyword) => {
            if (lowerText.includes(keyword)) {
                const occurrences = (lowerText.match(new RegExp(keyword, 'g')) || []).length;
                const confidence = Math.min(occurrences / words.length * 20, 1);

                if (confidence > 0.1) {
                    suggestions.set(tag, {
                        confidence,
                        reason: `Technology keyword: "${keyword}" found ${occurrences} times`
                    });
                }
            }
        });

        // Content type based tags
        if (lowerText.includes('todo') || lowerText.includes('task')) {
            suggestions.set('Task', { confidence: 0.8, reason: 'Contains task-related keywords' });
        }
        if (lowerText.includes('idea') || lowerText.includes('concept')) {
            suggestions.set('Idea', { confidence: 0.7, reason: 'Contains idea-related keywords' });
        }
        if (lowerText.includes('meeting') || lowerText.includes('discussion')) {
            suggestions.set('Meeting', { confidence: 0.8, reason: 'Contains meeting-related keywords' });
        }

        // Priority/urgency tags
        if (lowerText.includes('urgent') || lowerText.includes('asap') || lowerText.includes('critical')) {
            suggestions.set('Urgent', { confidence: 0.9, reason: 'Contains urgency indicators' });
        }
        if (lowerText.includes('important') || lowerText.includes('priority')) {
            suggestions.set('Important', { confidence: 0.7, reason: 'Contains importance indicators' });
        }

        // Filter out existing tags and convert to array
        const results = Array.from(suggestions.entries())
            .filter(([tag]) => !existingTags?.includes(tag))
            .map(([tag, data]) => ({ tag, ...data }))
            .sort((a, b) => b.confidence - a.confidence)
            .slice(0, 8); // Top 8 suggestions

        return results;
    }

    /**
     * Suggest project based on content analysis
     */
    private suggestProject(text: string, words: string[], existingProjects?: string[]): ContentAnalysis['suggestedProject'] {
        const suggestions = new Map<string, { confidence: number; reason: string }>();
        const lowerText = text.toLowerCase();

        // Apply project patterns from rules
        this.rules.projectPatterns.forEach(({ pattern, project, weight }) => {
            const matches = (lowerText.match(pattern) || []).length;
            if (matches > 0) {
                const confidence = Math.min(matches * weight, 1);
                suggestions.set(project, {
                    confidence,
                    reason: `Pattern match: "${pattern.source}" (${matches} occurrences)`
                });
            }
        });

        // Common project indicators
        const projectIndicators = [
            { keywords: ['memorai', 'memory', 'mcp'], project: 'MemorAI', weight: 0.9 },
            { keywords: ['codai', 'coding', 'development'], project: 'CODAI', weight: 0.8 },
            { keywords: ['romai', 'romanian', 'romania'], project: 'RomAI', weight: 0.9 },
            { keywords: ['bancai', 'banking', 'financial'], project: 'BancAI', weight: 0.8 },
            { keywords: ['cbd', 'database', 'storage'], project: 'CBD Database', weight: 0.8 },
            { keywords: ['api', 'rest', 'endpoint'], project: 'API Development', weight: 0.7 },
            { keywords: ['frontend', 'ui', 'component'], project: 'Frontend Development', weight: 0.7 },
            { keywords: ['backend', 'server', 'service'], project: 'Backend Development', weight: 0.7 },
            { keywords: ['mobile', 'ios', 'android'], project: 'Mobile Development', weight: 0.7 },
            { keywords: ['devops', 'deployment', 'infrastructure'], project: 'DevOps', weight: 0.7 }
        ];

        projectIndicators.forEach(({ keywords, project, weight }) => {
            let matchCount = 0;
            keywords.forEach(keyword => {
                if (lowerText.includes(keyword)) {
                    matchCount++;
                }
            });

            if (matchCount > 0) {
                const confidence = Math.min((matchCount / keywords.length) * weight, 1);
                if (confidence > 0.3) {
                    suggestions.set(project, {
                        confidence,
                        reason: `Project keywords matched: ${keywords.filter(k => lowerText.includes(k)).join(', ')}`
                    });
                }
            }
        });

        // Get highest confidence suggestion
        if (suggestions.size === 0) {
            return null;
        }

        const topSuggestion = Array.from(suggestions.entries())
            .sort(([, a], [, b]) => b.confidence - a.confidence)[0];

        return {
            project: topSuggestion[0],
            confidence: topSuggestion[1].confidence,
            reason: topSuggestion[1].reason
        };
    }

    /**
     * Calculate importance score based on content analysis
     */
    private calculateImportance(text: string, words: string[]): ContentAnalysis['suggestedImportance'] {
        let score = 5; // Base score
        const reasons: string[] = [];
        const lowerText = text.toLowerCase();

        // Apply importance factors from rules
        this.rules.importanceFactors.forEach(({ pattern, factor, reason }) => {
            const matches = (lowerText.match(pattern) || []).length;
            if (matches > 0) {
                score += factor * matches;
                reasons.push(`${reason} (+${factor * matches})`);
            }
        });

        // Length factor
        if (words.length > 100) {
            score += 1;
            reasons.push('Detailed content (+1)');
        } else if (words.length < 10) {
            score -= 1;
            reasons.push('Brief content (-1)');
        }

        // Technical complexity
        const techTermCount = words.filter(word =>
            this.techTerms.has(word.toLowerCase())
        ).length;
        if (techTermCount > 5) {
            score += 2;
            reasons.push('High technical complexity (+2)');
        } else if (techTermCount > 2) {
            score += 1;
            reasons.push('Medium technical complexity (+1)');
        }

        // Urgency indicators
        if (lowerText.includes('urgent') || lowerText.includes('critical') || lowerText.includes('asap')) {
            score += 3;
            reasons.push('Urgency indicators (+3)');
        }

        // Action items
        if (lowerText.includes('todo') || lowerText.includes('action') || lowerText.includes('task')) {
            score += 1;
            reasons.push('Contains action items (+1)');
        }

        // Clamp score between 1 and 10
        score = Math.max(1, Math.min(10, Math.round(score)));

        return {
            score,
            reason: reasons.length > 0 ? reasons.join(', ') : 'Standard importance based on content analysis'
        };
    }

    /**
     * Classify content type
     */
    private classifyContentType(text: string, words: string[]): ContentAnalysis['contentType'] {
        const lowerText = text.toLowerCase();
        const scores = new Map<ContentAnalysis['contentType'], number>();

        // Initialize scores
        scores.set('code', 0);
        scores.set('documentation', 0);
        scores.set('note', 0);
        scores.set('task', 0);
        scores.set('idea', 0);
        scores.set('reference', 0);
        scores.set('other', 0);

        // Apply content type indicators from rules
        this.rules.contentTypeIndicators.forEach(({ pattern, type, weight }) => {
            const matches = (lowerText.match(pattern) || []).length;
            if (matches > 0) {
                scores.set(type, (scores.get(type) || 0) + matches * weight);
            }
        });

        // Additional heuristics
        // Code indicators
        if (text.includes('```') || text.includes('function') || text.includes('class') ||
            text.includes('{') || text.includes('}') || text.includes('import')) {
            scores.set('code', (scores.get('code') || 0) + 3);
        }

        // Documentation indicators
        if (lowerText.includes('readme') || lowerText.includes('documentation') ||
            lowerText.includes('guide') || lowerText.includes('tutorial')) {
            scores.set('documentation', (scores.get('documentation') || 0) + 3);
        }

        // Task indicators
        if (lowerText.includes('todo') || lowerText.includes('task') ||
            lowerText.includes('action') || lowerText.includes('complete')) {
            scores.set('task', (scores.get('task') || 0) + 3);
        }

        // Idea indicators
        if (lowerText.includes('idea') || lowerText.includes('concept') ||
            lowerText.includes('brainstorm') || lowerText.includes('proposal')) {
            scores.set('idea', (scores.get('idea') || 0) + 3);
        }

        // Reference indicators
        if (lowerText.includes('reference') || lowerText.includes('link') ||
            lowerText.includes('url') || lowerText.includes('source')) {
            scores.set('reference', (scores.get('reference') || 0) + 2);
        }

        // Find highest scoring type
        let maxScore = 0;
        let bestType: ContentAnalysis['contentType'] = 'note';

        scores.forEach((score, type) => {
            if (score > maxScore) {
                maxScore = score;
                bestType = type;
            }
        });

        return maxScore > 0 ? bestType : 'note';
    }

    /**
     * Analyze sentiment of the content
     */
    private analyzeSentiment(text: string, words: string[]): ContentAnalysis['sentiment'] {
        // Simple sentiment analysis using word lists
        const positiveWords = new Set([
            'good', 'great', 'excellent', 'amazing', 'awesome', 'fantastic', 'wonderful',
            'success', 'complete', 'finished', 'working', 'solved', 'fixed', 'improved',
            'optimized', 'enhanced', 'breakthrough', 'achievement', 'victory'
        ]);

        const negativeWords = new Set([
            'bad', 'terrible', 'awful', 'horrible', 'failed', 'broken', 'error',
            'bug', 'issue', 'problem', 'difficult', 'challenge', 'stuck', 'blocked',
            'frustrated', 'annoying', 'slow', 'inefficient', 'deprecated'
        ]);

        let positiveScore = 0;
        let negativeScore = 0;

        words.forEach(word => {
            const lowerWord = word.toLowerCase();
            if (positiveWords.has(lowerWord)) {
                positiveScore++;
            } else if (negativeWords.has(lowerWord)) {
                negativeScore++;
            }
        });

        // Calculate sentiment score (-1 to 1)
        const totalSentimentWords = positiveScore + negativeScore;
        let score = 0;

        if (totalSentimentWords > 0) {
            score = (positiveScore - negativeScore) / totalSentimentWords;
        }

        // Determine label
        let label: 'positive' | 'neutral' | 'negative';
        if (score > 0.2) {
            label = 'positive';
        } else if (score < -0.2) {
            label = 'negative';
        } else {
            label = 'neutral';
        }

        return { score, label };
    }

    /**
     * Analyze content complexity
     */
    private analyzeComplexity(text: string, words: string[], sentences: string[]): ContentAnalysis['complexity'] {
        let complexityScore = 0;

        // Average sentence length
        const avgSentenceLength = words.length / sentences.length;
        if (avgSentenceLength > 20) {
            complexityScore += 2;
        } else if (avgSentenceLength > 15) {
            complexityScore += 1;
        }

        // Technical terms density
        const techTermCount = words.filter(word =>
            this.techTerms.has(word.toLowerCase())
        ).length;
        const techDensity = techTermCount / words.length;
        if (techDensity > 0.2) {
            complexityScore += 3;
        } else if (techDensity > 0.1) {
            complexityScore += 2;
        } else if (techDensity > 0.05) {
            complexityScore += 1;
        }

        // Code indicators
        if (text.includes('```') || text.includes('function') || text.includes('class')) {
            complexityScore += 2;
        }

        // Long words
        const longWords = words.filter(word => word.length > 8).length;
        const longWordRatio = longWords / words.length;
        if (longWordRatio > 0.3) {
            complexityScore += 2;
        } else if (longWordRatio > 0.2) {
            complexityScore += 1;
        }

        // Determine complexity level
        let level: 'simple' | 'medium' | 'complex';
        if (complexityScore >= 6) {
            level = 'complex';
        } else if (complexityScore >= 3) {
            level = 'medium';
        } else {
            level = 'simple';
        }

        return {
            score: Math.min(complexityScore / 10, 1), // Normalize to 0-1
            level
        };
    }

    /**
     * Detect language of the content
     */
    private detectLanguage(text: string, words: string[]): ContentAnalysis['language'] {
        // Simple language detection based on common words
        const englishWords = new Set([
            'the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with',
            'by', 'from', 'up', 'about', 'into', 'through', 'during', 'before',
            'after', 'above', 'below', 'between', 'among', 'this', 'that', 'these',
            'those', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have',
            'has', 'had', 'do', 'does', 'did', 'will', 'would', 'should', 'could'
        ]);

        const romanianWords = new Set([
            'și', 'în', 'de', 'la', 'cu', 'pe', 'pentru', 'că', 'se', 'este',
            'sunt', 'am', 'ai', 'are', 'avem', 'aveți', 'au', 'nu', 'da', 'sau',
            'dacă', 'când', 'unde', 'cum', 'ce', 'care', 'acest', 'această',
            'acești', 'aceste', 'ei', 'ea', 'ele', 'noi', 'voi', 'meu', 'mea',
            'său', 'sa', 'nostru', 'noastră'
        ]);

        let englishCount = 0;
        let romanianCount = 0;

        words.forEach(word => {
            const lowerWord = word.toLowerCase();
            if (englishWords.has(lowerWord)) {
                englishCount++;
            } else if (romanianWords.has(lowerWord)) {
                romanianCount++;
            }
        });

        // Check for Romanian diacritics
        const romanianDiacritics = /[ăâîșțĂÂÎȘȚ]/;
        if (romanianDiacritics.test(text)) {
            romanianCount += 5; // Boost Romanian score for diacritics
        }

        // Determine language
        if (romanianCount > englishCount) {
            return {
                detected: 'ro',
                confidence: Math.min(romanianCount / words.length * 10, 1)
            };
        } else if (englishCount > 0) {
            return {
                detected: 'en',
                confidence: Math.min(englishCount / words.length * 10, 1)
            };
        } else {
            return {
                detected: 'unknown',
                confidence: 0
            };
        }
    }

    /**
     * Extract named entities from content
     */
    private extractEntities(text: string, words: string[]): ContentAnalysis['entities'] {
        const entities: ContentAnalysis['entities'] = [];

        // Technology entities
        const technologies = [
            'React', 'Vue', 'Angular', 'Node.js', 'TypeScript', 'JavaScript',
            'Python', 'Java', 'Docker', 'Kubernetes', 'AWS', 'Azure', 'GCP',
            'MongoDB', 'PostgreSQL', 'MySQL', 'Redis', 'GraphQL', 'REST API'
        ];

        technologies.forEach(tech => {
            if (text.includes(tech)) {
                entities.push({
                    entity: tech,
                    type: 'TECHNOLOGY',
                    confidence: 0.9
                });
            }
        });

        // URLs
        const urlPattern = /https?:\/\/[^\s]+/g;
        const urls = text.match(urlPattern) || [];
        urls.forEach(url => {
            entities.push({
                entity: url,
                type: 'URL',
                confidence: 1.0
            });
        });

        // Email addresses
        const emailPattern = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g;
        const emails = text.match(emailPattern) || [];
        emails.forEach(email => {
            entities.push({
                entity: email,
                type: 'EMAIL',
                confidence: 1.0
            });
        });

        // File paths
        const filePathPattern = /[a-zA-Z]:\\(?:[^\\/:*?"<>|\r\n]+\\)*[^\\/:*?"<>|\r\n]*|\/(?:[^\/\s]+\/)*[^\/\s]*/g;
        const filePaths = text.match(filePathPattern) || [];
        filePaths.forEach(path => {
            if (path.length > 5) { // Filter out short matches
                entities.push({
                    entity: path,
                    type: 'FILE_PATH',
                    confidence: 0.8
                });
            }
        });

        return entities.slice(0, 10); // Limit to top 10 entities
    }

    /**
     * Extract key phrases from content
     */
    private extractKeyPhrases(text: string, words: string[]): ContentAnalysis['keyPhrases'] {
        const phrases: Array<{ phrase: string; frequency: number }> = [];

        // Extract 2-3 word phrases
        for (let i = 0; i < words.length - 1; i++) {
            const word1 = words[i].toLowerCase();
            const word2 = words[i + 1].toLowerCase();

            // Skip if either word is a stop word
            if (this.stopWords.has(word1) || this.stopWords.has(word2)) {
                continue;
            }

            const phrase2 = `${word1} ${word2}`;
            let existing = phrases.find(p => p.phrase === phrase2);
            if (existing) {
                existing.frequency++;
            } else {
                phrases.push({ phrase: phrase2, frequency: 1 });
            }

            // 3-word phrases
            if (i < words.length - 2) {
                const word3 = words[i + 2].toLowerCase();
                if (!this.stopWords.has(word3)) {
                    const phrase3 = `${word1} ${word2} ${word3}`;
                    existing = phrases.find(p => p.phrase === phrase3);
                    if (existing) {
                        existing.frequency++;
                    } else {
                        phrases.push({ phrase: phrase3, frequency: 1 });
                    }
                }
            }
        }

        // Convert to key phrases with importance scores
        return phrases
            .filter(p => p.frequency > 1 || p.phrase.length > 10) // Filter meaningful phrases
            .sort((a, b) => b.frequency - a.frequency)
            .slice(0, 10)
            .map(p => ({
                phrase: p.phrase,
                importance: Math.min(p.frequency / words.length * 100, 1)
            }));
    }

    /**
     * Calculate readability score (simplified Flesch Reading Ease)
     */
    private calculateReadability(text: string, sentences: string[], words: string[]): number {
        if (sentences.length === 0 || words.length === 0) {
            return 0;
        }

        const avgSentenceLength = words.length / sentences.length;
        const syllableCount = words.reduce((count, word) => count + this.countSyllables(word), 0);
        const avgSyllablesPerWord = syllableCount / words.length;

        // Simplified Flesch Reading Ease formula
        const score = 206.835 - (1.015 * avgSentenceLength) - (84.6 * avgSyllablesPerWord);

        // Convert to 0-1 scale (higher is more readable)
        return Math.max(0, Math.min(1, score / 100));
    }

    /**
     * Count syllables in a word (approximation)
     */
    private countSyllables(word: string): number {
        word = word.toLowerCase();
        if (word.length <= 3) return 1;

        const vowels = 'aeiouy';
        let syllableCount = 0;
        let previousWasVowel = false;

        for (let i = 0; i < word.length; i++) {
            const isVowel = vowels.includes(word[i]);
            if (isVowel && !previousWasVowel) {
                syllableCount++;
            }
            previousWasVowel = isVowel;
        }

        // Handle silent 'e'
        if (word.endsWith('e')) {
            syllableCount--;
        }

        return Math.max(1, syllableCount);
    }

    /**
     * Tokenize text into words
     */
    private tokenize(text: string): string[] {
        return text
            .replace(/[^\w\s]/g, ' ') // Replace punctuation with spaces
            .split(/\s+/)
            .filter(word => word.length > 0);
    }

    /**
     * Split text into sentences
     */
    private splitIntoSentences(text: string): string[] {
        return text
            .split(/[.!?]+/)
            .map(s => s.trim())
            .filter(s => s.length > 0);
    }

    /**
     * Initialize stop words
     */
    private initializeStopWords(): void {
        this.stopWords = new Set([
            'a', 'an', 'and', 'are', 'as', 'at', 'be', 'by', 'for', 'from',
            'has', 'he', 'in', 'is', 'it', 'its', 'of', 'on', 'that', 'the',
            'to', 'was', 'will', 'with', 'but', 'or', 'not', 'this', 'have',
            'i', 'you', 'we', 'they', 'she', 'been', 'had', 'their', 'said',
            'each', 'which', 'their', 'time', 'if', 'up', 'out', 'many', 'then',
            'them', 'can', 'would', 'there', 'all', 'were', 'when', 'who', 'oil',
            'use', 'her', 'than', 'now', 'find', 'more', 'may', 'water', 'long',
            'little', 'very', 'after', 'words', 'called', 'just', 'where', 'most',
            'know', 'get', 'through', 'back', 'much', 'before', 'go', 'good', 'new',
            'write', 'our', 'used', 'me', 'man', 'too', 'any', 'day', 'same', 'right',
            'look', 'think', 'also', 'around', 'another', 'came', 'come', 'work',
            'three', 'must', 'because', 'does', 'part', 'even', 'place', 'well',
            'such', 'here', 'take', 'why', 'help', 'put', 'different', 'away',
            'again', 'off', 'went', 'old', 'number', 'great', 'tell', 'men',
            'say', 'small', 'every', 'found', 'still', 'between', 'name', 'should',
            'home', 'big', 'give', 'air', 'line', 'set', 'own', 'under', 'read',
            'last', 'never', 'us', 'left', 'end', 'along', 'while', 'might',
            'next', 'sound', 'below', 'saw', 'something', 'thought', 'both',
            'few', 'those', 'always', 'show', 'large', 'often', 'together',
            'asked', 'house', 'don', 'world', 'going', 'want', 'school', 'important',
            'until', 'form', 'food', 'keep', 'children', 'feet', 'land', 'side',
            'without', 'boy', 'once', 'animal', 'life', 'enough', 'took', 'sometimes',
            'four', 'head', 'above', 'kind', 'began', 'almost', 'live', 'page',
            'got', 'earth', 'need', 'far', 'hand', 'high', 'year', 'mother',
            'light', 'country', 'father', 'let', 'night', 'picture', 'being',
            'study', 'second', 'soon', 'story', 'since', 'white', 'ever', 'paper',
            'hard', 'near', 'sentence', 'better', 'best', 'across', 'during',
            'today', 'however', 'sure', 'knew', 'it\'s', 'try', 'told', 'young',
            'sun', 'thing', 'whole', 'hear', 'example', 'heard', 'several',
            'change', 'answer', 'room', 'sea', 'against', 'top', 'turned',
            'learn', 'point', 'city', 'play', 'toward', 'five', 'himself',
            'usually', 'money', 'seen', 'didn', 'car', 'morning', 'i\'m',
            'body', 'upon', 'family', 'later', 'turn', 'move', 'face', 'door',
            'cut', 'done', 'group', 'true', 'leave', 'color', 'red', 'friend',
            'pretty', 'eat', 'front', 'feel', 'fact', 'weeks', 'ran', 'idea',
            'fish', 'fun', 'could', 'plan', 'include', 'seem', 'though', 'really'
        ]);
    }

    /**
     * Initialize technical terms
     */
    private initializeTechTerms(): void {
        this.techTerms = new Map([
            // Programming languages
            ['javascript', { category: 'programming', importance: 0.9 }],
            ['typescript', { category: 'programming', importance: 0.9 }],
            ['python', { category: 'programming', importance: 0.9 }],
            ['java', { category: 'programming', importance: 0.8 }],
            ['go', { category: 'programming', importance: 0.7 }],
            ['rust', { category: 'programming', importance: 0.7 }],
            ['c++', { category: 'programming', importance: 0.8 }],
            ['c#', { category: 'programming', importance: 0.8 }],
            ['php', { category: 'programming', importance: 0.7 }],
            ['ruby', { category: 'programming', importance: 0.7 }],

            // Frameworks and libraries
            ['react', { category: 'frontend', importance: 0.9 }],
            ['vue', { category: 'frontend', importance: 0.8 }],
            ['angular', { category: 'frontend', importance: 0.8 }],
            ['node', { category: 'backend', importance: 0.9 }],
            ['express', { category: 'backend', importance: 0.8 }],
            ['django', { category: 'backend', importance: 0.8 }],
            ['flask', { category: 'backend', importance: 0.7 }],
            ['spring', { category: 'backend', importance: 0.8 }],
            ['nextjs', { category: 'fullstack', importance: 0.8 }],
            ['nuxt', { category: 'fullstack', importance: 0.7 }],

            // Databases
            ['mongodb', { category: 'database', importance: 0.8 }],
            ['postgresql', { category: 'database', importance: 0.8 }],
            ['mysql', { category: 'database', importance: 0.8 }],
            ['redis', { category: 'database', importance: 0.7 }],
            ['elasticsearch', { category: 'database', importance: 0.7 }],
            ['sqlite', { category: 'database', importance: 0.6 }],

            // DevOps and Infrastructure
            ['docker', { category: 'devops', importance: 0.8 }],
            ['kubernetes', { category: 'devops', importance: 0.8 }],
            ['aws', { category: 'cloud', importance: 0.8 }],
            ['azure', { category: 'cloud', importance: 0.8 }],
            ['gcp', { category: 'cloud', importance: 0.8 }],
            ['jenkins', { category: 'devops', importance: 0.7 }],
            ['github', { category: 'devops', importance: 0.7 }],
            ['gitlab', { category: 'devops', importance: 0.7 }],

            // Web technologies
            ['html', { category: 'web', importance: 0.7 }],
            ['css', { category: 'web', importance: 0.7 }],
            ['sass', { category: 'web', importance: 0.6 }],
            ['webpack', { category: 'tooling', importance: 0.7 }],
            ['vite', { category: 'tooling', importance: 0.7 }],
            ['tailwind', { category: 'styling', importance: 0.7 }],

            // Testing
            ['jest', { category: 'testing', importance: 0.7 }],
            ['cypress', { category: 'testing', importance: 0.7 }],
            ['playwright', { category: 'testing', importance: 0.7 }],
            ['vitest', { category: 'testing', importance: 0.6 }],

            // AI/ML
            ['tensorflow', { category: 'ai', importance: 0.8 }],
            ['pytorch', { category: 'ai', importance: 0.8 }],
            ['openai', { category: 'ai', importance: 0.8 }],
            ['huggingface', { category: 'ai', importance: 0.7 }],
            ['llm', { category: 'ai', importance: 0.8 }],
            ['gpt', { category: 'ai', importance: 0.8 }],

            // Protocols and formats
            ['rest', { category: 'api', importance: 0.8 }],
            ['graphql', { category: 'api', importance: 0.8 }],
            ['grpc', { category: 'api', importance: 0.7 }],
            ['json', { category: 'format', importance: 0.7 }],
            ['xml', { category: 'format', importance: 0.6 }],
            ['yaml', { category: 'format', importance: 0.6 }],

            // Security
            ['jwt', { category: 'security', importance: 0.8 }],
            ['oauth', { category: 'security', importance: 0.8 }],
            ['ssl', { category: 'security', importance: 0.7 }],
            ['https', { category: 'security', importance: 0.7 }],
            ['encryption', { category: 'security', importance: 0.8 }]
        ]);
    }

    /**
     * Initialize categorization rules
     */
    private initializeCategorizationRules(): void {
        this.rules = {
            projectPatterns: [
                { pattern: /memorai|memory|mcp/gi, project: 'MemorAI', weight: 0.9 },
                { pattern: /codai|coding|development/gi, project: 'CODAI', weight: 0.8 },
                { pattern: /romai|romanian|romania/gi, project: 'RomAI', weight: 0.9 },
                { pattern: /bancai|banking|financial/gi, project: 'BancAI', weight: 0.8 },
                { pattern: /cbd|database|storage/gi, project: 'CBD Database', weight: 0.8 }
            ],

            tagPatterns: [
                { pattern: /\b(react|reactjs)\b/gi, tag: 'React', weight: 0.9 },
                { pattern: /\b(typescript|ts)\b/gi, tag: 'TypeScript', weight: 0.9 },
                { pattern: /\b(javascript|js)\b/gi, tag: 'JavaScript', weight: 0.8 },
                { pattern: /\b(node|nodejs)\b/gi, tag: 'Node.js', weight: 0.8 },
                { pattern: /\b(api|rest|endpoint)\b/gi, tag: 'API', weight: 0.7 },
                { pattern: /\b(frontend|ui|component)\b/gi, tag: 'Frontend', weight: 0.7 },
                { pattern: /\b(backend|server|service)\b/gi, tag: 'Backend', weight: 0.7 },
                { pattern: /\b(database|db|sql)\b/gi, tag: 'Database', weight: 0.7 },
                { pattern: /\b(docker|container)\b/gi, tag: 'Docker', weight: 0.8 },
                { pattern: /\b(aws|amazon|cloud)\b/gi, tag: 'AWS', weight: 0.7 },
                { pattern: /\b(testing|test|spec)\b/gi, tag: 'Testing', weight: 0.7 },
                { pattern: /\b(security|auth|authentication)\b/gi, tag: 'Security', weight: 0.8 },
                { pattern: /\b(performance|optimization|speed)\b/gi, tag: 'Performance', weight: 0.7 },
                { pattern: /\b(documentation|docs|readme)\b/gi, tag: 'Documentation', weight: 0.7 },
                { pattern: /\b(bug|error|fix|issue)\b/gi, tag: 'Bug', weight: 0.8 },
                { pattern: /\b(feature|enhancement|improvement)\b/gi, tag: 'Feature', weight: 0.7 },
                { pattern: /\b(deployment|deploy|production)\b/gi, tag: 'Deployment', weight: 0.8 },
                { pattern: /\b(mobile|ios|android)\b/gi, tag: 'Mobile', weight: 0.8 },
                { pattern: /\b(ai|artificial intelligence|machine learning|ml)\b/gi, tag: 'AI', weight: 0.8 }
            ],

            importanceFactors: [
                { pattern: /\b(critical|urgent|asap|emergency)\b/gi, factor: 3, reason: 'Critical/urgent content' },
                { pattern: /\b(important|priority|high)\b/gi, factor: 2, reason: 'High priority content' },
                { pattern: /\b(bug|error|issue|problem)\b/gi, factor: 2, reason: 'Problem/issue content' },
                { pattern: /\b(security|vulnerability|breach)\b/gi, factor: 3, reason: 'Security-related content' },
                { pattern: /\b(production|live|deployment)\b/gi, factor: 2, reason: 'Production environment' },
                { pattern: /\b(deadline|due|schedule)\b/gi, factor: 2, reason: 'Time-sensitive content' },
                { pattern: /\b(meeting|discussion|decision)\b/gi, factor: 1, reason: 'Meeting/decision content' },
                { pattern: /\b(todo|task|action)\b/gi, factor: 1, reason: 'Action item content' },
                { pattern: /\b(idea|concept|innovation)\b/gi, factor: 1, reason: 'Innovative content' },
                { pattern: /\b(performance|optimization|slow)\b/gi, factor: 2, reason: 'Performance-related content' }
            ],

            contentTypeIndicators: [
                { pattern: /```|function|class|import|export/gi, type: 'code', weight: 3 },
                { pattern: /readme|documentation|guide|tutorial|manual/gi, type: 'documentation', weight: 3 },
                { pattern: /todo|task|action|complete|finish/gi, type: 'task', weight: 3 },
                { pattern: /idea|concept|brainstorm|proposal|suggestion/gi, type: 'idea', weight: 3 },
                { pattern: /reference|link|url|source|cite/gi, type: 'reference', weight: 2 },
                { pattern: /note|remember|memo|thought/gi, type: 'note', weight: 2 }
            ]
        };
    }
}

// Export singleton instance
export const contentAnalyzer = new ContentAnalyzer();
