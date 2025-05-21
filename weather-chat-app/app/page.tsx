'use client';

import { useState, CSSProperties } from 'react';

// Define types for chat messages
interface ChatMessage {
  type: 'user' | 'agent';
  message: string;
}

export default function Home() {
  const [inputValue, setInputValue] = useState<string>('');
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const handleSubmitMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage: ChatMessage = { type: 'user', message: inputValue };
    setChatHistory(prev => [...prev, userMessage]);
    setIsLoading(true);
    const currentInput = inputValue; // Store current input before clearing
    setInputValue(''); // Clear input immediately for better UX

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: currentInput }), // Use stored input
      });

      if (!response.ok) {
        // Try to parse error from API response body
        let errorData;
        try {
          errorData = await response.json();
        } catch (parseError) {
          // If response is not JSON, use status text
          throw new Error(`API error: ${response.statusText} (Status: ${response.status})`);
        }
        throw new Error(errorData.error || `API error: ${response.statusText} (Status: ${response.status})`);
      }

      const data = await response.json();
      const agentMessage: ChatMessage = { type: 'agent', message: data.reply || 'No reply from agent.' };
      setChatHistory(prev => [...prev, agentMessage]);

    } catch (error) {
      console.error('Failed to send message:', error);
      const errorMessageText = error instanceof Error ? error.message : 'An unknown error occurred.';
      const errorMessage: ChatMessage = { type: 'agent', message: `Error: ${errorMessageText}` };
      setChatHistory(prev => [...prev, errorMessage]);
    } finally {
      // inputValue is already cleared
      setIsLoading(false);
    }
  };

  // Basic inline styles using CSSProperties for type safety
  const styles: { [key: string]: CSSProperties } = {
    container: { fontFamily: 'Arial, sans-serif', maxWidth: '700px', margin: '30px auto', padding: '20px', border: '1px solid #ddd', borderRadius: '10px', boxShadow: '0 0 10px rgba(0,0,0,0.05)', backgroundColor: '#f9f9f9' },
    header: { textAlign: 'center' as 'center', marginBottom: '20px', color: '#333' },
    chatWindow: { height: '450px', overflowY: 'auto', border: '1px solid #eee', padding: '15px', marginBottom: '15px', backgroundColor: '#fff', borderRadius: '5px' },
    messageContainer: { display: 'flex', marginBottom: '12px' },
    messageBubble: { padding: '10px 15px', borderRadius: '18px', maxWidth: '75%', wordBreak: 'break-word' },
    userMessageBubble: { backgroundColor: '#007bff', color: 'white', marginLeft: 'auto' },
    agentMessageBubble: { backgroundColor: '#e9ecef', color: '#333', marginRight: 'auto' },
    messageSender: { fontSize: '0.8em', color: '#666', marginBottom: '3px' },
    inputArea: { display: 'flex', marginTop: '20px', borderTop: '1px solid #eee', paddingTop: '15px' },
    input: { flexGrow: 1, padding: '12px', border: '1px solid #ccc', borderRadius: '5px 0 0 5px', fontSize: '1em' },
    button: { padding: '12px 20px', border: 'none', backgroundColor: '#007bff', color: 'white', borderRadius: '0 5px 5px 0', cursor: 'pointer', fontSize: '1em' },
    buttonDisabled: { backgroundColor: '#aaa' }
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.header}>Weather Chat AI</h1>
      <div style={styles.chatWindow}>
        {chatHistory.map((chat, index) => (
          <div key={index} style={{
            ...styles.messageContainer,
            justifyContent: chat.type === 'user' ? 'flex-end' : 'flex-start',
          }}>
            <div style={{
              ...styles.messageBubble,
              ...(chat.type === 'user' ? styles.userMessageBubble : styles.agentMessageBubble)
            }}>
              <p style={{ margin: 0 }}>{chat.message}</p>
            </div>
          </div>
        ))}
      </div>
      <div style={styles.inputArea}>
        <input
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onKeyPress={(e) => {
            if (e.key === 'Enter' && !isLoading) {
              handleSubmitMessage();
            }
          }}
          style={styles.input}
          placeholder="Ask about the weather..."
          disabled={isLoading}
        />
        <button
          onClick={handleSubmitMessage}
          style={isLoading ? {...styles.button, ...styles.buttonDisabled} : styles.button}
          disabled={isLoading}
        >
          {isLoading ? '...' : 'Send'}
        </button>
      </div>
    </div>
  );
}
