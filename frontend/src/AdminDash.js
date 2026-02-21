import React, { useState } from 'react';
import { auth, db } from './firebase';
import { createUserWithEmailAndPassword, signOut } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";

function AdminDash() {
  const [nomeLoja, setNomeLoja] = useState('');
  const [morada, setMorada] = useState('');
  const [nif, setNif] = useState('');
  const [cp, setCp] = useState('');
  const [contacto, setContacto] = useState('');
  const [email, setEmail] = useState('');
  const [passProvisoria, setPassProvisoria] = useState('');
  const [message, setMessage] = useState('');

  const registarComerciante = async (e) => {
    e.preventDefault();
    setMessage('A registar comerciante...');

    try {
      // O email é obrigatório para o Firebase Auth (mesmo que seja fictício)
      const emailLogin = email || `${contacto}@comerciante.com`;
      
      // Criar o utilizador no Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, emailLogin, passProvisoria);
      const user = userCredential.user;

      // Guardar os dados no Firestore conforme o Check-list
      await setDoc(doc(db, "utilizadores", user.uid), {
        uid: user.uid,
        tipo: 'comerciante',
        nomeLoja: nomeLoja,
        morada: morada,
        nif: nif,
        codigoPostal: cp,
        contacto: contacto,
        email: email || null,
        passwordProvisoria: true, // Para forçar a troca no primeiro login
        dataAdesao: new Date().toISOString()
      });

      setMessage('Comerciante registado com sucesso!');
      // Limpar campos
      setNomeLoja(''); setMorada(''); setNif(''); setCp(''); setContacto(''); setEmail(''); setPassProvisoria('');

    } catch (error) {
      setMessage('Erro: ' + error.message);
    }
  };

  const containerStyle = { padding: '20px', fontFamily: 'sans-serif', maxWidth: '600px', margin: 'auto' };
  const inputStyle = { padding: '10px', marginBottom: '10px', width: '100%', borderRadius: '5px', border: '1px solid #ddd' };

  return (
    <div style={containerStyle}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>Painel Administrador</h2>
        <button onClick={() => signOut(auth)} style={{ background: '#e74c3c', color: 'white', border: 'none', padding: '10px', borderRadius: '5px', cursor: 'pointer' }}>Sair</button>
      </div>

      <div style={{ background: '#f9f9f9', padding: '20px', borderRadius: '10px', border: '1px solid #eee' }}>
        <h3>Registar Novo Comerciante</h3>
        <form onSubmit={registarComerciante}>
          <input type="text" placeholder="Nome do Estabelecimento" value={nomeLoja} onChange={(e) => setNomeLoja(e.target.value)} style={inputStyle} required />
          <input type="text" placeholder="Morada Completa" value={morada} onChange={(e) => setMorada(e.target.value)} style={inputStyle} required />
          <input type="text" placeholder="NIF" value={nif} onChange={(e) => setNif(e.target.value)} style={inputStyle} required />
          <input type="text" placeholder="Código Postal" value={cp} onChange={(e) => setCp(e.target.value)} style={inputStyle} required />
          <input type="tel" placeholder="Contacto Telefónico" value={contacto} onChange={(e) => setContacto(e.target.value)} style={inputStyle} required />
          <input type="email" placeholder="Email (Facultativo)" value={email} onChange={(e) => setEmail(e.target.value)} style={inputStyle} />
          <input type="text" placeholder="Definir Password Provisória" value={passProvisoria} onChange={(e) => setPassProvisoria(e.target.value)} style={inputStyle} required />
          
          <button type="submit" style={{ width: '100%', padding: '15px', background: '#3498db', color: 'white', border: 'none', borderRadius: '5px', fontWeight: 'bold', cursor: 'pointer' }}>
            Registar Comerciante
          </button>
        </form>
        {message && <p style={{ color: message.includes('sucesso') ? 'green' : 'red', fontWeight: 'bold' }}>{message}</p>}
      </div>
    </div>
  );
}

export default AdminDash;