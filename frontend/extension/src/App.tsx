export const login = async (email: string, password: string) => {
  const res = await fetch('http://localhost:5000/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  const data = await res.json();
  if (data.token) {
    await chrome.storage.local.set({ token: data.token });
  }
  return data;
};
import { useState } from 'react';
import { Router } from './router';

function App() {
  const [route, setRoute] = useState<'login' | 'signup' | 'highlights' | 'forgot' | 'changepassword'>('login');

  // Navigation logic based on user description
  const handleRouteChange = (nextRoute: string) => {
    if (nextRoute === 'login') setRoute('login');
    else if (nextRoute === 'signup') setRoute('signup');
    else if (nextRoute === 'highlights') setRoute('highlights');
    else if (nextRoute === 'forgot') setRoute('forgot');
    else if (nextRoute === 'changepassword') setRoute('changepassword');
  };

  return <Router route={route} onRouteChange={handleRouteChange} />;
}

export default App;