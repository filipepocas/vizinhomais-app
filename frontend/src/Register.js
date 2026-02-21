import React, { useState } from 'react';
import { auth, db } from './firebase';
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";

function Register({ voltar }) {
  const [nome, setNome] = useState('');
  const [nif, setNif] = useState('');
  const [password, setPassword] = useState('');
  const [telefone, setTelefone] = useState('');
  const [message, setMessage] = useState('');

  const handleRegister = async (e) => {
    e.preventDefault();
    
    if (nif.length !== 9) {
      setMessage('O NIF deve ter 9 dígitos.');
      return;
    }

    try {
      // Criamos um email fictício baseado no telefone para o Firebase Auth
      const emailFicticio = `${telefone}@vizinhomais.com`;

      const userCredential = await createUserWithEmailAndPassword(auth, emailFicticio, password);
      const user = userCredential.user;

      // Guardamos no Firestore usando o NIF como ID principal
      await setDoc(doc(db, "clientes", nif), {
        uid: user.uid,
        nome: nome,
        nif: nif,
        telefone: telefone,
        emailInterno: emailFicticio,
        pontos: 0,
        dataRegisto: new Date().toISOString()
      });

      setMessage('Cartão criado com sucesso!');
      setTimeout(() => voltar(), 2000);

    } catch (error) {
      if (error.code === 'auth/email-already-in-use') {
        setMessage('Este número de telefone já está registado.');
      } else {
        setMessage('Erro: ' + error.message);
      }
    }
  };

  const containerStyle = { padding: '20px', textAlign: 'center', fontFamily: 'sans-serif', maxWidth: '400px', margin: 'auto', border: '1px solid #eee', borderRadius: '10px', marginTop: '30px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' };
  const inputStyle = { padding: '12px', borderRadius: '5px', border: '1px solid #ddd', fontSize: '16px', marginBottom: '10px', width: '100%', boxSizing: 'border-box' };
  const btnStyle = { padding: '15px', background: '#2ecc71', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold', width: '100%' };

  return (
    <div style={containerStyle}>
      <button onClick={voltar} style={{ float: 'left', background: 'none', border: 'none', cursor: 'pointer' }}>← Voltar</button>
      <br /><br />
      <h2>Novo Cartão Cliente</h2>
      <form onSubmit={handleRegister}>
        <input type="text" placeholder="Nome Completo" onChange={(e) => setNome(e.target.value)} style={inputStyle} required />
        <input type="text" placeholder="NIF (Identificador único)" onChange={(e) => setNif(e.target.value)} style={inputStyle} required />
        <input type="tel" placeholder="Número de Telemóvel" onChange={(e) => setTelefone(e.target.value)} style={inputStyle} required />
        <input type="password" placeholder="Defina uma Password" onChange={(e) => setPassword(e.target.value)} style={inputStyle} required />
        <button type="submit" style={btnStyle}>Criar Cartão</button>
      </form>
      {message && <p style={{ color: 'red', fontWeight: 'bold' }}>{message}</p>}
    </div>
  );
}

export default Register;