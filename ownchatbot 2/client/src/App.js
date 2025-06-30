import React, { useState, useEffect } from 'react';
import { auth } from './firebase'; // You need to create firebase.js
import { onAuthStateChanged } from 'firebase/auth';

import Login from './components/Login'; // The new login component
import Chat from './components/Chat';   // Your existing chat component
import './App.css'; // Main app styles

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // This listener handles user state changes (login/logout)
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  // While checking auth state, show a loading screen
  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }

  // If a user is logged in, pass their info to the Chat component.
  // Otherwise, show the Login page.
  return (
    <div className="App">
      {user ? <Chat user={user} /> : <Login />}
    </div>
  );
}

export default App;
