import React, { useState } from 'react';
import { db } from './firebase';
import { doc, getDoc } from "firebase/firestore";
import Cliente from './Cliente';
import Comerciante from './Comerciante';
import AdminPortal from './AdminPortal';

function App() {
  const [view, setView] = useState('home'); // home, cliente, loja, admin
  const [userLogado, setUserLogado] = useState(null);

  // Login para Comerciante (NIF e Senha)
  const loginComerciante = async (nif, pass) => {
    try {
      const docSnap = await getDoc(doc(db, "comerciantes", nif));
      if (docSnap.exists() && String(docSnap.data().password) === String(pass)) {
        setUserLogado({ nif, ...docSnap.data() });
        setView('dashboard_loja');
      } else { alert("NIF ou Senha incorretos."); }
    } catch (e) { alert("Erro ao aceder ao servidor."); }
  };

  if (view === 'home') {
    return (
      <div style={containerStyle}>
        <h1 style={{color: '#2c3e50'}}>VizinhoMais</h1>
        <p>Comunidade de Fidelização Local</p>
        <button onClick={() => setView('cliente')} style={btnStyle}>SOU CLIENTE (App)</button>
        <button onClick={() => setView('login_loja')} style={btnStyle}>SOU COMERCIANTE</button>
        <button onClick={() => setView('admin')} style={{...btnStyle, background:'#34495e'}}>GESTÃO APP (Admin)</button>
      </div>
    );
  }

  if (view === 'login_loja') {
    return (
      <div style={containerStyle}>
        <button onClick={() => setView('home')}>← Voltar</button>
        <h3>Login Comerciante</h3>
        <input id="nif" placeholder="NIF da Loja" style={inputStyle} />
        <input id="pass" type="password" placeholder="Password" style={inputStyle} />
        <button onClick={() => loginComerciante(document.getElementById('nif').value, document.getElementById('pass').value)} style={btnStyle}>ENTRAR</button>
      </div>
    );
  }

  if (view === 'cliente') return <Cliente voltar={() => setView('home')} />;
  if (view === 'dashboard_loja') return <Comerciante loja={userLogado} sair={() => setView('home')} />;
  if (view === 'admin') return <AdminPortal voltar={() => setView('home')} />;

  return null;
}

const containerStyle = { padding: '50px 20px', textAlign: 'center', fontFamily: 'sans-serif', maxWidth: '400px', margin: 'auto' };
const btnStyle = { display: 'block', width: '100%', margin: '15px 0', padding: '15px', background: '#3498db', color: 'white', border: 'none', borderRadius: '8px', fontSize: '16px', cursor: 'pointer' };
const inputStyle = { display: 'block', width: '100%', padding: '12px', marginBottom: '10px', boxSizing: 'border-box', borderRadius: '5px', border: '1px solid #ccc' };

export default App;