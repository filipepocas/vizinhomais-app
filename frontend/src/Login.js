import React, { useState } from 'react';
import { auth } from './firebase';
import { signInWithEmailAndPassword, sendPasswordResetEmail } from "firebase/auth";

function Login({ aoLogar, irParaRegisto }) {
  const [telefone, setTelefone] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      // Convertemos o telemóvel no email fictício para o Firebase validar
      const emailFicticio = `${telefone}@vizinhomais.com`;
      
      await signInWithEmailAndPassword(auth, emailFicticio, password);
      setMessage('Entrada autorizada!');
      aoLogar(); 
    } catch (error) {
      if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
        setMessage('Telemóvel ou password incorretos.');
      } else {
        setMessage('Erro ao entrar: ' + error.message);
      }
    }
  };

  const recuperarSenha = async () => {
    if (!telefone) {
      setMessage('Introduza o seu telemóvel para recuperar a senha.');
      return;
    }
    try {
      const emailFicticio = `${telefone}@vizinhomais.com`;
      await sendPasswordResetEmail(auth, emailFicticio);
      setMessage('Pedido de recuperação enviado! Se o telemóvel estiver associado a um email real, verifique a caixa de entrada.');
    } catch (error) {
      setMessage('Erro na recuperação: Verifique se o número está correto.');
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
      <h2 style={{ color: '#2c3e50' }}>Login Cartão Cliente</h2>
      <p style={{ fontSize: '14px', color: '#7f8c8d', marginBottom: '20px' }}>Entre com o seu número de telemóvel</p>
      
      <form onSubmit={handleLogin}>
        <input 
          type="tel" 
          placeholder="Nº de Telemóvel" 
          value={telefone} 
          onChange={(e) => setTelefone(e.target.value)} 
          style={inputStyle} 
          required 
        />
        
        <input 
          type="password" 
          placeholder="Password" 
          value={password} 
          onChange={(e) => setPassword(e.target.value)} 
          style={inputStyle} 
          required 
        />
        
        <button type="submit" style={btnStyle}>Entrar</button>
      </form>

      <button 
        onClick={recuperarSenha} 
        style={{ marginTop: '15px', background: 'none', border: 'none', color: '#7f8c8d', cursor: 'pointer', fontSize: '13px', textDecoration: 'underline' }}
      >
        Esqueci-me da password
      </button>

      <hr style={{ margin: '20px 0', border: '0', borderTop: '1px solid #eee' }} />

      <button 
        onClick={irParaRegisto} 
        style={{ background: '#2ecc71', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}
      >
        Ainda não tenho Cartão
      </button>

      {message && <p style={{ marginTop: '20px', color: message.includes('autorizada') ? 'green' : 'red', fontWeight: 'bold' }}>{message}</p>}
    </div>
  );
}

export default Login;