import * as React from 'react' 
import { useState, useRef, useEffect } from 'react';
import { Paper, TextField, Button, Box, Typography, CircularProgress, List, ListItem, Radio, RadioGroup, FormControlLabel, Checkbox, FormGroup } from '@material-ui/core';

interface Message {
  text: string;
  isUser: boolean;
  type?: 'belief_options' | 'normal';
  options?: string[];
}

interface ChatPanelProps {
  mode: 'passive' | 'active' | 'superactive';
}

const ChatPanel: React.FC<ChatPanelProps> = ({ mode }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const formatMessage = (text: string) => {
    // Check if the message contains numbered options
    if (text.includes("Please consider the following beliefs based on the data:")) {
      const options = text
        .split('\n')
        .filter(line => line.match(/^\d\./))
        .map(line => line.trim());
      
      return {
        text: text.split("Please consider the following beliefs")[0],
        type: 'belief_options' as const,
        options
      };
    }
    return { text, type: 'normal' as const };
  };

  const renderMessage = (message: Message, index: number) => {
    if (message.type === 'belief_options') {
      return (
        <Box
          key={index}
          style={{
            alignSelf: 'flex-start',
            maxWidth: '90%',
            backgroundColor: '#f5f5f5',
            padding: '15px',
            borderRadius: '15px',
            marginBottom: '10px'
          }}
        >
          <Typography variant="body1" style={{ marginBottom: '10px' }}>
            {message.text}
          </Typography>
          <FormGroup>
            {message.options?.map((option, optIndex) => (
              <FormControlLabel
                key={optIndex}
                control={
                  <Checkbox 
                    onChange={(e) => {
                      // Handle checkbox changes if needed
                    }}
                  />
                }
                label={option}
              />
            ))}
          </FormGroup>
        </Box>
      );
    }

    return (
      <Box
        key={index}
        style={{
          alignSelf: message.isUser ? 'flex-end' : 'flex-start',
          maxWidth: '70%',
          backgroundColor: message.isUser ? '#e3f2fd' : '#f5f5f5',
          padding: '10px 15px',
          borderRadius: '15px',
          wordBreak: 'break-word'
        }}
      >
        <Typography variant="body1">
          {message.text}
        </Typography>
      </Box>
    );
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    setMessages(prev => [...prev, { text: inputMessage, isUser: true, type: 'normal' }]);
    setIsLoading(true);

    try {
      const response = await fetch('http://127.0.0.1:5000/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ 
          message: inputMessage,
          mode: mode 
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const formattedMessage = formatMessage(data.response);
      
      setMessages(prev => [...prev, { 
        ...formattedMessage,
        isUser: false 
      }]);
    } catch (error) {
      console.error('Error sending message:', error);
      setMessages(prev => [...prev, { 
        text: "Sorry, there was an error processing your message. Please try again.", 
        isUser: false,
        type: 'normal'
      }]);
    } finally {
      setIsLoading(false);
      setInputMessage('');
    }
  };

  return (
    <Paper 
      elevation={3} 
      style={{ 
        width: '550px', 
        height: '300px',
        marginLeft: '50px',
        marginTop: '20px',
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      <Box
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '10px'
        }}
      >
        {messages.map((message, index) => renderMessage(message, index))}
        {isLoading && (
          <Box
            style={{
              alignSelf: 'flex-start',
              padding: '10px'
            }}
          >
            <CircularProgress size={20} />
          </Box>
        )}
        <div ref={messagesEndRef} />
      </Box>
      
      <Box
        style={{
          display: 'flex',
          padding: '10px',
          gap: '10px',
          borderTop: '1px solid #e0e0e0'
        }}
      >
        <TextField
          fullWidth
          variant="outlined"
          size="small"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          onKeyPress={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSendMessage();
            }
          }}
          placeholder="Type your message..."
          disabled={isLoading}
        />
        <Button 
          variant="contained" 
          color="primary"
          onClick={handleSendMessage}
          disabled={isLoading}
        >
          Send
        </Button>
      </Box>
    </Paper>
  );
};

export default ChatPanel; 