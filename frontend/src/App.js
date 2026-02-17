import React, { useState } from 'react';
import { db } from './firebase';
import { doc, setDoc, increment, collection, addDoc, serverTimestamp } from "firebase/firestore";
import Cliente from './Cliente';

function App() {
const [view, setView] = useState('comerciante');
const [clientId, setClientId] = useState('');
const [valorFatura, setValorFatura] = useState('');
const [numFatura, setNumFatura] = useState('');
const [pin, setPin] = useState('');

const LOJA_ID = "Padaria_Central";
const NOME_LOJA = "Padaria Central";
const PERCENTAGEM_CASHBACK = 0.10;
const PIN_MESTRE = "1234";

const movimentarCashback = async (tipo) => {
if (pin !== PIN_MESTRE) { alert("PIN incorreto!"); return; }
if (!clientId || !valorFatura || !numFatura) { alert("Preenche todos os campos!"); return; }

const valorBase = Number(valorFatura);
const valorCashback = tipo === 'emissao' ? (valorBase * PERCENTAGEM_CASHBACK) : -(valorBase * PERCENTAGEM_CASHBACK);

try {
const saldoRef = doc(db, "clientes", clientId, "saldos_por_loja", LOJA_ID);
await setDoc(saldoRef, {
saldoDisponivel: increment(valorCashback),
nomeLoja: NOME_LOJA
}, { merge: true });

await addDoc(collection(db, "historico"), {
clienteId: clientId,
lojaId: LOJA_ID,
nomeLoja: NOME_LOJA,
fatura: numFatura,
valorVenda: valorBase,
valorCashback: valorCashback,
data: serverTimestamp(),
tipo: tipo
});

alert(tipo === 'emissao' ? "Cashback Atribuído!" : "Cashback Retirado (Devolução)!");
setClientId('');
setValorFatura('');
setNumFatura('');
} catch (e) { alert("Erro ao processar!"); }
};

return (

<div>
<nav style={{ background: '#333', padding: '10px', textAlign: 'center' }}>
<button onClick={() => setView('comerciante')} style={{ marginRight: '10px' }}>Modo Comerciante</button>
<button onClick={() => setView('cliente')}>Modo Cliente</button>
</nav>

{view === 'comerciante' ? (

<div style={{ textAlign: 'center', marginTop: '50px' }}>
<h1>{NOME_LOJA}</h1>
<input type="password" placeholder="PIN" value={pin} onChange={(e) => setPin(e.target.value)} style={{ display: 'block', margin: '10px auto' }} />
<input type="text" placeholder="ID Cliente (Telemóvel)" value={clientId} onChange={(e) => setClientId(e.target.value)} style={{ display: 'block', margin: '10px auto' }} />
<input type="text" placeholder="Nº da Fatura / Nota Crédito" value={numFatura} onChange={(e) => setNumFatura(e.target.value)} style={{ display: 'block', margin: '10px auto' }} />
<input type="number" placeholder="Valor do Documento (€)" value={valorFatura} onChange={(e) => setValorFatura(e.target.value)} style={{ display: 'block', margin: '10px auto' }} />

<div style={{ marginTop: '20px' }}>
<button onClick={() => movimentarCashback('emissao')} style={{ background: 'green', color: 'white', padding: '15px', marginRight: '10px', border: 'none', borderRadius: '5px' }}>Emitir Cashback</button>
<button onClick={() => movimentarCashback('devolucao')} style={{ background: 'orange', color: 'white', padding: '15px', border: 'none', borderRadius: '5px' }}>Nota de Crédito (Retirar)</button>
</div>
</div>
) : (
<Cliente />
)}
</div>
);
}

export default App;