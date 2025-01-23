import * as React from 'react';
import { useState, useEffect } from 'react';
import { 
  FormControl, 
  FormGroup, 
  FormControlLabel, 
  Checkbox, 
  TextField,
  Button,
  Box,
  Typography,
  Paper
} from '@material-ui/core';

interface PathState {
  selectedPath: number;
  pathData: any;  // Replace with proper type from your path data structure
  step: number;
  informationGain: number[];
  discrepancyValues: number[];
}

interface ChatPanelProps {
  informationGain: number;
  discrepancyValue: number;
  pathState: PathState;  // Add path state to props
}

interface Message {
  sender: 'user' | 'assistant';
  text: string;
}

interface BeliefState {
  needsData: boolean;  // First option - Passive mode
  hasDiscrepancy: boolean;  // Second option - Active mode
  supportsHypothesis: boolean;  // Third option - Superactive mode
  otherBelief: boolean;
  otherBeliefText: string;
}

export const ChatPanel: React.FC<ChatPanelProps> = ({
  informationGain,
  discrepancyValue,
  pathState
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [beliefs, setBeliefs] = useState<BeliefState>({
    needsData: false,
    hasDiscrepancy: false,
    supportsHypothesis: false,
    otherBelief: false,
    otherBeliefText: ''
  });

  // Maybe track an internal "mode" state if not passed from outside
  // or infer from your beliefs. For demo, let's keep it simple:
  const [mode, setMode] = useState<'autonomous' | 'passive' | 'active' | 'adaptive'>('autonomous');

  // Initialize with default message
  useEffect(() => {
    const initialMessage: Message = {
      sender: 'assistant',
      text: "Welcome to the LLM chat. Mode set to Autonomous by default. Adjust as needed."
    };
    setMessages([initialMessage]);
  }, []);

  // Add effect to handle autonomous mode behavior
  useEffect(() => {
    const handleAutonomousMode = async () => {
      if (beliefs.needsData || beliefs.hasDiscrepancy || beliefs.supportsHypothesis) {
        const mode = beliefs.needsData ? 'passive' : 
                    beliefs.hasDiscrepancy ? 'active' : 
                    beliefs.supportsHypothesis ? 'superactive' : 'passive';

        // Query LLM for autonomous decision
        const response = await fetch('http://127.0.0.1:8090/api/autonomous-decision', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            mode,
            pathState,
            infoGain: informationGain,
            discrepancy: discrepancyValue,
            beliefs
          })
        });

        if (response.ok) {
          const data = await response.json();
          setMessages(prev => [...prev, {
            sender: 'assistant',
            text: data.explanation
          }]);
        }
      }
    };

    handleAutonomousMode();
  }, [beliefs, pathState]);

  const handleBeliefChange = (belief: keyof BeliefState) => {
    setBeliefs(prev => ({
      ...prev,
      [belief]: !prev[belief]
    }));
  };

  const handleModeSwitch = (newMode: 'autonomous' | 'passive' | 'active' | 'adaptive') => {
    setMode(newMode);
    let intro = "";
    if (newMode === 'autonomous') {
      intro = "LLM (Assistant): I will begin by determining the objective and objective mode. No user intervention needed.";
    } else if (newMode === 'passive') {
      intro = "LLM (Assistant): You are in Passive Mode. You can still provide input whenever you want.";
    } else if (newMode === 'active') {
      intro = "LLM (Assistant): Active Mode: I will prompt you at each step for instructions.";
    } else if (newMode === 'adaptive') {
      intro = "LLM (Assistant): Adaptive Mode: I adapt the plan based on your feedback and the data.";
    }
    setMessages(prev => [...prev, { sender: 'assistant', text: intro }]);
  };

  const handleSend = async () => {
    if (!inputText.trim()) return;

    const userMsg: Message = {
      sender: 'user',
      text: inputText.trim()
    };
    setMessages(prev => [...prev, userMsg]);
    setInputText('');

    // Example mode-based message from the assistant
    let assistantReply = "";
    if (mode === 'autonomous') {
      assistantReply = "LLM (Assistant): I'm proceeding autonomously. Let me update the chart with gains...";
    } else if (mode === 'passive') {
      assistantReply = "LLM (Assistant): I see you have input. I'll incorporate that into the path planning!";
    } else if (mode === 'active') {
      assistantReply = "LLM (Assistant): Thanks for your confirmation. Next step is collecting data at [Location X].";
    } else if (mode === 'adaptive') {
      assistantReply = "LLM (Assistant): I will adapt my plan based on your feedback. Checking discrepancy values now...";
    }

    const newAssistantMsg: Message = {
      sender: 'assistant',
      text: assistantReply
    };

    setMessages(prev => [...prev, newAssistantMsg]);

    try {
      const response = await fetch('http://127.0.0.1:8090/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, newAssistantMsg],
          infoGain: informationGain,
          discrepancy: discrepancyValue,
          mode,
          beliefs,
          userContext: {
            mode,
            beliefs: {
              needsMoreData: beliefs.needsData,
              hasDiscrepancy: beliefs.hasDiscrepancy,
              supportsHypothesis: beliefs.supportsHypothesis,
              otherBelief: beliefs.otherBeliefText
            }
          }
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const assistantMessage: Message = {
          sender: 'assistant',
          text: data.response
        };
        setMessages(prev => [...prev, assistantMessage]);
      }
    } catch (error) {
      console.error('Error in LLM chat:', error);
    }
  };

  return (
    <Paper style={{ padding: '20px', margin: '20px', maxWidth: '600px' }}>
      <FormControl component="fieldset" style={{ marginBottom: '20px', width: '100%' }}>
        <FormGroup>
          <FormControlLabel
            control={<Checkbox 
              checked={beliefs.needsData}
              onChange={() => handleBeliefChange('needsData')}
            />}
            label="There are areas along the dune transect where data is needed"
          />
          <FormControlLabel
            control={<Checkbox 
              checked={beliefs.hasDiscrepancy}
              onChange={() => handleBeliefChange('hasDiscrepancy')}
            />}
            label="There is a discrepancy between the data and the hypothesis"
          />
          <FormControlLabel
            control={<Checkbox 
              checked={beliefs.supportsHypothesis}
              onChange={() => handleBeliefChange('supportsHypothesis')}
            />}
            label="The data seems to be supporting the hypothesis but needs evaluation"
          />
          <FormControlLabel
            control={<Checkbox 
              checked={beliefs.otherBelief}
              onChange={() => handleBeliefChange('otherBelief')}
            />}
            label="I hold a different belief"
          />
          {beliefs.otherBelief && (
            <TextField
              fullWidth
              multiline
              rows={2}
              variant="outlined"
              placeholder="Please describe your additional belief..."
              value={beliefs.otherBeliefText}
              onChange={(e) => setBeliefs(prev => ({...prev, otherBeliefText: e.target.value}))}
              style={{ marginTop: '10px' }}
            />
          )}
        </FormGroup>
      </FormControl>

      <Box style={{ height: '300px', overflowY: 'auto', marginBottom: '20px' }}>
        {messages.map((msg, idx) => (
          <Box key={idx} style={{ 
            marginBottom: '10px',
            textAlign: msg.sender === 'user' ? 'right' : 'left'
          }}>
            <Paper style={{
              display: 'inline-block',
              padding: '8px 15px',
              backgroundColor: msg.sender === 'user' ? '#e3f2fd' : '#f5f5f5',
              maxWidth: '70%'
            }}>
              {msg.text}
            </Paper>
          </Box>
        ))}
      </Box>

      <Box display="flex">
        <TextField
          fullWidth
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Type your message..."
          variant="outlined"
          size="small"
        />
        <Button
          variant="contained"
          color="primary"
          onClick={handleSend}
        >
          Send
        </Button>
      </Box>

      {/* Example: mode switch buttons */}
      <Box style={{ marginTop: '10px' }}>
        <Button onClick={() => handleModeSwitch('autonomous')}>Autonomous</Button>
        <Button onClick={() => handleModeSwitch('passive')}>Passive</Button>
        <Button onClick={() => handleModeSwitch('active')}>Active</Button>
        <Button onClick={() => handleModeSwitch('adaptive')}>Adaptive</Button>
      </Box>
    </Paper>
  );
};