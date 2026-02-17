import React, { useState, useEffect } from 'react';
import { db } from './firebase';
import { doc, setDoc, increment, collection, addDoc, serverTimestamp, getDoc, query, where, orderBy, getDocs, limit } from "firebase/firestore";
import Cliente from './Cliente';
import Gestor from './Gestor';
import Relatorio from './Relatorio';

function App() {
  const [view, setView] = useState('comerciante');
  const [clientId, setClientId] = useState('');
  const [valorFatura, setValorFatura] = useState('');
  const [numFatura, setNumFatura] = useState('');
  const [pin, setPin] = useState('');
  const [carregando, setCarregando] = useState(false);
  const [lojaData, setLojaData] = useState(null);
  const [historico, setHistorico] = useState([]);

  const [loginNif, setLoginNif] = useState('');
  const [loginPass, setLoginPass] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [nifLogado, setNifLogado] = useState(null);

  useEffect(() => {
    if (!isLoggedIn || !nifLogado) return;
    const buscarHistorico = async () => {
      try {
        const q = query(
          collection(db, "historico"),
          where("lojaId", "==", nifLogado),
          orderBy("data", "desc"),
          limit(5)
        );
        const snap = await getDocs(q);
        const lista = [];
        snap.forEach((doc) => lista.push(doc.data()));
        setHistorico(lista);
      } catch (e) { console.error("Erro no historico:", e); }
    };
    buscarHistorico();
  }, [isLoggedIn, nifLogado]);

  const autenticarComerciante = async () => {
    if (!loginNif || !loginPass) { alert("Preencha os dados!"); return; }
    setCarregando(true);
    try {
      const docRef = doc(db, "comerciantes", loginNif);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const dados = docSnap.data();
        if (String(dados.password) === String(loginPass)) {
          setLojaData(dados);
          setNifLogado(loginNif);
          setIsLoggedIn(true);
        } else { alert("Password incorreta!"); }
      } else { alert("NIF não encontrado!"); }
    } catch (e) { alert("Erro: " + e.message); }
    finally { setCarregando(false); }
  };

  const fazerLogout = () => {
    setIsLoggedIn(false);
    setLojaData(null);
    setNifLogado(null);
    setView('comerciante');
  };

  if (!isLoggedIn) {
    return (
      <div style={{padding: '20px'}}>
        <h2>Login Comerciante</h2>
        <input type="text" placeholder="NIF" value={loginNif} onChange={(e) => setLoginNif(e.target.value)} /><br/>
        <input type="password" placeholder="Password" value={loginPass} onChange={(e) => setLoginPass(e.target.value)} /><br/>
        <button onClick={autenticarComerciante} disabled={carregando}>ENTRAR</button>
      </div>
    );
  }

  return (
    <div style={{padding: '10px', fontFamily: 'sans-serif'}}>
      <nav style={{marginBottom: '20px', borderBottom: '1px solid #ccc', paddingBottom: '10px'}}>
        <button onClick={() => setView('comerciante')}>LOJA</button>
        <button onClick={() => setView('cliente')}>CLIENTE</button>
        <button onClick={() => setView('relatorio')}>RELATÓRIOS</button>
        <button onClick={() => setView('gestor')}>ADMIN</button>
        <button onClick={fazerLogout} style={{color: 'red', marginLeft: '10px'}}>SAIR</button>
      </nav>
      
      <div>
        {view === 'comerciante' ? (
          <div>
            <h2>Terminal: {lojaData?.nome}</h2>
            <input type="password" placeholder="PIN" value={pin} onChange={(e) => setPin(e.target.value)} /><br/>
            <input type="text" placeholder="Telemóvel" value={clientId} onChange={(e) => setClientId(e.target.value)} /><br/>
            <input type="text" placeholder="Fatura" value={numFatura} onChange={(e) => setNumFatura(e.target.value)} /><br/>
            <input type="number" placeholder="Valor (€)" value={valorFatura} onChange={(e) => setValorFatura(e.target.value)} /><br/>
            <button onClick={() => alert("Função Emitir")}>EMITIR</button>
            
            <h3>Últimos 5 Movimentos</h3>
            {historico.map((h, i) => (
              <p key={i}>{h.tipo === 'emissao' ? '➕' : '➖'} {h.valorCashback.toFixed(2)}€ (Fat: {h.fatura})</p>
            ))}
          </div>
        ) : view === 'cliente' ? <Cliente /> 
          : view === 'relatorio' ? <Relatorio /> 
          : <Gestor />}
      </div>
    </div>
  );
}
export default App;