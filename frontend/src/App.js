import React, { useState } from 'react';
import { db } from './firebase';
import { doc, setDoc, increment, collection, addDoc, serverTimestamp } from "firebase/firestore";
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

const LOJA_ID = "Padaria_Central";
const NOME_LOJA = "Padaria Central";
const PERCENTAGEM_CASHBACK = 0.10;
const PIN_MESTRE = "1234";

const movimentarCashback = async (tipo) => {
if (pin !== PIN_MESTRE) { alert("PIN incorreto!"); return; }
if (!clientId || !valorFatura || !numFatura) { alert("Preenche todos os campos!"); return; }

setCarregando(true);
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

alert(tipo === 'emissao' ? "Operação realizada com sucesso!" : "Devolução registada!");
setClientId('');
setValorFatura('');
setNumFatura('');
} catch (e) { alert("Erro na ligação ao servidor."); }
finally { setCarregando(false); }
};

return (

<div style={{ backgroundColor: '#f4f4f4', minHeight: '100vh' }}>
<nav style={{ background: '#2c3e50', padding: '15px', display: 'flex', justifyContent: 'center', gap: '20px' }}>
<button onClick={() => setView('comerciante')} style={{ background: 'none', border: 'none', color: view === 'comerciante' ? '#f1c40f' : 'white', cursor: 'pointer', fontWeight: 'bold' }}>LOJA</button>
<button onClick={() => setView('cliente')} style={{ background: 'none', border: 'none', color: view === 'cliente' ? '#f1c40f' : 'white', cursor: 'pointer', fontWeight: 'bold' }}>CLIENTE</button>
<button onClick={() => setView('relatorio')} style={{ background: 'none', border: 'none', color: view === 'relatorio' ? '#f1c40f' : 'white', cursor: 'pointer', fontWeight: 'bold' }}>RELATÓRIOS</button>
<button onClick={() => setView('gestor')} style={{ background: 'none', border: 'none', color: view === 'gestor' ? '#f1c40f' : 'white', cursor: 'pointer', fontWeight: 'bold' }}>ADMIN (GESTOR)</button>
</nav>

<div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
{view === 'comerciante' ? (
<div style={{ background: 'white', padding: '30px', borderRadius: '10px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', textAlign: 'center' }}>
<h2>Painel da Loja: {NOME_LOJA}</h2>
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