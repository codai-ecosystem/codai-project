/**
 * 🧪 CODAI AIChat Component Tests
 * Testing AI chat interface and functionality
 */
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import AIChat from '../../src/components/AIChat';

// Mock AI service
jest.mock('../../src/services/aiService', () => ({
  sendMessage: jest.fn().mockResolvedValue({
    response: 'Here is your React component:\n\n```jsx\nconst LoginForm = () => {\n  return <form>Login Form</form>;\n};\n```',
    code: 'const LoginForm = () => {\n  return <form>Login Form</form>;\n};',
    suggestions: ['Add form validation', 'Style the form', 'Add error handling']
  }),
  getConversationHistory: jest.fn().mockResolvedValue([]),
  clearConversation: jest.fn().mockResolvedValue()
}));

// Mock clipboard API
Object.assign(navigator, {
  clipboard: {
    writeText: jest.fn().mockResolvedValue()
  }
});

const mockProjectId = 'project-123';

describe('AIChat Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders chat interface elements', () => {
    render(<AIChat projectId={mockProjectId} />);
    
    expect(screen.getByTestId('chat-container')).toBeInTheDocument();
    expect(screen.getByTestId('chat-input')).toBeInTheDocument();
    expect(screen.getByTestId('send-message-btn')).toBeInTheDocument();
    expect(screen.getByTestId('chat-messages')).toBeInTheDocument();
  });

  test('sends message to AI service', async () => {
    const aiService = require('../../src/services/aiService');
    render(<AIChat projectId={mockProjectId} />);
    
    const input = screen.getByTestId('chat-input');
    const sendButton = screen.getByTestId('send-message-btn');
    
    fireEvent.change(input, { target: { value: 'Create a login form component' } });
    fireEvent.click(sendButton);
    
    await waitFor(() => {
      expect(screen.getByTestId('user-message')).toHaveTextContent('Create a login form component');
      expect(aiService.sendMessage).toHaveBeenCalledWith('Create a login form component', mockProjectId);
    });
  });

  test('displays AI response with code blocks', async () => {
    render(<AIChat projectId={mockProjectId} />);
    
    const input = screen.getByTestId('chat-input');
    fireEvent.change(input, { target: { value: 'Show me a React component' } });
    fireEvent.click(screen.getByTestId('send-message-btn'));
    
    await waitFor(() => {
      expect(screen.getByTestId('ai-response')).toBeInTheDocument();
      expect(screen.getByTestId('code-block')).toBeInTheDocument();
      expect(screen.getByText(/const LoginForm/)).toBeInTheDocument();
    });
  });

  test('copies code to clipboard', async () => {
    render(<AIChat projectId={mockProjectId} />);
    
    const input = screen.getByTestId('chat-input');
    fireEvent.change(input, { target: { value: 'Generate a component' } });
    fireEvent.click(screen.getByTestId('send-message-btn'));
    
    await waitFor(() => {
      expect(screen.getByTestId('copy-code-btn')).toBeInTheDocument();
    });
    
    fireEvent.click(screen.getByTestId('copy-code-btn'));
    
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
      expect.stringContaining('const LoginForm')
    );
    
    // Should show copy confirmation
    await waitFor(() => {
      expect(screen.getByText(/Copied to clipboard/i)).toBeInTheDocument();
    });
  });

  test('applies code to project', async () => {
    render(<AIChat projectId={mockProjectId} />);
    
    const input = screen.getByTestId('chat-input');
    fireEvent.change(input, { target: { value: 'Create a new component' } });
    fireEvent.click(screen.getByTestId('send-message-btn'));
    
    await waitFor(() => {
      expect(screen.getByTestId('apply-code-btn')).toBeInTheDocument();
    });
    
    fireEvent.click(screen.getByTestId('apply-code-btn'));
    
    // Should open file creation modal
    await waitFor(() => {
      expect(screen.getByTestId('create-file-modal')).toBeVisible();
      expect(screen.getByText(/Apply Code to Project/i)).toBeInTheDocument();
    });
  });

  test('handles AI service errors gracefully', async () => {
    const aiService = require('../../src/services/aiService');
    aiService.sendMessage.mockRejectedValueOnce(new Error('AI service unavailable'));
    
    render(<AIChat projectId={mockProjectId} />);
    
    const input = screen.getByTestId('chat-input');
    fireEvent.change(input, { target: { value: 'Test message' } });
    fireEvent.click(screen.getByTestId('send-message-btn'));
    
    await waitFor(() => {
      expect(screen.getByTestId('error-message')).toHaveTextContent('AI service unavailable');
      expect(screen.getByTestId('retry-btn')).toBeInTheDocument();
    });
  });

  test('shows typing indicator during AI response', async () => {
    const aiService = require('../../src/services/aiService');
    
    // Create a delayed promise to simulate loading
    let resolvePromise;
    const delayedPromise = new Promise(resolve => {
      resolvePromise = resolve;
    });
    aiService.sendMessage.mockReturnValue(delayedPromise);
    
    render(<AIChat projectId={mockProjectId} />);
    
    const input = screen.getByTestId('chat-input');
    fireEvent.change(input, { target: { value: 'Test message' } });
    fireEvent.click(screen.getByTestId('send-message-btn'));
    
    // Should show typing indicator
    expect(screen.getByTestId('typing-indicator')).toBeInTheDocument();
    expect(screen.getByText(/AI is thinking/i)).toBeInTheDocument();
    
    // Resolve the promise
    resolvePromise({
      response: 'Test response',
      code: 'console.log("test");'
    });
    
    await waitFor(() => {
      expect(screen.queryByTestId('typing-indicator')).not.toBeInTheDocument();
    });
  });

  test('supports message history and conversation context', async () => {
    const aiService = require('../../src/services/aiService');
    render(<AIChat projectId={mockProjectId} />);
    
    // Send first message
    const input = screen.getByTestId('chat-input');
    fireEvent.change(input, { target: { value: 'Create a button component' } });
    fireEvent.click(screen.getByTestId('send-message-btn'));
    
    await waitFor(() => {
      expect(screen.getByTestId('user-message')).toBeInTheDocument();
    });
    
    // Send follow-up message
    fireEvent.change(input, { target: { value: 'Make it blue' } });
    fireEvent.click(screen.getByTestId('send-message-btn'));
    
    await waitFor(() => {
      const userMessages = screen.getAllByTestId('user-message');
      expect(userMessages).toHaveLength(2);
      expect(userMessages[1]).toHaveTextContent('Make it blue');
    });
  });

  test('clears conversation history', async () => {
    const aiService = require('../../src/services/aiService');
    render(<AIChat projectId={mockProjectId} />);
    
    // Send a message first
    const input = screen.getByTestId('chat-input');
    fireEvent.change(input, { target: { value: 'Test message' } });
    fireEvent.click(screen.getByTestId('send-message-btn'));
    
    await waitFor(() => {
      expect(screen.getByTestId('user-message')).toBeInTheDocument();
    });
    
    // Clear conversation
    fireEvent.click(screen.getByTestId('clear-chat-btn'));
    
    await waitFor(() => {
      expect(screen.queryByTestId('user-message')).not.toBeInTheDocument();
      expect(aiService.clearConversation).toHaveBeenCalledWith(mockProjectId);
    });
  });

  test('handles Enter key to send message', async () => {
    const aiService = require('../../src/services/aiService');
    render(<AIChat projectId={mockProjectId} />);
    
    const input = screen.getByTestId('chat-input');
    fireEvent.change(input, { target: { value: 'Test with Enter key' } });
    fireEvent.keyDown(input, { key: 'Enter' });
    
    await waitFor(() => {
      expect(aiService.sendMessage).toHaveBeenCalledWith('Test with Enter key', mockProjectId);
    });
  });

  test('prevents sending empty messages', () => {
    render(<AIChat projectId={mockProjectId} />);
    
    const sendButton = screen.getByTestId('send-message-btn');
    expect(sendButton).toBeDisabled();
    
    const input = screen.getByTestId('chat-input');
    fireEvent.change(input, { target: { value: '   ' } }); // Only whitespace
    
    expect(sendButton).toBeDisabled();
    
    fireEvent.change(input, { target: { value: 'Valid message' } });
    expect(sendButton).not.toBeDisabled();
  });

  test('displays AI suggestions for follow-up questions', async () => {
    render(<AIChat projectId={mockProjectId} />);
    
    const input = screen.getByTestId('chat-input');
    fireEvent.change(input, { target: { value: 'Create a form' } });
    fireEvent.click(screen.getByTestId('send-message-btn'));
    
    await waitFor(() => {
      expect(screen.getByTestId('ai-suggestions')).toBeInTheDocument();
      expect(screen.getByText('Add form validation')).toBeInTheDocument();
      expect(screen.getByText('Style the form')).toBeInTheDocument();
      expect(screen.getByText('Add error handling')).toBeInTheDocument();
    });
    
    // Click on a suggestion
    fireEvent.click(screen.getByText('Add form validation'));
    
    expect(input.value).toBe('Add form validation');
  });
});
