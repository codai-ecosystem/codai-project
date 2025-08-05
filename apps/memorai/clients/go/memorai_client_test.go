package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"time"
)

// MemoryData represents memory information
type MemoryData struct {
	ID       string            `json:"id,omitempty"`
	Content  string            `json:"content"`
	Title    string            `json:"title,omitempty"`
	Category string            `json:"category,omitempty"`
	Tags     []string          `json:"tags,omitempty"`
	Metadata map[string]string `json:"metadata,omitempty"`
}

// SearchResult represents search response
type SearchResult struct {
	Memories []MemoryData `json:"memories"`
	Total    int          `json:"total"`
	Took     int          `json:"took"`
}

// HealthResponse represents health check response
type HealthResponse struct {
	Service   string `json:"service"`
	Status    string `json:"status"`
	Message   string `json:"message"`
	Timestamp string `json:"timestamp"`
}

// MemorAIClient represents the Go client for MemorAI
type MemorAIClient struct {
	BaseURL    string
	HTTPClient *http.Client
	APIKey     string
}

// NewMemorAIClient creates a new MemorAI client
func NewMemorAIClient(baseURL, apiKey string) *MemorAIClient {
	return &MemorAIClient{
		BaseURL: baseURL,
		HTTPClient: &http.Client{
			Timeout: 30 * time.Second,
		},
		APIKey: apiKey,
	}
}

// makeRequest makes HTTP request to MemorAI API
func (c *MemorAIClient) makeRequest(method, endpoint string, payload interface{}) (*http.Response, error) {
	var reqBody io.Reader

	if payload != nil {
		jsonData, err := json.Marshal(payload)
		if err != nil {
			return nil, fmt.Errorf("failed to marshal payload: %w", err)
		}
		reqBody = bytes.NewBuffer(jsonData)
	}

	req, err := http.NewRequest(method, c.BaseURL+endpoint, reqBody)
	if err != nil {
		return nil, fmt.Errorf("failed to create request: %w", err)
	}

	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Accept", "application/json")
	req.Header.Set("User-Agent", "MemorAI-Go-Client/1.0.0")

	if c.APIKey != "" {
		req.Header.Set("Authorization", "Bearer "+c.APIKey)
	}

	return c.HTTPClient.Do(req)
}

// Health checks MemorAI service health
func (c *MemorAIClient) Health() (*HealthResponse, error) {
	resp, err := c.makeRequest("GET", "/api/health", nil)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	var health HealthResponse
	if err := json.NewDecoder(resp.Body).Decode(&health); err != nil {
		return nil, fmt.Errorf("failed to decode health response: %w", err)
	}

	return &health, nil
}

// CreateMemory creates a new memory
func (c *MemorAIClient) CreateMemory(memory MemoryData) (*MemoryData, error) {
	resp, err := c.makeRequest("POST", "/api/memories", memory)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusCreated && resp.StatusCode != http.StatusOK {
		body, _ := io.ReadAll(resp.Body)
		return nil, fmt.Errorf("API error %d: %s", resp.StatusCode, string(body))
	}

	var result struct {
		Data MemoryData `json:"data"`
	}
	if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
		return nil, fmt.Errorf("failed to decode create response: %w", err)
	}

	return &result.Data, nil
}

// GetMemory retrieves a memory by ID
func (c *MemorAIClient) GetMemory(id string) (*MemoryData, error) {
	resp, err := c.makeRequest("GET", "/api/memories/"+id, nil)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	if resp.StatusCode == http.StatusNotFound {
		return nil, fmt.Errorf("memory not found: %s", id)
	}

	if resp.StatusCode != http.StatusOK {
		body, _ := io.ReadAll(resp.Body)
		return nil, fmt.Errorf("API error %d: %s", resp.StatusCode, string(body))
	}

	var result struct {
		Data MemoryData `json:"data"`
	}
	if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
		return nil, fmt.Errorf("failed to decode get response: %w", err)
	}

	return &result.Data, nil
}

// SearchMemories searches for memories
func (c *MemorAIClient) SearchMemories(query string, limit int) (*SearchResult, error) {
	payload := map[string]interface{}{
		"query": query,
		"limit": limit,
	}

	resp, err := c.makeRequest("POST", "/api/search", payload)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		body, _ := io.ReadAll(resp.Body)
		return nil, fmt.Errorf("search API error %d: %s", resp.StatusCode, string(body))
	}

	var result struct {
		Data SearchResult `json:"data"`
	}
	if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
		return nil, fmt.Errorf("failed to decode search response: %w", err)
	}

	return &result.Data, nil
}

