# FitAI Frontend

A modern React TypeScript application providing an intuitive interface for AI-powered fitness coaching and workout tracking.

## 🛠️ Tech Stack

- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **State Management**: React Context API
- **Routing**: React Router v6
- **Forms**: React Hook Form
- **Charts**: Recharts
- **Authentication**: Google OAuth + JWT
- **HTTP Client**: Axios
- **Icons**: Lucide React

## 📁 Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── Layout.tsx      # Main layout wrapper
│   ├── WorkoutTracker.tsx
│   ├── ProgressCalendar.tsx
│   └── ...
├── contexts/           # React Context providers
│   ├── AuthContext.tsx
│   ├── UserContext.tsx
│   └── NotificationContext.tsx
├── hooks/              # Custom React hooks
│   ├── useApi.ts
│   ├── useWorkouts.ts
│   └── useRecommendations.ts
├── pages/              # Page components
│   ├── Dashboard.tsx
│   ├── AuthPage.tsx
│   └── ...
├── services/           # API service layer
│   ├── api.ts
│   ├── authService.ts
│   └── exerciseService.ts
├── utils/              # Utility functions
│   ├── dateUtils.ts
│   └── ...
└── types/              # TypeScript type definitions
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Environment Setup**
   ```bash
   cp .env.example .env
   ```

3. **Configure environment variables**
   ```env
   VITE_API_BASE_URL=http://localhost:8000/api/v1
   VITE_NODE_ENV=development
   VITE_GOOGLE_CLIENT_ID=your-google-client-id
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **Access the application**
   - Open http://localhost:5173

## 📦 Available Scripts

```bash
# Development
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build

# Code Quality
npm run lint         # Run ESLint
npm run type-check   # Run TypeScript compiler
```

## 🏗️ Architecture

### Component Architecture

The application follows a modular component architecture with clear separation of concerns:

- **Pages**: Top-level route components
- **Components**: Reusable UI components
- **Contexts**: Global state management
- **Hooks**: Custom logic encapsulation
- **Services**: API communication layer

### State Management

State is managed using React Context API with multiple providers:

- **AuthContext**: User authentication and session management
- **UserContext**: Workout data and user statistics
- **NotificationContext**: Toast notifications and alerts
- **AutoFillContext**: Form auto-fill functionality

### API Integration

The application uses a service layer pattern for API communication:

```typescript
// Example service usage
import { exerciseService } from '../services/exerciseService';

const exercises = await exerciseService.getExercisesByUser();
```

## 🎨 Styling

### Tailwind CSS

The application uses Tailwind CSS for styling with a custom design system:

```css
/* Custom color palette */
primary: {
  400: '#a78bfa',
  500: '#8b5cf6',
  600: '#7c3aed',
}
```

### Responsive Design

All components are built with mobile-first responsive design:

```jsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  {/* Responsive grid */}
</div>
```

## 🔐 Authentication

### Google OAuth Integration

```typescript
import { GoogleOAuthProvider } from '@react-oauth/google';

// Wrap app with provider
<GoogleOAuthProvider clientId={clientId}>
  <App />
</GoogleOAuthProvider>
```

### JWT Token Management

Tokens are automatically managed by the auth service:

```typescript
// Automatic token refresh
apiClient.interceptors.response.use(
  response => response,
  async error => {
    if (error.response?.status === 401) {
      await refreshToken();
      return retryRequest();
    }
  }
);
```

## 📊 Data Flow

### Workout Creation Flow

1. User fills WorkoutPlanCreator form
2. Data sent to AI service for plan generation
3. Generated plan stored in backend
4. UserContext syncs new data
5. Dashboard updates with new workouts

### Exercise Tracking Flow

1. User interacts with WorkoutTracker
2. Local state updates immediately (optimistic updates)
3. Changes queued for backend sync
4. Periodic sync with server
5. Error handling and retry logic

## 🎯 Key Features

### AI Workout Plan Creator

Multi-step form with intelligent auto-fill:

```typescript
const { autoFillData, saveAutoFillData } = useAutoFill();

