import React, { useState } from 'react';
import { db } from './firebase';
import { doc, setDoc, increment, collection, addDoc, serverTimestamp } from "firebase/firestore";
import Cliente from './Cliente';

function App() {
const [view, setView] = useState('comerciante');
const [clientId, setClientId] = useState('');
const [valorVenda, setValorVenda] = useState('');
const [pin, setPin] = useState('');

const LOJA_ID = "Padaria_Central";
const NOME_LOJA = "Padaria Central";
const PERCENTAGEM_CASHBACK = 0.10;
const PIN_MESTRE = "1234";

const processarCashback = async () => {
if (pin !== PIN_MESTRE) { alert("PIN incorreto!"); return; }
if (!clientId || !valorVenda) { alert("Preenche os dados!"); return; }

const valorCashback = Number(valorVenda) * PERCENTAGEM_CASHBACK;

try {
const saldoRef = doc(db, "clientes", clientId, "saldos_por_loja", LOJA_ID);
await setDoc(saldoRef, {
saldoDisponivel: increment(valorCashback),
nomeLoja: NOME_LOJA,
ultimaAtualizacao: serverTimestamp()
}, { merge: true });

await addDoc(collection(db, "historico"), {
clienteId: clientId,
lojaId: LOJA_ID,
nomeLoja: NOME_LOJA,
valorVenda: Number(valorVenda),
valorCashback: valorCashback,
data: serverTimestamp(),
disponivelEm: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
tipo: "emissao"
});

alert("Cashback de " + valorCashback.toFixed(2) + "€ registado para esta loja!");
setClientId('');
setValorVenda('');
} catch (e) {
alert("Erro no sistema!");
}
};

return (

<div>
<nav style={{ background: '#333', padding: '10px', textAlign: 'center' }}>
<button onClick={() => setView('comerciante')} style={{ marginRight: '10px' }}>Modo Comerciante</button>
<button onClick={() => setView('cliente')}>Modo Cliente</button>
</nav>

{view === 'comerciante' ? (

<div style={{ textAlign: 'center', marginTop: '50px' }}>
<h1>{NOME_LOJA} - Painel</h1>
<input type="password" placeholder="PIN" value={pin} onChange={(e) => setPin(e.target.value)} style={{ display: 'block', margin: '10px auto' }} />
<input type="text" placeholder="ID Cliente" value={clientId} onChange={(e) => setClientId(e.target.value)} style={{ display: 'block', margin: '10px auto' }} />
<input type="number" placeholder="Total Fatura (€)" value={valorVenda} onChange={(e) => setValorVenda(e.target.value)} style={{ display: 'block', margin: '10px auto' }} />
<p>Cashback a acumular (10%): {(Number(valorVenda) * 0.10).toFixed(2)}€</p>
<button onClick={processarCashback} style={{ background: 'green', color: 'white', padding: '10px' }}>Confirmar Venda</button>
</div>
) : (
<Cliente />
)}
</div>
);
}

export default App;