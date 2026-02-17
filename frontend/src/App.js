import React, { useState, useEffect } from 'react';
import { db } from './firebase';
import { doc, setDoc, increment, collection, addDoc, serverTimestamp, getDoc, getDocs, query, where } from "firebase/firestore";
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

// NIF da loja de teste - Garante que este NIF existe no teu Gestor!
const NIF_LOJA = "123456789";

useEffect(() => {
const buscarDadosLoja = async () => {
try {
const docRef = doc(db, "comerciantes", NIF_LOJA);
const docSnap = await getDoc(docRef);
if (docSnap.exists()) { setLojaData(docSnap.data()); }
} catch (e) { console.error("Erro:", e); }
};
buscarDadosLoja();
}, []);

const movimentarCashback = async (tipo) => {
if (pin !== "1234") { alert("PIN incorreto!"); return; }
if (!clientId || !valorFatura || !numFatura || !lojaData) { alert("Dados incompletos!"); return; }

setCarregando(true);
const valorBase = Number(valorFatura);
const valorCashback = tipo === 'emissao' ? (valorBase * lojaData.percentagem) : -(valorBase * lojaData.percentagem);

try {
// 1. Verificar saldo disponível real
const saldoRef = doc(db, "clientes", clientId, "saldos_por_loja", NIF_LOJA);
const saldoSnap = await getDoc(saldoRef);
const saldoAtual = saldoSnap.exists() ? saldoSnap.data().saldoDisponivel : 0;

if (tipo === 'devolucao' && saldoAtual < Math.abs(valorCashback)) {
alert("Saldo disponível insuficiente para esta devolução (verifique os 2 dias de carência).");
setCarregando(false);
return;
}

// 2. Atualizar saldo
await setDoc(saldoRef, {
saldoDisponivel: increment(valorCashback),
nomeLoja: lojaData.nome
}, { merge: true });

// 3. Registar no histórico
await addDoc(collection(db, "historico"), {
clienteId: clientId, lojaId: NIF_LOJA, nomeLoja: lojaData.nome, fatura: numFatura,
valorVenda: valorBase, valorCashback: valorCashback, data: serverTimestamp(), tipo: tipo
});

alert("Operação concluída!");
setClientId(''); setValorFatura(''); setNumFatura('');
} catch (e) { alert("Erro de ligação."); }
finally { setCarregando(false); }
};

return (

<div style={{ backgroundColor: '#f4f4f4', minHeight: '100vh', fontFamily: 'sans-serif' }}>
<nav style={{ background: '#2c3e50', padding: '15px', display: 'flex', justifyContent: 'center', gap: '20px' }}>
<button onClick={() => setView('comerciante')} style={{ background: 'none', border: 'none', color: view === 'comerciante' ? '#f1c40f' : 'white', cursor: 'pointer', fontWeight: 'bold' }}>LOJA</button>
<button onClick={() => setView('cliente')} style={{ background: 'none', border: 'none', color: view === 'cliente' ? '#f1c40f' : 'white', cursor: 'pointer', fontWeight: 'bold' }}>CLIENTE</button>
<button onClick={() => setView('relatorio')} style={{ background: 'none', border: 'none', color: view === 'relatorio' ? '#f1c40f' : 'white', cursor: 'pointer', fontWeight: 'bold' }}>RELATÓRIOS</button>
<button onClick={() => setView('gestor')} style={{ background: 'none', border: 'none', color: view === 'gestor' ? '#f1c40f' : 'white', cursor: 'pointer', fontWeight: 'bold' }}>ADMIN</button>
</nav>

<div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
{view === 'comerciante' ? (
<div style={{ background: 'white', padding: '30px', borderRadius: '10px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', textAlign: 'center' }}>
<h2>{lojaData ? 'Loja: ' + lojaData.nome : "A carregar..."}</h2>
<p style={{color: 'gray'}}>Cashback: {lojaData ? (lojaData.percentagem * 100).toFixed(0) + '%' : '0%'}</p>
<input type="password" placeholder="PIN" value={pin} onChange={(e) => setPin(e.target.value)} style={{ display: 'block', margin: '10px auto', padding: '10px', width: '80%' }} />
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