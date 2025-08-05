// MemorAI Go Client
// Official Go client library for the MemorAI platform
package memorai

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io/ioutil"
	"net/http"
	"net/url"
	"strconv"
	"time"
)

// Client represents the MemorAI API client
type Client struct {
	APIKey     string
	BaseURL    string
	HTTPClient *http.Client
	UserAgent  string
	Debug      bool
}

// NewClient creates a new MemorAI client
func NewClient(apiKey, baseURL string) *Client {
	if baseURL == "" {
		baseURL = "https://api.memorai.ro"
	}

	return &Client{
		APIKey:  apiKey,
		BaseURL: baseURL,
		HTTPClient: &http.Client{
			Timeout: 30 * time.Second,
		},
		UserAgent: "MemorAI-Go-Client/1.0.0",
		Debug:     false,
	}
}

// Memory represents a memory object
type Memory struct {
	ID           string                 `json:"id,omitempty"`
	Content      string                 `json:"content"`
	Title        string                 `json:"title,omitempty"`
	Category     string                 `json:"category,omitempty"`
	Tags         []string              `json:"tags,omitempty"`
	Metadata     map[string]interface{} `json:"metadata,omitempty"`
	UserID       string                 `json:"user_id,omitempty"`
	CollectionID string                 `json:"collection_id,omitempty"`
	Status       string                 `json:"status,omitempty"`
	CreatedAt    time.Time             `json:"created_at,omitempty"`
	UpdatedAt    time.Time             `json:"updated_at,omitempty"`
}

// SearchOptions represents search configuration
type SearchOptions struct {
	Algorithm     string    `json:"algorithm,omitempty"`
	Limit         int       `json:"limit,omitempty"`
	Offset        int       `json:"offset,omitempty"`
	Categories    []string  `json:"categories,omitempty"`
	Tags          []string  `json:"tags,omitempty"`
	UserID        string    `json:"user_id,omitempty"`
	CollectionID  string    `json:"collection_id,omitempty"`
	DateFrom      time.Time `json:"date_from,omitempty"`
	DateTo        time.Time `json:"date_to,omitempty"`
	MinSimilarity float64   `json:"min_similarity,omitempty"`
}

// SearchResult represents search results
type SearchResult struct {
	Memories        []Memory `json:"memories"`
	TotalCount      int      `json:"total_count"`
	Query           string   `json:"query"`
	Algorithm       string   `json:"algorithm"`
	ExecutionTimeMs float64  `json:"execution_time_ms"`
	Page            int      `json:"page"`
	PerPage         int      `json:"per_page"`
	HasMore         bool     `json:"has_more"`
}

// AnalyticsData represents analytics information
type AnalyticsData struct {
	TotalMemories       int                    `json:"total_memories"`
	MemoriesByCategory  map[string]int         `json:"memories_by_category"`
	MemoriesByTag       map[string]int         `json:"memories_by_tag"`
	SearchAnalytics     map[string]interface{} `json:"search_analytics"`
	PerformanceMetrics  map[string]float64     `json:"performance_metrics"`
	UserActivity        map[string]interface{} `json:"user_activity"`
	StorageUsage        map[string]interface{} `json:"storage_usage"`
	GeneratedAt         time.Time              `json:"generated_at"`
}

// SystemHealth represents system health status
type SystemHealth struct {
	Status      string                 `json:"status"`
	Timestamp   time.Time              `json:"timestamp"`
	Services    map[string]interface{} `json:"services"`
	Performance map[string]float64     `json:"performance"`
	Version     string                 `json:"version,omitempty"`
}

// APIResponse represents a generic API response
type APIResponse struct {
	Success   bool        `json:"success"`
	Data      interface{} `json:"data,omitempty"`
	Message   string      `json:"message,omitempty"`
	Error     interface{} `json:"error,omitempty"`
	Timestamp time.Time   `json:"timestamp"`
}