// UpdateMemory updates an existing memory
func (c *MemorAIClient) UpdateMemory(id string, updates MemoryData) (*MemoryData, error) {
	resp, err := c.makeRequest("PUT", "/api/memories/"+id, updates)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	if resp.StatusCode == http.StatusNotFound {
		return nil, fmt.Errorf("memory not found: %s", id)
	}

	if resp.StatusCode != http.StatusOK {
		body, _ := io.ReadAll(resp.Body)
		return nil, fmt.Errorf("update API error %d: %s", resp.StatusCode, string(body))
	}

	var result struct {
		Data MemoryData `json:"data"`
	}
	if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
		return nil, fmt.Errorf("failed to decode update response: %w", err)
	}

	return &result.Data, nil
}

// DeleteMemory deletes a memory by ID
func (c *MemorAIClient) DeleteMemory(id string) error {
	resp, err := c.makeRequest("DELETE", "/api/memories/"+id, nil)
	if err != nil {
		return err
	}
	defer resp.Body.Close()

	if resp.StatusCode == http.StatusNotFound {
		return fmt.Errorf("memory not found: %s", id)
	}

	if resp.StatusCode != http.StatusOK && resp.StatusCode != http.StatusNoContent {
		body, _ := io.ReadAll(resp.Body)
		return fmt.Errorf("delete API error %d: %s", resp.StatusCode, string(body))
	}

	return nil
}

// TestMemorAIClient demonstrates client usage
func TestMemorAIClient() {
	client := NewMemorAIClient("http://localhost:4006", "")

	fmt.Println("🦫 MemorAI Go Client Test Suite")
	fmt.Println("================================")
	fmt.Printf("📅 Timestamp: %s\n", time.Now().Format(time.RFC3339))
	fmt.Printf("🌐 Target URL: %s\n", client.BaseURL)
	fmt.Println()

	// Test 1: Health check
	fmt.Println("1️⃣ Testing health check...")
	health, err := client.Health()
	if err != nil {
		log.Printf("❌ Health check failed: %v", err)
	} else {
		fmt.Printf("✅ Health check: %s\n", health.Status)
		fmt.Printf("   Service: %s\n", health.Service)
		fmt.Printf("   Message: %s\n", health.Message)
	}

	// Test 2: Create memory
	fmt.Println("\n2️⃣ Testing memory creation...")
	memory := MemoryData{
		Content:  "Go client test memory",
		Title:    "Test Memory",
		Category: "test",
		Tags:     []string{"go", "client", "test"},
		Metadata: map[string]string{"source": "go-client"},
	}

	created, err := client.CreateMemory(memory)
	if err != nil {
		log.Printf("⚠️ Memory creation failed: %v", err)
		log.Println("   (This is expected if API endpoints are not implemented)")
	} else {
		fmt.Printf("✅ Memory created: %s\n", created.ID)
		fmt.Printf("   Title: %s\n", created.Title)
		fmt.Printf("   Content: %s\n", created.Content)

		// Test 3: Get memory
		fmt.Println("\n3️⃣ Testing memory retrieval...")
		retrieved, err := client.GetMemory(created.ID)
		if err != nil {
			log.Printf("⚠️ Memory retrieval failed: %v", err)
		} else {
			fmt.Printf("✅ Memory retrieved: %s\n", retrieved.ID)
			fmt.Printf("   Match: %t\n", retrieved.ID == created.ID)
		}

		// Test 4: Update memory
		fmt.Println("\n4️⃣ Testing memory update...")
		updates := MemoryData{Title: "Updated Test Memory"}
		updated, err := client.UpdateMemory(created.ID, updates)
		if err != nil {
			log.Printf("⚠️ Memory update failed: %v", err)
		} else {
			fmt.Printf("✅ Memory updated: %s\n", updated.Title)
		}

		// Test 5: Delete memory
		fmt.Println("\n5️⃣ Testing memory deletion...")
		if err := client.DeleteMemory(created.ID); err != nil {
			log.Printf("⚠️ Memory deletion failed: %v", err)
		} else {
			fmt.Println("✅ Memory deleted successfully")
		}
	}

	// Test 6: Search memories
	fmt.Println("\n6️⃣ Testing memory search...")
	searchResult, err := client.SearchMemories("go", 5)
	if err != nil {
		log.Printf("⚠️ Search failed: %v", err)
	} else {
		fmt.Printf("✅ Search completed: %d results\n", len(searchResult.Memories))
		fmt.Printf("   Total: %d\n", searchResult.Total)
		fmt.Printf("   Query time: %dms\n", searchResult.Took)
	}

	fmt.Println("\n🎉 Go client test completed!")
}

func main() {
	TestMemorAIClient()
}
