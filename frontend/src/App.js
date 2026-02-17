import React, { useState, useEffect } from 'react';
import { db } from './firebase';
import { doc, setDoc, increment, collection, addDoc, serverTimestamp, getDoc, query, where, orderBy, getDocs, limit } from "firebase/firestore";
import Cliente from './Cliente';
import Gestor from './Gestor';
import Relatorio from './Relatorio';

function App() {
  // Estados de Navegação e App
  const [view, setView] = useState('comerciante');
  const [carregando, setCarregando] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [nifLogado, setNifLogado] = useState(null);
  const [lojaData, setLojaData] = useState(null);

  // Estados do Formulário Terminal
  const [clientId, setClientId] = useState('');
  const [valorFatura, setValorFatura] = useState('');
  const [numFatura, setNumFatura] = useState('');
  const [pinComerciante, setPinComerciante] = useState('');
  const [historico, setHistorico] = useState([]);

  // Monitor de Histórico
  useEffect(() => {
    if (isLoggedIn && nifLogado) {
      buscarUltimosMovimentos();
    }
  }, [isLoggedIn, nifLogado]);

  const buscarUltimosMovimentos = async () => {
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
    } catch (e) {
      console.error("Erro ao carregar histórico:", e);
    }
  };

  // Autenticação do Comerciante
  const login = async (nif, pass) => {
    if (!nif || !pass) return;
    setCarregando(true);
    try {
      const docSnap = await getDoc(doc(db, "comerciantes", nif));
      if (docSnap.exists() && String(docSnap.data().password) === String(pass)) {
        setLojaData(docSnap.data());
        setNifLogado(nif);
        setIsLoggedIn(true);
      } else {
        alert("NIF ou Password incorretos!");
      }
    } catch (e) {
      alert("Erro no login: " + e.message);
    }
    setCarregando(false);
  };

  // Lógica Principal: Movimentação de Saldo (O "Coração" do esqueleto)
  const processarOperacao = async (tipo) => {
    if (pinComerciante !== "1234") { alert("PIN do Comerciante Inválido!"); return; }
    if (!clientId || !valorFatura) { alert("Dados em falta!"); return; }
    
    const valor = Number(valorFatura);
    if (isNaN(valor) || valor <= 0) { alert("Valor inválido!"); return; }

    setCarregando(true);
    try {
      const percentagemLoja = lojaData.percentagem || 0;
      const saldoRef = doc(db, "clientes", clientId, "saldos_por_loja", nifLogado);
      const historicoRef = collection(db, "historico");

      let valorCashback = 0;

      if (tipo === 'emissao') {
        valorCashback = valor * percentagemLoja;
      } else if (tipo === 'desconto') {
        const snap = await getDoc(saldoRef);
        const saldoAtual = snap.exists() ? snap.data().saldoDisponivel : 0;
        if (saldoAtual < valor) {
          throw new Error(`Saldo insuficiente! O cliente só tem ${saldoAtual.toFixed(2)}€`);
        }
        valorCashback = -valor;
      }

      // Atualiza Saldo
      await setDoc(saldoRef, {
        saldoDisponivel: increment(valorCashback),
        nomeLoja: lojaData.nome,
        ultimaAtualizacao: serverTimestamp()
      }, { merge: true });

      // Regista Movimento
      await addDoc(historicoRef, {
        clienteId: clientId,
        lojaId: nifLogado,
        nomeLoja: lojaData.nome,
        valorVenda: tipo === 'desconto' ? 0 : valor,
        valorCashback: valorCashback,
        tipo: tipo,
        fatura: numFatura,
        data: serverTimestamp()
      });

      alert("Sucesso!");
      setClientId(''); setValorFatura(''); setNumFatura('');
      buscarUltimosMovimentos();

    } catch (e) {
      alert("Erro: " + e.message);
    }
    setCarregando(false);
  };

  if (!isLoggedIn) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <h1>VizinhoMais</h1>
        <input id="nif" type="text" placeholder="NIF" style={{ display: 'block', margin: '10px auto', padding: '10px' }} />
        <input id="pass" type="password" placeholder="Password" style={{ display: 'block', margin: '10px auto', padding: '10px' }} />
        <button onClick={() => login(document.getElementById('nif').value, document.getElementById('pass').value)} disabled={carregando}>
          {carregando ? "A entrar..." : "ENTRAR"}
        </button>
      </div>
    );
  }

  return (
    <div style={{ fontFamily: 'sans-serif', maxWidth: '600px', margin: 'auto' }}>
      <header style={{ background: '#eee', padding: '10px', display: 'flex', justifyContent: 'space-around' }}>
        <button onClick={() => setView('comerciante')}>TERMINAL</button>
        <button onClick={() => setView('cliente')}>CLIENTE</button>
        <button onClick={() => setView('relatorio')}>DASHBOARD</button>
        <button onClick={() => setView('gestor')}>ADMIN</button>
        <button onClick={() => setIsLoggedIn(false)} style={{ color: 'red' }}>SAIR</button>
      </header>

      <main style={{ padding: '20px' }}>
        {view === 'comerciante' && (
          <div>
            <h3>{lojaData.nome} (Terminal)</h3>
            <div style={{ border: '1px solid #ccc', padding: '15px', borderRadius: '8px' }}>
              <input type="password" placeholder="PIN Comerciante" value={pinComerciante} onChange={e => setPinComerciante(e.target.value)} style={{ width: '100%', marginBottom: '10px', padding: '8px', boxSizing: 'border-box' }} />
              <input type="text" placeholder="Telemóvel Cliente" value={clientId} onChange={e => setClientId(e.target.value)} style={{ width: '100%', marginBottom: '10px', padding: '8px', boxSizing: 'border-box' }} />
              <input type="text" placeholder="Fatura Nº" value={numFatura} onChange={e => setNumFatura(e.target.value)} style={{ width: '100%', marginBottom: '10px', padding: '8px', boxSizing: 'border-box' }} />
              <input type="number" placeholder="Valor (€)" value={valorFatura} onChange={e => setValorFatura(e.target.value)} style={{ width: '100%', marginBottom: '10px', padding: '8px', boxSizing: 'border-box' }} />
              
              <div style={{ display: 'flex', gap: '10px' }}>
                <button onClick={() => processarOperacao('emissao')} style={{ flex: 1, padding: '12px', background: 'green', color: 'white', fontWeight: 'bold', border: 'none' }}>EMITIR</button>
                <button onClick={() => processarOperacao('desconto')} style={{ flex: 1, padding: '12px', background: 'orange', color: 'white', fontWeight: 'bold', border: 'none' }}>DESCONTAR</button>
              </div>
            </div>

            <h4>Histórico</h4>
            {historico.map((mov, idx) => (
              <div key={idx} style={{ borderBottom: '1px solid #eee', padding: '8px', fontSize: '14px' }}>
                <strong>{mov.tipo === 'emissao' ? '💰' : '🔥'}</strong> {mov.valorCashback.toFixed(2)}€ | Cliente: {mov.clienteId}
              </div>
            ))}
          </div>
        )}

        {view === 'cliente' && <Cliente />}
        {view === 'relatorio' && <Relatorio />}
        {view === 'gestor' && <Gestor />}
      </main>
    </div>
  );
}

export default App;