import React, { useState, useEffect } from 'react';
import { auth } from './firebase';
import { onAuthStateChanged } from "firebase/auth";
import Login from './Login';
import Register from './Register';
import Profile from './Profile';

function App() {
  const [user, setUser] = useState(null);
  const [tela, setTela] = useState('login'); // login, registro, perfil
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Observador que verifica se o utilizador está logado ou não
    const unsubscribe = onAuthStateChanged(auth, (usuarioFirebase) => {
      if (usuarioFirebase) {
        setUser(usuarioFirebase);
        setTela('perfil');
      } else {
        setUser(null);
        if (tela === 'perfil') setTela('login');
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [tela]);

  if (loading) return <div style={{ textAlign: 'center', marginTop: '50px' }}>A carregar aplicação...</div>;

  return (
    <div>
      {tela === 'login' && (
        <Login 
          aoLogar={() => setTela('perfil')} 
          irParaRegisto={() => setTela('registro')} 
        />
      )}

      {tela === 'registro' && (
        <Register voltar={() => setTela('login')} />
      )}

      {tela === 'perfil' && (
        <Profile voltar={() => setTela('login')} />
      )}
    </div>
  );
}

export default App;