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

  // Busca o histórico da loja logada
  useEffect(() => {
    if (!isLoggedIn || !nifLogado) return;
    const buscarHistorico = async () => {
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
          setLoginPass('');
        } else { alert("Password incorreta!"); }
      } else { alert("NIF não encontrado!"); }
    } catch (e) { alert("Erro: " + e.message); }
    finally { setCarregando(false); }
  };

  const fazerLogout = () => {
    setIsLoggedIn(false);
    setLojaData(null);
    setNifLogado(null);
    setLoginNif('');
    setLoginPass('');
    setView('comerciante');
  };

  const movimentarCashback = async (tipo) => {
    if (pin !== "1234") { alert("PIN incorreto!"); return; }
    if (!clientId || !valorFatura || !lojaData) { alert("Dados incompletos!"); return; }
    setCarregando(true);
    try {
      const valorBase = Number(valorFatura);
      const perc = lojaData.percentagem || 0;
      const valorCashback = tipo === 'emissao' ? (valorBase * perc) : -(valorBase * perc);
      
      const saldoRef = doc(db, "clientes", clientId, "saldos_por_loja", nifLogado);
      await setDoc(saldoRef, { saldoDisponivel: increment(valorCashback), nomeLoja: lojaData.nome }, { merge: true });
      
      await addDoc(collection(db, "historico"), {
        clienteId: clientId, lojaId: nifLogado, nomeLoja: lojaData.nome, fatura: numFatura,
        valorVenda: valorBase, valorCashback: valorCashback, data: serverTimestamp(), tipo: tipo
      });
      
      alert("Operação concluída!");
      setClientId(''); setValorFatura(''); setNumFatura('');
      
      // Atualiza o histórico localmente
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
      <div>
        <h2>Login</h2>
        <input type="text" placeholder="NIF" value={loginNif} onChange={(e) => setLoginNif(e.target.value)} />
        <input type="password" placeholder="Password" value={loginPass} onChange={(e) => setLoginPass(e.target.value)} />
        <button onClick={autenticarComerciante} disabled={carregando}>{carregando ? "..." : "ENTRAR"}</button>
      </div>
    );
  }

  return (
    <div>
      <nav>
        <button onClick={() => setView('comerciante')}>LOJA</button>
        <button onClick={() => setView('cliente')}>CLIENTE</button>
        <button onClick={() => setView('gestor')}>ADMIN</button>
        <button onClick={fazerLogout}>Sair</button>
      </nav>
      
      <div>
        {view === 'comerciante' ? (
          <div>
            <h2>Terminal: {lojaData.nome}</h2>
            <p>NIF: {nifLogado} | Cashback: {(lojaData.percentagem * 100).toFixed(0)}%</p>
            <input type="password" placeholder="PIN" value={pin} onChange={(e) => setPin(e.target.value)} />
            <input type="text" placeholder="Telemóvel" value={clientId} onChange={(e) => setClientId(e.target.value)} />
            <input type="text" placeholder="Fatura" value={numFatura} onChange={(e) => setNumFatura(e.target.value)} />
            <input type="number" placeholder="Valor (€)" value={valorFatura} onChange={(e) => setValorFatura(e.target.value)} />
            <button onClick={() => movimentarCashback('emissao')} disabled={carregando}>EMITIR</button>
            <button onClick={() => movimentarCashback('devolucao')} disabled={carregando}>DEVOLUÇÃO</button>
            
            <h3>Últimos Movimentos</h3>
            {historico.map((h, i) => (
              <p key={i}>
                {h.tipo === 'emissao' ? '➕' : '➖'} 
                {h.valorCashback.toFixed(2)}€ - Fatura {h.fatura} 
                ({h.data ? h.data.toDate().toLocaleDateString() : 'agora'})
              </p>
            ))}
          </div>
        ) : view === 'cliente' ? <Cliente /> : <Gestor />}
      </div>
    </div>
  );
}
export default App;