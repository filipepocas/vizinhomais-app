import React, { useState } from 'react';
import { auth } from './firebase';
import { signInWithEmailAndPassword, sendPasswordResetEmail } from "firebase/auth";

function Login({ aoLogar, irParaRegisto }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      setMessage('Login efetuado com sucesso!');
      aoLogar(); // Função que muda o ecrã para o Perfil
    } catch (error) {
      if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
        setMessage('Email ou password incorretos.');
      } else if (error.code === 'auth/invalid-credential') {
        setMessage('Credenciais inválidas. Verifique os seus dados.');
      } else {
        setMessage('Erro: ' + error.message);
      }
    }
  };

  const recuperarSenha = async () => {
    if (!email) {
      setMessage('Por favor, introduza o seu email primeiro.');
      return;
    }
    try {
      await sendPasswordResetEmail(auth, email);
      setMessage('Email de recuperação enviado! Verifique a sua caixa de entrada.');
    } catch (error) {
      setMessage('Erro ao enviar recuperação: ' + error.message);
    }
  };

  const containerStyle = {
    padding: '20px',
    textAlign: 'center',
    fontFamily: 'sans-serif',
    maxWidth: '400px',
    margin: 'auto',
    border: '1px solid #eee',
    borderRadius: '10px',
    marginTop: '50px',
    boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
  };

  const inputStyle = { 
    padding: '12px', 
    borderRadius: '5px', 
    border: '1px solid #ddd', 
    fontSize: '16px',
    marginBottom: '15px',
    width: '100%',
    boxSizing: 'border-box'
  };

  const btnStyle = { 
    padding: '15px', 
    background: '#3498db', 
    color: 'white', 
    border: 'none', 
    borderRadius: '5px', 
    cursor: 'pointer', 
    fontWeight: 'bold', 
    fontSize: '16px',
    width: '100%'
  };

  return (
    <div style={containerStyle}>
      <h2 style={{ color: '#2c3e50' }}>Entrar no Cartão Cliente</h2>
      
      <form onSubmit={handleLogin}>
        <input 
          type="email" 
          placeholder="O seu Email" 
          value={email} 
          onChange={(e) => setEmail(e.target.value)} 
          style={inputStyle} 
          required 
        />
        
        <input 
          type="password" 
          placeholder="A sua Password" 
          value={password} 
          onChange={(e) => setPassword(e.target.value)} 
          style={inputStyle} 
          required 
        />
        
        <button type="submit" style={btnStyle}>Entrar</button>
      </form>

      <button 
        onClick={recuperarSenha} 
        style={{ marginTop: '15px', background: 'none', border: 'none', color: '#7f8c8d', cursor: 'pointer', fontSize: '14px', textDecoration: 'underline' }}
      >
        Esqueci-me da password
      </button>

      <hr style={{ margin: '20px 0', border: '0', borderTop: '1px solid #eee' }} />

      <p style={{ fontSize: '14px' }}>Ainda não tem cartão?</p>
      <button 
        onClick={irParaRegisto} 
        style={{ background: '#2ecc71', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}
      >
        Criar Novo Cartão
      </button>

      {message && <p style={{ marginTop: '20px', color: message.includes('sucesso') ? 'green' : 'red', fontWeight: 'bold' }}>{message}</p>}
    </div>
  );
}

export default Login;