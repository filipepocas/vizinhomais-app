import React, { useState } from 'react';
import { db } from './firebase';
import { doc, getDoc, updateDoc } from "firebase/firestore";
import Cliente from './Cliente';
import Comerciante from './Comerciante';
import AdminPortal from './AdminPortal';
import Register from './Register'; // IMPORTANTE: Importamos o novo ficheiro

function App() {
  const [view, setView] = useState('home'); 
  const [userLogado, setUserLogado] = useState(null);

  const loginComerciante = async (loginID, pass) => {
    try {
      const docSnap = await getDoc(doc(db, "comerciantes", loginID));
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (String(data.pass) === String(pass)) {
          if (data.precisaTrocarSenha) {
            const nova = prompt("Segurança: Introduza uma nova password definitiva (mín. 4 caracteres):");
            if (nova && nova.length >= 4) {
              await updateDoc(doc(db, "comerciantes", loginID), { 
                pass: nova, 
                needsPasswordChange: false 
              });
              alert("Password definitiva guardada! Faça login novamente.");
              return;
            } else { alert("Operação cancelada ou senha muito curta."); return; }
          }
          setUserLogado({ id: loginID, ...data });
          setView('dashboard_loja');
        } else { alert("Senha incorreta."); }
      } else { alert("ID de Loja não encontrado."); }
    } catch (e) { alert("Erro ao ligar ao servidor."); }
  };

  const solicitarResetSMS = async () => {
    const idLoja = prompt("Introduza o seu ID de Loja para receber SMS:");
    if (!idLoja) return;
    try {
      const docSnap = await getDoc(doc(db, "comerciantes", idLoja));
      if (docSnap.exists()) {
        const telLoja = docSnap.data().tel;
        const senhaTemp = Math.floor(1000 + Math.random() * 9000);
        await updateDoc(doc(db, "comerciantes", idLoja), { pass: String(senhaTemp), precisaTrocarSenha: true });
        alert(`SMS enviado para o número ${telLoja}!\n(Simulação: A sua senha temporária é ${senhaTemp})`);
      } else { alert("ID de Loja não reconhecido."); }
    } catch (e) { alert("Erro ao processar reset."); }
  };

  // ECRÃ INICIAL
  if (view === 'home') {
    return (
      <div style={styles.container}>
        <h1 style={{color: '#2c3e50', fontSize: '40px', marginBottom: '10px'}}>VizinhoMais</h1>
        <p style={{marginBottom: '30px', color: '#7f8c8d'}}>Fidelização da Comunidade</p>
        <button onClick={() => setView('cliente')} style={styles.btn}>SOU CLIENTE</button>
        <button onClick={() => setView('login_loja')} style={styles.btn}>SOU COMERCIANTE</button>
        <button onClick={() => setView('admin')} style={{...styles.btn, background:'#34495e'}}>ADMINISTRAÇÃO</button>
      </div>
    );
  }

  // ECRÃ LOGIN LOJA
  if (view === 'login_loja') {
    return (
      <div style={styles.container}>
        <button onClick={() => setView('home')} style={styles.backBtn}>← Voltar</button>
        <h3>Área do Comerciante</h3>
        <input id="loginID" placeholder="ID da Loja" style={styles.input} />
        <input id="pass" type="password" placeholder="Senha" style={styles.input} />
        <button onClick={() => loginComerciante(document.getElementById('loginID').value, document.getElementById('pass').value)} style={styles.btn}>ENTRAR</button>
        <p onClick={solicitarResetSMS} style={styles.link}>Esqueci-me da senha (SMS)</p>
      </div>
    );
  }

  // ECRÃ LOGIN CLIENTE (Aqui adicionamos a opção de registo)
  if (view === 'cliente') {
    return (
        <div style={styles.container}>
            <button onClick={() => setView('home')} style={styles.backBtn}>← Voltar</button>
            <Cliente voltar={() => setView('home')} />
            <hr style={{marginTop: '30px', border: '0.5px solid #eee'}} />
            <p style={{fontSize: '14px'}}>Não tem conta?</p>
            <button onClick={() => setView('registo_cliente')} style={{...styles.btn, background: '#2ecc71'}}>CRIAR CONTA NOVA</button>
        </div>
    );
  }

  // NOVO ECRÃ DE REGISTO
  if (view === 'registo_cliente') return <Register voltar={() => setView('cliente')} />;

  if (view === 'dashboard_loja') return <Comerciante loja={userLogado} sair={() => setView('home')} />;
  if (view === 'admin') return <AdminPortal voltar={() => setView('home')} />;

  return null;
}

const styles = {
  container: { padding: '60px 20px', textAlign: 'center', fontFamily: 'sans-serif', maxWidth: '400px', margin: 'auto' },
  btn: { display: 'block', width: '100%', margin: '15px 0', padding: '15px', background: '#3498db', color: 'white', border: 'none', borderRadius: '10px', fontSize: '16px', cursor: 'pointer', fontWeight: 'bold' },
  input: { display: 'block', width: '100%', padding: '12px', marginBottom: '10px', boxSizing: 'border-box', borderRadius: '8px', border: '1px solid #ccc' },
  backBtn: { background: 'none', border: 'none', color: '#7f8c8d', cursor: 'pointer', marginBottom: '10px' },
  link: {fontSize: '13px', cursor: 'pointer', color: '#3498db', marginTop: '15px', textDecoration: 'underline'}
};

export default App;