// Auto-fill previous form data
useEffect(() => {
  if (hasAutoFillData) {
    fieldsToFill.forEach(field => {
      setValue(field, getFieldValue(field));
    });
  }
}, [hasAutoFillData]);
```

### Real-time Workout Tracker

Optimistic updates with offline support:

```typescript
const updateExerciseLocally = (exerciseId, updates) => {
  // Update UI immediately
  setLocalExercises(prev => 
    prev.map(ex => ex.id === exerciseId ? { ...ex, ...updates } : ex)
  );
  
  // Queue for backend sync
  setPendingUpdates(prev => ({ ...prev, [exerciseId]: updates }));
};
```

### Progress Calendar

Visual workout tracking with status indicators:

```typescript
const getWorkoutStatus = (date) => {
  const dayWorkouts = getWorkoutsByDate(date);
  
  if (dayWorkouts.length === 0) return 'none';
  if (dayWorkouts.every(w => w.completed)) return 'completed';
  if (dayWorkouts.some(w => w.completed)) return 'partial';
  return isPastDate(date) ? 'missed' : 'scheduled';
};
```

## 🔧 Performance Optimizations

### Code Splitting

```typescript
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Recommendations = lazy(() => import('./pages/Recommendations'));
```

### Memoization

```typescript
const memoizedStats = useMemo(() => 
  calculateUserStats(workouts), [workouts]
);

const MemoizedComponent = memo(ExpensiveComponent);
```

### Bundle Optimization

```typescript
// vite.config.ts
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          router: ['react-router-dom'],
          ui: ['framer-motion', 'lucide-react'],
        }
      }
    }
  }
});
```

## 🧪 Testing

### Component Testing

```typescript
import { render, screen } from '@testing-library/react';
import { WorkoutCard } from './WorkoutCard';

test('renders workout information', () => {
  render(<WorkoutCard workout={mockWorkout} />);
  expect(screen.getByText('Push Day')).toBeInTheDocument();
});
```

### Integration Testing

```typescript
// Test complete user flows
test('user can create and track workout', async () => {
  // Test workout creation flow
  // Test workout tracking
  // Verify data persistence
});
```

## 🚀 Deployment

### Build for Production

```bash
npm run build
```

### Netlify Deployment

The application includes Netlify configuration:

```toml
# netlify.toml
[build]
  base = "frontend"
  publish = "dist"
  command = "npm run build"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

### Environment Variables

Production environment variables:

```env
VITE_API_BASE_URL=https://your-api-domain.com/api/v1
VITE_NODE_ENV=production
VITE_GOOGLE_CLIENT_ID=your-production-google-client-id
```

## 🐛 Error Handling

### Error Boundaries

```typescript
class ErrorBoundary extends Component {
  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }
  
  render() {
    if (this.state.hasError) {
      return <ErrorFallback />;
    }
    return this.props.children;
  }
}
```

### API Error Handling

```typescript
// Automatic retry with exponential backoff
const retryRequest = async (requestFn, maxRetries = 3) => {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await requestFn();
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      await delay(1000 * Math.pow(2, i));
    }
  }
};
```

## 📱 Mobile Optimization

### Touch-Friendly Design

```css
/* Minimum touch target sizes */
@media (max-width: 640px) {
  button, .btn {
    min-height: 44px;
    min-width: 44px;
  }
}
```

### Responsive Typography

```css
.text-responsive-lg {
  font-size: 1.125rem;
}

@media (min-width: 640px) {
  .text-responsive-lg {
    font-size: 1.25rem;
  }
}
```

## 🔍 Debugging

### Development Tools

```typescript
// React DevTools integration
if (process.env.NODE_ENV === 'development') {
  // Enable additional debugging features
}
```

### Console Logging

```typescript
// Structured logging
const logger = {
  info: (message, data) => console.log(`[INFO] ${message}`, data),
  error: (message, error) => console.error(`[ERROR] ${message}`, error),
};
```

## 📈 Analytics

### User Interaction Tracking

```typescript
// Track user actions
const trackEvent = (eventName, properties) => {
  if (analytics) {
    analytics.track(eventName, properties);
  }
};
```

## 🤝 Contributing

### Code Style

- Use TypeScript for all new code
- Follow ESLint configuration
- Use Prettier for code formatting
- Write meaningful component and function names

### Component Guidelines

```typescript
// Good component structure
interface ComponentProps {
  title: string;
  onAction: () => void;
}

const Component: React.FC<ComponentProps> = ({ title, onAction }) => {
  return (
    <div className="component-wrapper">
      <h2>{title}</h2>
      <button onClick={onAction}>Action</button>
    </div>
  );
};
```

### Pull Request Process

1. Create feature branch from main
2. Implement changes with tests
3. Update documentation
4. Submit PR with clear description
5. Address review feedback

---

For more information, see the [main README](../README.md) or contact the development team.