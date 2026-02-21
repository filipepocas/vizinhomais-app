import React, { useState } from 'react';
import { auth, db } from './firebase';
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";

function Register({ voltar }) {
  const [nome, setNome] = useState('');
  const [telefone, setTelefone] = useState('');
  const [codigoPostal, setCodigoPostal] = useState('');
  const [nif, setNif] = useState(''); // Facultativo
  const [email, setEmail] = useState(''); // Facultativo
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');

  // Função para gerar número de cartão de 10 dígitos aleatórios
  const gerarNumeroCartao = () => {
    return Math.floor(1000000000 + Math.random() * 9000000000).toString();
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setMessage('A criar conta...');

    try {
      // O telemóvel é o identificador para o email fictício de login
      const emailLogin = email || `${telefone}@vizinhomais.com`;
      const numCartao = gerarNumeroCartao();

      // Criar utilizador no Auth
      const userCredential = await createUserWithEmailAndPassword(auth, emailLogin, password);
      const user = userCredential.user;

      // Guardar no Firestore (Usamos o UID como ID do documento para ser único)
      await setDoc(doc(db, "utilizadores", user.uid), {
        uid: user.uid,
        tipo: 'cliente',
        nome: nome,
        telefone: telefone,
        codigoPostal: codigoPostal,
        nif: nif || null,
        email: email || null,
        numeroCartao: numCartao,
        dataCriacao: new Date().toISOString()
      });

      // Criar uma referência rápida para busca de duplicados (opcional mas recomendado)
      await setDoc(doc(db, "registos_unicos", telefone), { uid: user.uid });
      if (nif) await setDoc(doc(db, "registos_unicos", nif), { uid: user.uid });

      setMessage(`Conta criada! Número do Cartão: ${numCartao}`);
      setTimeout(() => voltar(), 3000);

    } catch (error) {
      if (error.code === 'auth/email-already-in-use') {
        setMessage('Este telemóvel ou email já está em uso.');
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
      <h2>Registo de Cliente</h2>
      <p style={{fontSize: '13px', color: '#666'}}>O seu cartão de cash back autónomo</p>
      
      <form onSubmit={handleRegister}>
        <input type="text" placeholder="Nome Completo *" onChange={(e) => setNome(e.target.value)} style={inputStyle} required />
        <input type="tel" placeholder="Telemóvel (Obrigatório) *" onChange={(e) => setTelefone(e.target.value)} style={inputStyle} required />
        <input type="text" placeholder="Código Postal *" onChange={(e) => setCodigoPostal(e.target.value)} style={inputStyle} required />
        <input type="text" placeholder="NIF (Facultativo)" onChange={(e) => setNif(e.target.value)} style={inputStyle} />
        <input type="email" placeholder="Email (Facultativo)" onChange={(e) => setEmail(e.target.value)} style={inputStyle} />
        <input type="password" placeholder="Defina a sua Password *" onChange={(e) => setPassword(e.target.value)} style={inputStyle} required />
        
        <button type="submit" style={btnStyle}>Criar Conta e Gerar Cartão</button>
      </form>
      
      {message && <p style={{ color: message.includes('sucesso') || message.includes('criada') ? 'green' : 'red', fontWeight: 'bold', marginTop: '15px' }}>{message}</p>}
    </div>
  );
}

export default Register;