// makeRequest makes an HTTP request to the API
func (c *Client) makeRequest(method, endpoint string, body interface{}) (*http.Response, error) {
	url := fmt.Sprintf("%s%s", c.BaseURL, endpoint)
	
	var reqBody []byte
	var err error
	
	if body != nil {
		reqBody, err = json.Marshal(body)
		if err != nil {
			return nil, fmt.Errorf("failed to marshal request body: %w", err)
		}
	}
	
	req, err := http.NewRequest(method, url, bytes.NewBuffer(reqBody))
	if err != nil {
		return nil, fmt.Errorf("failed to create request: %w", err)
	}
	
	// Set headers
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Accept", "application/json")
	req.Header.Set("User-Agent", c.UserAgent)
	
	if c.APIKey != "" {
		req.Header.Set("Authorization", "Bearer "+c.APIKey)
	}
	
	resp, err := c.HTTPClient.Do(req)
	if err != nil {
		return nil, fmt.Errorf("request failed: %w", err)
	}
	
	return resp, nil
}

// parseResponse parses API response
func (c *Client) parseResponse(resp *http.Response, result interface{}) error {
	defer resp.Body.Close()
	
	body, err := ioutil.ReadAll(resp.Body)
	if err != nil {
		return fmt.Errorf("failed to read response body: %w", err)
	}
	
	if c.Debug {
		fmt.Printf("Response: %s\n", string(body))
	}
	
	if resp.StatusCode >= 400 {
		var apiErr APIResponse
		if err := json.Unmarshal(body, &apiErr); err == nil && !apiErr.Success {
			return fmt.Errorf("API error (%d): %s", resp.StatusCode, apiErr.Message)
		}
		return fmt.Errorf("HTTP error: %d", resp.StatusCode)
	}
	
	var apiResp APIResponse
	if err := json.Unmarshal(body, &apiResp); err != nil {
		return fmt.Errorf("failed to parse response: %w", err)
	}
	
	if !apiResp.Success {
		return fmt.Errorf("API returned error: %s", apiResp.Message)
	}
	
	// Marshal and unmarshal to convert interface{} to target struct
	dataBytes, err := json.Marshal(apiResp.Data)
	if err != nil {
		return fmt.Errorf("failed to marshal response data: %w", err)
	}
	
	if err := json.Unmarshal(dataBytes, result); err != nil {
		return fmt.Errorf("failed to unmarshal response data: %w", err)
	}
	
	return nil
}

// CreateMemory creates a new memory
func (c *Client) CreateMemory(content, title, category string, tags []string, metadata map[string]interface{}) (*Memory, error) {
	reqBody := map[string]interface{}{
		"content":  content,
		"title":    title,
		"category": category,
		"tags":     tags,
		"metadata": metadata,
	}
	
	resp, err := c.makeRequest("POST", "/api/memories", reqBody)
	if err != nil {
		return nil, err
	}
	
	var memory Memory
	if err := c.parseResponse(resp, &memory); err != nil {
		return nil, err
	}
	
	return &memory, nil
}

// GetMemory retrieves a memory by ID
func (c *Client) GetMemory(id string) (*Memory, error) {
	endpoint := fmt.Sprintf("/api/memories/%s", id)
	
	resp, err := c.makeRequest("GET", endpoint, nil)
	if err != nil {
		return nil, err
	}
	
	var memory Memory
	if err := c.parseResponse(resp, &memory); err != nil {
		return nil, err
	}
	
	return &memory, nil
}

// UpdateMemory updates an existing memory
func (c *Client) UpdateMemory(id string, updates map[string]interface{}) (*Memory, error) {
	endpoint := fmt.Sprintf("/api/memories/%s", id)
	
	resp, err := c.makeRequest("PUT", endpoint, updates)
	if err != nil {
		return nil, err
	}
	
	var memory Memory
	if err := c.parseResponse(resp, &memory); err != nil {
		return nil, err
	}
	
	return &memory, nil
}

// DeleteMemory deletes a memory
func (c *Client) DeleteMemory(id string) error {
	endpoint := fmt.Sprintf("/api/memories/%s", id)
	
	resp, err := c.makeRequest("DELETE", endpoint, nil)
	if err != nil {
		return err
	}
	
	var result map[string]interface{}
	return c.parseResponse(resp, &result)
}

