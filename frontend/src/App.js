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

// MESTRE: O NIF da loja que está a usar o terminal
const NIF_LOJA = "123456789";

useEffect(() => {
const buscarDadosLoja = async () => {
const docRef = doc(db, "comerciantes", NIF_LOJA);
const docSnap = await getDoc(docRef);
if (docSnap.exists()) {
setLojaData(docSnap.data());
}
};
buscarDadosLoja();
}, []);

const movimentarCashback = async (tipo) => {
if (pin !== "1234") { alert("PIN incorreto!"); return; }
if (!clientId || !valorFatura || !numFatura || !lojaData) { alert("Dados incompletos ou loja não carregada!"); return; }

setCarregando(true);
const valorBase = Number(valorFatura);
// USA O % DA LOJA ARMAZENADO NO FIRESTORE
const valorCashback = tipo === 'emissao' ? (valorBase * lojaData.percentagem) : -(valorBase * lojaData.percentagem);

try {
const saldoRef = doc(db, "clientes", clientId, "saldos_por_loja", NIF_LOJA);
await setDoc(saldoRef, {
saldoDisponivel: increment(valorCashback),
nomeLoja: lojaData.nome
}, { merge: true });

await addDoc(collection(db, "historico"), {
clienteId: clientId,
lojaId: NIF_LOJA,
nomeLoja: lojaData.nome,
fatura: numFatura,
valorVenda: valorBase,
valorCashback: valorCashback,
data: serverTimestamp(),
tipo: tipo
});

alert(tipo === 'emissao' ? "Cashback Atribuído com sucesso!" : "Devolução registada!");
setClientId(''); setValorFatura(''); setNumFatura('');
} catch (e) { alert("Erro ao processar!"); }
finally { setCarregando(false); }
};

return (

<div style={{ backgroundColor: '#f4f4f4', minHeight: '100vh', fontFamily: 'sans-serif' }}>
<nav style={{ background: '#2c3e50', padding: '15px', display: 'flex', justifyContent: 'center', gap: '20px' }}>
<button onClick={() => setView('comerciante')} style={{ background: 'none', border: 'none', color: view === 'comerciante' ? '#f1c40f' : 'white', cursor: 'pointer', fontWeight: 'bold' }}>LOJA</button>
<button onClick={() => setView('cliente')} style={{ background: 'none', border: 'none', color: view === 'cliente' ? '#f1c40f' : 'white', cursor: 'pointer', fontWeight: 'bold' }}>CLIENTE</button>
<button onClick={() => setView('relatorio')} style={{ background: 'none', border: 'none', color: view === 'relatorio' ? '#f1c40f' : 'white', cursor: 'pointer', fontWeight: 'bold' }}>RELATÓRIOS</button>
<button onClick={() => setView('gestor')} style={{ background: 'none', border: 'none', color: view === 'gestor' ? '#f1c40f' : 'white', cursor: 'pointer', fontWeight: 'bold' }}>ADMIN (GESTOR)</button>
</nav>

<div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
{view === 'comerciante' ? (
<div style={{ background: 'white', padding: '30px', borderRadius: '10px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', textAlign: 'center' }}>
<h2>{lojaData ? Terminal: ${lojaData.nome} : "Carregando Loja..."}</h2>
<p style={{color: 'gray'}}>Percentagem de Cashback: {lojaData ? (lojaData.percentagem * 100) : 0}%</p>
<input type="password" placeholder="PIN de Segurança" value={pin} onChange={(e) => setPin(e.target.value)} style={{ display: 'block', margin: '10px auto', padding: '10px', width: '80%' }} />
<hr />
<input type="text" placeholder="Telemóvel do Cliente" value={clientId} onChange={(e) => setClientId(e.target.value)} style={{ display: 'block', margin: '10px auto', padding: '10px', width: '80%' }} />
<input type="text" placeholder="Nº Fatura / Nota Crédito" value={numFatura} onChange={(e) => setNumFatura(e.target.value)} style={{ display: 'block', margin: '10px auto', padding: '10px', width: '80%' }} />
<input type="number" placeholder="Valor Total (€)" value={valorFatura} onChange={(e) => setValorFatura(e.target.value)} style={{ display: 'block', margin: '10px auto', padding: '10px', width: '80%' }} />

<div style={{ marginTop: '20px', display: 'flex', justifyContent: 'center', gap: '10px' }}>
<button onClick={() => movimentarCashback('emissao')} disabled={carregando} style={{ background: 'green', color: 'white', padding: '15px 30px', border: 'none', borderRadius: '5px', opacity: carregando ? 0.5 : 1 }}>
{carregando ? "A processar..." : "EMITIR CASHBACK"}
</button>
<button onClick={() => movimentarCashback('devolucao')} disabled={carregando} style={{ background: '#e67e22', color: 'white', padding: '15px 30px', border: 'none', borderRadius: '5px', opacity: carregando ? 0.5 : 1 }}>
DEVOLUÇÃO
</button>
</div>
</div>
) : view === 'cliente' ? <Cliente /> : view === 'gestor' ? <Gestor /> : <Relatorio />}
</div>
</div>
);
}

export default App;