import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { Amplify } from 'aws-amplify';
import { Authenticator } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';

// Absolute clean production v6 config structure without object grouping error
Amplify.configure({
  Auth: {
    Cognito: {
      userPoolId: 'ap-south-1_f5W7ko2yG',
      userPoolClientId: '72ise1snosrj9f8tefr0ntrmcb',
      identityPoolId: 'ap-south-1:4007676d-177d-4941-93ce-3a6e68098395'
    }
  },
  API: {
    GraphQL: {
      endpoint: 'https://amazonaws.com',
      region: 'ap-south-1',
      defaultAuthMode: 'userPool'
    }
  }
});

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <Authenticator>
      {({ signOut, user }) => <App signOut={signOut} user={user} />}
    </Authenticator>
  </React.StrictMode>
);

reportWebVitals();
