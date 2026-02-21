import React, { useState } from 'react';
import { auth, db } from './firebase';
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";

function Register({ voltar }) {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [nif, setNif] = useState('');
  const [password, setPassword] = useState('');
  const [telefone, setTelefone] = useState('');
  const [message, setMessage] = useState('');

  const handleRegister = async (e) => {
    e.preventDefault();
    
    // Validação básica de NIF (9 dígitos)
    if (nif.length !== 9) {
      setMessage('O NIF deve ter exatamente 9 dígitos.');
      return;
    }

    try {
      // 1. Criar o utilizador no Firebase Auth (Email e Pass)
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // 2. Criar o documento no Firestore usando o NIF como ID
      // Assim, o NIF nunca muda e é a base de tudo
      await setDoc(doc(db, "clientes", nif), {
        uid: user.uid,
        nome: nome,
        email: email,
        nif: nif,
        telefone: telefone,
        pontos: 0,
        dataRegisto: new Date().toISOString()
      });

      setMessage('Conta criada com sucesso! NIF: ' + nif);
      
      // Espera 2 segundos e volta ao início
      setTimeout(() => voltar(), 2000);

    } catch (error) {
      // Tradução simples de erros comuns
      if (error.code === 'auth/email-already-in-use') {
        setMessage('Este email já está registado.');
      } else if (error.code === 'auth/weak-password') {
        setMessage('A password deve ter pelo menos 6 caracteres.');
      } else {
        setMessage('Erro: ' + error.message);
      }
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
    marginTop: '30px',
    boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
  };

  const inputStyle = { 
    padding: '12px', 
    borderRadius: '5px', 
    border: '1px solid #ddd', 
    fontSize: '16px',
    marginBottom: '10px',
    width: '100%',
    boxSizing: 'border-box'
  };

  const btnStyle = { 
    padding: '15px', 
    background: '#2ecc71', 
    color: 'white', 
    border: 'none', 
    borderRadius: '5px', 
    cursor: 'pointer', 
    fontWeight: 'bold', 
    width: '100%',
    fontSize: '16px'
  };

  return (
    <div style={containerStyle}>
      <button onClick={voltar} style={{ float: 'left', background: 'none', border: 'none', cursor: 'pointer', color: '#7f8c8d' }}>← Voltar</button>
      <br /><br />
      <h2 style={{ color: '#2c3e50' }}>Registo de Cartão Cliente</h2>
      <p style={{ fontSize: '14px', color: '#7f8c8d', marginBottom: '20px' }}>O NIF será o seu identificador permanente.</p>
      
      <form onSubmit={handleRegister}>
        <input type="text" placeholder="Nome Completo" value={nome} onChange={(e) => setNome(e.target.value)} style={inputStyle} required />
        
        <input type="text" placeholder="NIF (Identificador único)" value={nif} onChange={(e) => setNif(e.target.value)} style={inputStyle} required />
        
        <input type="email" placeholder="Email para login" value={email} onChange={(e) => setEmail(e.target.value)} style={inputStyle} required />
        
        <input type="tel" placeholder="Telemóvel" value={telefone} onChange={(e) => setTelefone(e.target.value)} style={inputStyle} required />
        
        <input type="password" placeholder="Defina uma Password" value={password} onChange={(e) => setPassword(e.target.value)} style={inputStyle} required />
        
        <button type="submit" style={btnStyle}>Criar Cartão Digital</button>
      </form>
      
      {message && <p style={{ marginTop: '20px', color: message.includes('sucesso') ? 'green' : 'red', fontWeight: 'bold' }}>{message}</p>}
    </div>
  );
}

export default Register;