import React, { useState } from 'react';
import { db } from './firebase';
import { doc, getDoc } from "firebase/firestore";
import Cliente from './Cliente';
import Comerciante from './Comerciante';
import AdminPortal from './AdminPortal';

function App() {
  const [view, setView] = useState('home'); 
  const [userLogado, setUserLogado] = useState(null);

  const loginComerciante = async (nif, pass) => {
    try {
      const docSnap = await getDoc(doc(db, "comerciantes", nif));
      if (docSnap.exists() && String(docSnap.data().password) === String(pass)) {
        setUserLogado({ nif, ...docSnap.data() });
        setView('dashboard_loja');
      } else { alert("Credenciais de Loja inválidas."); }
    } catch (e) { alert("Erro ao ligar ao servidor."); }
  };

  if (view === 'home') {
    return (
      <div style={styles.container}>
        <h1 style={{color: '#2c3e50', fontSize: '40px'}}>VizinhoMais</h1>
        <p style={{marginBottom: '30px'}}>Comunidade de Fidelização Local</p>
        <button onClick={() => setView('cliente')} style={styles.btn}>SOU CLIENTE (App)</button>
        <button onClick={() => setView('login_loja')} style={styles.btn}>SOU COMERCIANTE</button>
        <button onClick={() => setView('admin')} style={{...styles.btn, background:'#34495e'}}>ADMINISTRAÇÃO</button>
      </div>
    );
  }

  if (view === 'login_loja') {
    return (
      <div style={styles.container}>
        <button onClick={() => setView('home')} style={styles.backBtn}>← Voltar</button>
        <h3>Login Comerciante</h3>
        <input id="nif" placeholder="NIF da Loja" style={styles.input} />
        <input id="pass" type="password" placeholder="Senha" style={styles.input} />
        <button onClick={() => loginComerciante(document.getElementById('nif').value, document.getElementById('pass').value)} style={styles.btn}>ENTRAR</button>
      </div>
    );
  }

  if (view === 'cliente') return <Cliente voltar={() => setView('home')} />;
  if (view === 'dashboard_loja') return <Comerciante loja={userLogado} sair={() => setView('home')} />;
  if (view === 'admin') return <AdminPortal voltar={() => setView('home')} />;

  return null;
}

const styles = {
  container: { padding: '60px 20px', textAlign: 'center', fontFamily: 'sans-serif', maxWidth: '400px', margin: 'auto' },
  btn: { display: 'block', width: '100%', margin: '15px 0', padding: '15px', background: '#3498db', color: 'white', border: 'none', borderRadius: '10px', fontSize: '16px', cursor: 'pointer', fontWeight: 'bold' },
  input: { display: 'block', width: '100%', padding: '12px', marginBottom: '10px', boxSizing: 'border-box', borderRadius: '8px', border: '1px solid #ccc' },
  backBtn: { background: 'none', border: 'none', color: '#7f8c8d', cursor: 'pointer', marginBottom: '10px' }
};

export default App;