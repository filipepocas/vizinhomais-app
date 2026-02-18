import React, { useState, useEffect } from 'react';
import { db } from './firebase';
import { doc, setDoc, increment, collection, addDoc, serverTimestamp, getDoc, query, where, orderBy, getDocs, limit } from "firebase/firestore";
import Cliente from './Cliente';
import Gestor from './Gestor';
import Relatorio from './Relatorio';

function App() {
  const [view, setView] = useState('comerciante');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [nifLogado, setNifLogado] = useState(null);
  const [lojaData, setLojaData] = useState(null);
  const [carregando, setCarregando] = useState(false);

  // Estados do Terminal
  const [clientId, setClientId] = useState('');
  const [valorFatura, setValorFatura] = useState('');
  const [numFatura, setNumFatura] = useState('');
  const [pinComerciante, setPinComerciante] = useState('');
  const [pinCliente, setPinCliente] = useState(''); 
  const [historico, setHistorico] = useState([]);

  useEffect(() => {
    if (isLoggedIn && nifLogado) buscarHistorico();
  }, [isLoggedIn, nifLogado]);

  const buscarHistorico = async () => {
    const q = query(collection(db, "historico"), where("lojaId", "==", nifLogado), orderBy("data", "desc"), limit(5));
    const snap = await getDocs(q);
    setHistorico(snap.docs.map(d => d.data()));
  };

  const login = async (nif, pass) => {
    setCarregando(true);
    try {
      const docSnap = await getDoc(doc(db, "comerciantes", nif));
      if (docSnap.exists() && String(docSnap.data().password) === String(pass)) {
        setLojaData(docSnap.data());
        setNifLogado(nif);
        setIsLoggedIn(true);
      } else { alert("Acesso Negado."); }
    } finally { setCarregando(false); }
  };

  const executarOperacao = async (tipo) => {
    if (pinComerciante !== "1234") { alert("PIN Comerciante Inválido"); return; }
    if (!clientId || !valorFatura) { alert("Dados incompletos"); return; }
    
    setCarregando(true);
    try {
      const v = Number(valorFatura);
      const perc = lojaData.percentagem || 0;
      const valorMov = tipo === 'emissao' ? (v * perc) : -v;
      
      // 🛡️ VALIDAÇÃO DE PIN REAL DO CLIENTE
      if (tipo === 'desconto') {
        if (!pinCliente) { alert("PIN do Cliente é obrigatório!"); setCarregando(false); return; }
        
        const clientSnap = await getDoc(doc(db, "clientes", clientId));
        if (!clientSnap.exists()) {
          alert("Cliente não encontrado!"); setCarregando(false); return;
        }
        
        const pinNoSistema = clientSnap.data().pin;
        if (String(pinCliente) !== String(pinNoSistema)) {
          alert("PIN do Cliente Incorreto!"); setCarregando(false); return;
        }

        // Verificar saldo disponível na sub-coleção
        const saldoRef = doc(db, "clientes", clientId, "saldos_por_loja", nifLogado);
        const s = await getDoc(saldoRef);
        if ((s.data()?.saldoDisponivel || 0) < v) throw new Error("Saldo Insuficiente nesta loja");
      }

      // Executar a transação
      const saldoRef = doc(db, "clientes", clientId, "saldos_por_loja", nifLogado);
      await setDoc(saldoRef, { 
        saldoDisponivel: increment(valorMov), 
        nomeLoja: lojaData.nome,
        ultimoMovimento: serverTimestamp() 
      }, { merge: true });

      await addDoc(collection(db, "historico"), {
        clienteId: clientId, lojaId: nifLogado, nomeLoja: lojaData.nome,
        valorVenda: tipo === 'desconto' ? 0 : v,
        valorCashback: valorMov, tipo, fatura: numFatura, data: serverTimestamp()
      });

      alert("Sucesso!");
      setClientId(''); setValorFatura(''); setNumFatura(''); setPinCliente('');
      buscarHistorico();
    } catch (e) { alert(e.message); }
    finally { setCarregando(false); }
  };

  if (!isLoggedIn) {
    return (
      <div style={{padding: '50px', textAlign: 'center', fontFamily: 'sans-serif'}}>
        <h1>VizinhoMais</h1>
        <input id="n" type="text" placeholder="NIF" style={{display: 'block', margin: '10px auto', padding: '10px'}} />
        <input id="p" type="password" placeholder="Password" style={{display: 'block', margin: '10px auto', padding: '10px'}} />
        <button onClick={() => login(document.getElementById('n').value, document.getElementById('p').value)}>ENTRAR</button>
      </div>
    );
  }

  return (
    <div style={{fontFamily: 'sans-serif', maxWidth: '800px', margin: 'auto'}}>
      <nav style={{display: 'flex', justifyContent: 'space-around', padding: '15px', background: '#2c3e50', color: 'white'}}>
        <span onClick={() => setView('comerciante')} style={{cursor: 'pointer'}}>TERMINAL</span>
        <span onClick={() => setView('cliente')} style={{cursor: 'pointer'}}>CLIENTE</span>
        <span onClick={() => setView('relatorio')} style={{cursor: 'pointer'}}>DASHBOARD</span>
        <span onClick={() => setView('gestor')} style={{cursor: 'pointer'}}>ADMIN</span>
        <span onClick={() => setIsLoggedIn(false)} style={{color: '#e74c3c', cursor: 'pointer'}}>SAIR</span>
      </nav>

      <div style={{padding: '20px'}}>
        {view === 'comerciante' ? (
          <div>
            <h2>{lojaData.nome}</h2>
            {carregando && <p>A processar...</p>}
            <div style={{background: '#f9f9f9', padding: '20px', borderRadius: '10px', boxShadow: '0 2px 5px rgba(0,0,0,0.1)'}}>
              <input type="password" placeholder="PIN Comerciante" value={pinComerciante} onChange={e => setPinComerciante(e.target.value)} style={{width: '95%', padding: '10px', marginBottom: '10px'}} />
              <input type="text" placeholder="Telemóvel Cliente" value={clientId} onChange={e => setClientId(e.target.value)} style={{width: '95%', padding: '10px', marginBottom: '10px'}} />
              <input type="number" placeholder="Valor da Fatura (€)" value={valorFatura} onChange={e => setValorFatura(e.target.value)} style={{width: '95%', padding: '10px', marginBottom: '10px'}} />
              
              <div style={{padding: '10px', background: '#fff3cd', borderRadius: '5px', marginBottom: '10px'}}>
                <label style={{fontSize: '12px', fontWeight: 'bold'}}>APENAS PARA DESCONTO:</label>
                <input type="password" placeholder="PIN Secreto do Cliente" value={pinCliente} onChange={e => setPinCliente(e.target.value)} style={{width: '100%', padding: '10px', marginTop: '5px', border: '1px solid #ffeeba'}} />
              </div>
              
              <div style={{display: 'flex', gap: '10px'}}>
                <button onClick={() => executarOperacao('emissao')} style={{flex: 1, padding: '15px', background: '#27ae60', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer'}}>EMITIR CASHBACK</button>
                <button onClick={() => executarOperacao('desconto')} style={{flex: 1, padding: '15px', background: '#e67e22', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer'}}>DESCONTAR SALDO</button>
              </div>
            </div>
          </div>
        ) : view === 'cliente' ? <Cliente /> : view === 'relatorio' ? <Relatorio /> : <Gestor />}
      </div>
    </div>
  );
}

export default App;