// ListMemories retrieves a list of memories
func (c *Client) ListMemories(limit, offset int, category string, tags []string) ([]Memory, error) {
	params := url.Values{}
	params.Add("limit", strconv.Itoa(limit))
	params.Add("offset", strconv.Itoa(offset))
	
	if category != "" {
		params.Add("category", category)
	}
	
	if len(tags) > 0 {
		for _, tag := range tags {
			params.Add("tags", tag)
		}
	}
	
	endpoint := "/api/memories"
	if len(params) > 0 {
		endpoint += "?" + params.Encode()
	}
	
	resp, err := c.makeRequest("GET", endpoint, nil)
	if err != nil {
		return nil, err
	}
	
	var result struct {
		Memories []Memory `json:"memories"`
	}
	
	if err := c.parseResponse(resp, &result); err != nil {
		return nil, err
	}
	
	return result.Memories, nil
}

// SearchMemories searches for memories
func (c *Client) SearchMemories(query string, options *SearchOptions) (*SearchResult, error) {
	reqBody := map[string]interface{}{
		"query": query,
	}
	
	if options != nil {
		if options.Algorithm != "" {
			reqBody["algorithm"] = options.Algorithm
		}
		if options.Limit > 0 {
			reqBody["limit"] = options.Limit
		}
		if options.Offset > 0 {
			reqBody["offset"] = options.Offset
		}
		if len(options.Categories) > 0 {
			reqBody["categories"] = options.Categories
		}
		if len(options.Tags) > 0 {
			reqBody["tags"] = options.Tags
		}
		if options.UserID != "" {
			reqBody["user_id"] = options.UserID
		}
		if options.CollectionID != "" {
			reqBody["collection_id"] = options.CollectionID
		}
		if !options.DateFrom.IsZero() {
			reqBody["date_from"] = options.DateFrom
		}
		if !options.DateTo.IsZero() {
			reqBody["date_to"] = options.DateTo
		}
		if options.MinSimilarity > 0 {
			reqBody["min_similarity"] = options.MinSimilarity
		}
	}
	
	resp, err := c.makeRequest("POST", "/api/search", reqBody)
	if err != nil {
		return nil, err
	}
	
	var result SearchResult
	if err := c.parseResponse(resp, &result); err != nil {
		return nil, err
	}
	
	return &result, nil
}

// GetSimilarMemories finds similar memories
func (c *Client) GetSimilarMemories(memoryID string, limit int) ([]Memory, error) {
	params := url.Values{}
	params.Add("limit", strconv.Itoa(limit))
	
	endpoint := fmt.Sprintf("/api/memories/%s/similar?%s", memoryID, params.Encode())
	
	resp, err := c.makeRequest("GET", endpoint, nil)
	if err != nil {
		return nil, err
	}
	
	var result struct {
		Memories []Memory `json:"memories"`
	}
	
	if err := c.parseResponse(resp, &result); err != nil {
		return nil, err
	}
	
	return result.Memories, nil
}

// GetAnalytics retrieves analytics data
func (c *Client) GetAnalytics() (*AnalyticsData, error) {
	resp, err := c.makeRequest("GET", "/api/analytics", nil)
	if err != nil {
		return nil, err
	}
	
	var analytics AnalyticsData
	if err := c.parseResponse(resp, &analytics); err != nil {
		return nil, err
	}
	
	return &analytics, nil
}

// GetHealth checks system health
func (c *Client) GetHealth() (*SystemHealth, error) {
	resp, err := c.makeRequest("GET", "/api/health", nil)
	if err != nil {
		return nil, err
	}
	
	var health SystemHealth
	if err := c.parseResponse(resp, &health); err != nil {
		return nil, err
	}
	
	return &health, nil
}

// GetVersion retrieves API version information
func (c *Client) GetVersion() (map[string]interface{}, error) {
	resp, err := c.makeRequest("GET", "/api/version", nil)
	if err != nil {
		return nil, err
	}
	
	var version map[string]interface{}
	if err := c.parseResponse(resp, &version); err != nil {
		return nil, err
	}
	
	return version, nil
}
