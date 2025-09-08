# Modular Decision-Making System

This document describes the new modular decision-making system that allows easy switching between different decision interfaces.

## Overview

The system now supports multiple decision-making modes that can be easily swapped by changing a single configuration line. Each mode provides different user interfaces and workflows while maintaining the same underlying data structures and state management.

## Available Decision Modes

### 1. **Manual Mode** (`'manual'`)
- **File**: `src/pages/decision.tsx`
- **Description**: Original decision-making interface with full multi-step workflow
- **Features**: 
  - Objective selection and ranking
  - Robot suggestion review
  - Manual data input
  - Hypothesis confidence updates
  - Complete user control

### 2. **Autonomous Mode** (`'autonomous'`)
- **File**: `src/pages/autonomous-decision.tsx`
- **Description**: Fully automated data collection with human oversight
- **Features**:
  - Automatic data collection
  - Control panel for human intervention
  - Pause/resume/stop functionality
  - Real-time monitoring
  - Switch to manual mode capability

### 3. **New Modular Mode** (`'new'`)
- **File**: `src/pages/decision-new.tsx`
- **Description**: Center panel interface with floating navigation
- **Features**:
  - Center panel for data collection focus
  - Floating action buttons for panel navigation
  - Tooltip-based navigation
  - Modular panel system
  - Streamlined data input

## Configuration

To switch between modes, simply change one line in `src/App.tsx`:

```typescript
// Configuration: Change this line to switch between decision modes
type DecisionMode = 'manual' | 'autonomous' | 'new';
const DECISION_MODE: DecisionMode = 'new'; // Options: 'manual', 'autonomous', 'new'
```

## New Modular Mode Details

### Layout Structure
```
┌─────────────────┬──────────┬─────────────────┐
│                 │          │                 │
│   Charts Panel  │  Center  │  Image Panel    │
│   (Left 5/12)   │  Panel   │  (Right 5/12)   │
│                 │ (2/12)   │                 │
│                 │          │                 │
└─────────────────┴──────────┴─────────────────┘
```

### Center Panel Types

1. **Data Collection Panel** (Default)
   - Strength data input (3 values)
   - Location input (0-1 range)
   - Submit button
   - Focused on data entry

2. **Objectives Panel**
   - Display current objectives
   - Objective count
   - Read-only view

3. **AI Suggestions Panel**
   - Show robot suggestions
   - Suggestion count
   - Location details

4. **Analysis Panel**
   - Sample count
   - Current step
   - Hypothesis confidence
   - Progress tracking

5. **Settings Panel**
   - Refresh charts
   - Show/hide robot suggestions
   - System controls

### Floating Navigation
- **Position**: Right side of screen
- **Style**: Floating Action Buttons (FAB)
- **Features**: 
  - Tooltips for each panel
  - Visual feedback for active panel
  - Hover effects
  - Responsive design

## Navigation Flow

### Current Flow
```
Intro → Decision → Conclusion → Survey
```

### Decision Mode Selection
The decision step now dynamically loads the appropriate component based on `DECISION_MODE`:

```typescript
const getDecisionComponent = () => {
  switch (DECISION_MODE) {
    case 'autonomous':
      return <AutonomousDecision />;
    case 'new':
      return <DecisionNew />;
    case 'manual':
    default:
      return <Decision />;
  }
};
```

## Key Features

### 1. **Easy Mode Switching**
- Single line configuration change
- No code duplication
- Maintains all existing functionality

### 2. **Consistent State Management**
- All modes use the same global state
- Compatible data structures
- Shared components and utilities

### 3. **Modular Design**
- Each mode is self-contained
- Easy to add new modes
- Clean separation of concerns

### 4. **Responsive Interface**
- Works on different screen sizes
- Mobile-friendly design
- Adaptive layouts

## Usage Examples

### Switch to Manual Mode
```typescript
const DECISION_MODE: DecisionMode = 'manual';
```

### Switch to Autonomous Mode
```typescript
const DECISION_MODE: DecisionMode = 'autonomous';
```

### Switch to New Modular Mode
```typescript
const DECISION_MODE: DecisionMode = 'new';
```

## Adding New Modes

To add a new decision mode:

1. **Create the component file**:
   ```typescript
   // src/pages/decision-custom.tsx
   export default function DecisionCustom() {
     // Your custom implementation
   }
   ```

2. **Add import to App.tsx**:
   ```typescript
   import DecisionCustom from './pages/decision-custom';
   ```

3. **Update the type and switch**:
   ```typescript
   type DecisionMode = 'manual' | 'autonomous' | 'new' | 'custom';
   const DECISION_MODE: DecisionMode = 'custom';
   
   const getDecisionComponent = () => {
     switch (DECISION_MODE) {
       case 'custom':
         return <DecisionCustom />;
       // ... other cases
     }
   };
   ```

## File Structure

```
src/
├── pages/
│   ├── decision.tsx          # Manual mode
│   ├── autonomous-decision.tsx # Autonomous mode
│   └── decision-new.tsx      # New modular mode
├── styles/
│   ├── decision.scss         # Manual mode styles
│   ├── autonomous-decision.scss # Autonomous mode styles
│   └── decision-new.scss     # New modular mode styles
└── App.tsx                   # Configuration and routing
```

## Benefits

1. **Flexibility**: Easy to switch between different interfaces
2. **Maintainability**: Each mode is isolated and focused
3. **Extensibility**: Simple to add new modes
4. **Consistency**: Shared state and data structures
5. **User Experience**: Different interfaces for different use cases

## Future Enhancements

1. **Dynamic Mode Switching**: Allow switching modes during runtime
2. **Mode-Specific Settings**: Configuration options for each mode
3. **Hybrid Modes**: Combine features from different modes
4. **User Preferences**: Remember user's preferred mode
5. **A/B Testing**: Easy comparison between different interfaces 