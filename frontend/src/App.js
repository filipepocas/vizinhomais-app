import React, { useState, useEffect } from 'react';
import { db } from './firebase';
import { doc, setDoc, increment, collection, addDoc, serverTimestamp, getDoc } from "firebase/firestore";
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

// ESTADOS DE LOGIN
const [loginNif, setLoginNif] = useState('');
const [loginPass, setLoginPass] = useState('');
const [isLoggedIn, setIsLoggedIn] = useState(false);
const [nifLogado, setNifLogado] = useState(null);

const autenticarComerciante = async () => {
try {
const docRef = doc(db, "comerciantes", loginNif);
const docSnap = await getDoc(docRef);
if (docSnap.exists() && docSnap.data().password === loginPass) {
setLojaData(docSnap.data());
setNifLogado(loginNif);
setIsLoggedIn(true);
} else {
alert("NIF ou Password incorretos!");
}
} catch (e) { console.error(e); }
};

const movimentarCashback = async (tipo) => {
if (pin !== "1234") { alert("PIN incorreto!"); return; }
if (!clientId || !valorFatura || !numFatura || !lojaData) { alert("Dados incompletos!"); return; }

setCarregando(true);
const valorBase = Number(valorFatura);
const valorCashback = tipo === 'emissao' ? (valorBase * lojaData.percentagem) : -(valorBase * lojaData.percentagem);

try {
const saldoRef = doc(db, "clientes", clientId, "saldos_por_loja", nifLogado);
const saldoSnap = await getDoc(saldoRef);
const saldoAtual = saldoSnap.exists() ? saldoSnap.data().saldoDisponivel : 0;

if (tipo === 'devolucao' && saldoAtual < Math.abs(valorCashback)) {
alert("Saldo disponível insuficiente (verifique carência de 2 dias).");
setCarregando(false);
return;
}

await setDoc(saldoRef, { saldoDisponivel: increment(valorCashback), nomeLoja: lojaData.nome }, { merge: true });
await addDoc(collection(db, "historico"), {
clienteId: clientId, lojaId: nifLogado, nomeLoja: lojaData.nome, fatura: numFatura,
valorVenda: valorBase, valorCashback: valorCashback, data: serverTimestamp(), tipo: tipo
});

alert("Operação concluída!");
setClientId(''); setValorFatura(''); setNumFatura('');
} catch (e) { alert("Erro de ligação."); }
finally { setCarregando(false); }
};

// Ecrã de Login
if (!isLoggedIn) {
return (

<div style={{ padding: '50px', textAlign: 'center', fontFamily: 'sans-serif', backgroundColor: '#2c3e50', minHeight: '100vh', color: 'white' }}>
<h1>Login do Comerciante</h1>
<input type="text" placeholder="NIF" value={loginNif} onChange={(e) => setLoginNif(e.target.value)} style={{ display: 'block', margin: '10px auto', padding: '10px', width: '250px' }} />
<input type="password" placeholder="Password" value={loginPass} onChange={(e) => setLoginPass(e.target.value)} style={{ display: 'block', margin: '10px auto', padding: '10px', width: '250px' }} />
<button onClick={autenticarComerciante} style={{ padding: '10px 20px', background: '#f1c40f', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}>ENTRAR</button>
</div>
);
}

// Ecrã Principal (após login)
return (

<div style={{ backgroundColor: '#f4f4f4', minHeight: '100vh', fontFamily: 'sans-serif' }}>
<nav style={{ background: '#2c3e50', padding: '15px', display: 'flex', justifyContent: 'center', gap: '20px' }}>
<button onClick={() => setView('comerciante')} style={{ background: 'none', border: 'none', color: view === 'comerciante' ? '#f1c40f' : 'white', cursor: 'pointer', fontWeight: 'bold' }}>LOJA</button>
<button onClick={() => setView('cliente')} style={{ background: 'none', border: 'none', color: view === 'cliente' ? '#f1c40f' : 'white', cursor: 'pointer', fontWeight: 'bold' }}>CLIENTE</button>
<button onClick={() => setView('relatorio')} style={{ background: 'none', border: 'none', color: view === 'relatorio' ? '#f1c40f' : 'white', cursor: 'pointer', fontWeight: 'bold' }}>RELATÓRIOS</button>
<button onClick={() => setView('gestor')} style={{ background: 'none', border: 'none', color: view === 'gestor' ? '#f1c40f' : 'white', cursor: 'pointer', fontWeight: 'bold' }}>ADMIN</button>
<button onClick={() => setIsLoggedIn(false)} style={{ background: 'none', border: 'none', color: 'red', cursor: 'pointer', marginLeft: 'auto' }}>Sair</button>
</nav>

<div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
{view === 'comerciante' ? (
<div style={{ background: 'white', padding: '30px', borderRadius: '10px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', textAlign: 'center' }}>
<h2>Terminal: {lojaData.nome}</h2>
<p style={{color: 'gray'}}>Percentagem: {(lojaData.percentagem * 100).toFixed(0)}%</p>
<input type="password" placeholder="PIN de Segurança" value={pin} onChange={(e) => setPin(e.target.value)} style={{ display: 'block', margin: '10px auto', padding: '10px', width: '80%' }} />
<hr />
<input type="text" placeholder="Telemóvel Cliente" value={clientId} onChange={(e) => setClientId(e.target.value)} style={{ display: 'block', margin: '10px auto', padding: '10px', width: '80%' }} />
<input type="text" placeholder="Fatura / Nota" value={numFatura} onChange={(e) => setNumFatura(e.target.value)} style={{ display: 'block', margin: '10px auto', padding: '10px', width: '80%' }} />
<input type="number" placeholder="Valor Venda (€)" value={valorFatura} onChange={(e) => setValorFatura(e.target.value)} style={{ display: 'block', margin: '10px auto', padding: '10px', width: '80%' }} />

<div style={{ marginTop: '20px', display: 'flex', justifyContent: 'center', gap: '10px' }}>
<button onClick={() => movimentarCashback('emissao')} disabled={carregando} style={{ background: 'green', color: 'white', padding: '15px', borderRadius: '5px' }}>{carregando ? "..." : "EMITIR"}</button>
<button onClick={() => movimentarCashback('devolucao')} disabled={carregando} style={{ background: '#e67e22', color: 'white', padding: '15px', borderRadius: '5px' }}>DEVOLUÇÃO</button>
</div>
</div>
) : view === 'cliente' ? <Cliente /> : view === 'gestor' ? <Gestor /> : <Relatorio />}
</div>
</div>
);
}
export default App;