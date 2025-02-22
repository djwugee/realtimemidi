import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import App from './App';
import './styles/global.css';
import audioReducer from './store/audioSlice';
import projectReducer from './store/projectSlice';
import userReducer from './store/userSlice';
import { initializeAudioContext } from './services/audioEngine';

// Configure the Redux store with reducers for audio, project, and user state
const store = configureStore({
  reducer: {
    audio: audioReducer,
    project: projectReducer,
    user: userReducer,
  },
});

// Initialize the audio context for the application
initializeAudioContext()
  .then(() => {
    console.log('Audio context initialized successfully.');
  })
  .catch((error) => {
    console.error('Error initializing audio context:', error);
  });

// Error Boundary Component to catch and display errors in the application
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by ErrorBoundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary">
          <h1>Something went wrong.</h1>
          <p>Please refresh the page or contact support if the issue persists.</p>
        </div>
      );
    }

    return this.props.children;
  }
}

// Loading state component to display while the application is initializing
const Loading = () => (
  <div className="loading-state">
    <h1>Loading...</h1>
  </div>
);

// Main entry point for the React application
const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('Root element not found. Please ensure there is a div with id="root" in your index.html.');
}

const root = ReactDOM.createRoot(rootElement);

root.render(
  <React.StrictMode>
    <Provider store={store}>
      <ErrorBoundary>
        <React.Suspense fallback={<Loading />}>
          <App />
        </React.Suspense>
      </ErrorBoundary>
    </Provider>
  </React.StrictMode>
);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
