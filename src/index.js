import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import '@aws-amplify/ui-react/styles.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { Amplify } from 'aws-amplify';
import { Authenticator } from '@aws-amplify/ui-react';

// Configure Amplify
Amplify.configure({
  Auth: {
    Cognito: {
      userPoolId: process.env.REACT_APP_USER_POOL_ID,
      userPoolClientId: process.env.REACT_APP_USER_POOL_CLIENT_ID,
      identityPoolId: process.env.REACT_APP_IDENTITY_POOL_ID,
    }
  },
  API: {
    GraphQL: {
      endpoint: process.env.REACT_APP_API_ENDPOINT || 'https://your-api-endpoint.amazonaws.com/graphql',
      region: process.env.REACT_APP_AWS_REGION || 'ap-south-1',
      defaultAuthMode: 'userPool'
    }
  }
});

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <Authenticator>
      <App />
    </Authenticator>
  </React.StrictMode>
);

reportWebVitals();
