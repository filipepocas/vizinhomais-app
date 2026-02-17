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

  const movimentarCashback = async (tipo) => {
    if (pin !== "1234") { alert("PIN incorreto!"); return; }
    if (!clientId || !valorFatura || !lojaData) { alert("Dados incompletos!"); return; }
    
    const valorBase = Number(valorFatura);
    if (isNaN(valorBase) || valorBase <= 0) { alert("Valor inválido!"); return; }

    setCarregando(true);
    try {
      const perc = lojaData.percentagem || 0;
      let valorMovimentado = 0;
      
      if (tipo === 'desconto') {
        const saldoRef = doc(db, "clientes", clientId, "saldos_por_loja", nifLogado);
        const saldoSnap = await getDoc(saldoRef);
        const saldoAtual = saldoSnap.exists() ? saldoSnap.data().saldoDisponivel : 0;
        
        if (saldoAtual < valorBase) {
          alert("Saldo insuficiente! O cliente só tem " + saldoAtual.toFixed(2) + "€");
          setCarregando(false);
          return;
        }
        valorMovimentado = -valorBase;
      } else {
        valorMovimentado = tipo === 'emissao' ? (valorBase * perc) : -(valorBase * perc);
      }

      const saldoRef = doc(db, "clientes", clientId, "saldos_por_loja", nifLogado);
      await setDoc(saldoRef, { 
        saldoDisponivel: increment(valorMovimentado), 
        nomeLoja: lojaData.nome 
      }, { merge: true });

      await addDoc(collection(db, "historico"), {
        clienteId: clientId, lojaId: nifLogado, nomeLoja: lojaData.nome, fatura: numFatura,
        valorVenda: tipo === 'desconto' ? 0 : valorBase, 
        valorCashback: valorMovimentado, data: serverTimestamp(), tipo: tipo
      });

      alert("Operação de " + tipo + " concluída!");
      setClientId(''); setValorFatura(''); setNumFatura('');
      
      const q = query(collection(db, "historico"), where("lojaId", "==", nifLogado), orderBy("data", "desc"), limit(5));
      const snap = await getDocs(q);
      const lista = [];
      snap.forEach((doc) => lista.push(doc.data()));
      setHistorico(lista);

    } catch (e) { alert("Erro: " + e.message); }
    finally { setCarregando(false); }
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
            
            <button onClick={() => movimentarCashback('emissao')} disabled={carregando}>EMITIR</button>
            <button onClick={() => movimentarCashback('desconto')} disabled={carregando} style={{background: 'orange'}}>DESCONTAR</button>
            <button onClick={() => movimentarCashback('devolucao')} disabled={carregando}>DEVOLUÇÃO</button>
            
            <h3>Últimos 5 Movimentos</h3>
            {historico.map((h, i) => (
              <p key={i}>{h.tipo === 'emissao' ? '➕' : h.tipo === 'desconto' ? '➖' : '🔄'} {h.valorCashback?.toFixed(2)}€ (Fat: {h.fatura})</p>
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