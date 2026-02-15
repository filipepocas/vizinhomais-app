import React, { useState } from 'react';
import { db } from './firebase';
import { doc, setDoc, increment, collection, addDoc, serverTimestamp } from "firebase/firestore";
import Cliente from './Cliente';

function App() {
const [view, setView] = useState('comerciante');
const [clientId, setClientId] = useState('');
const [quantidade, setQuantidade] = useState(10);
const [pin, setPin] = useState('');
const PIN_MESTRE = "1234";

const atualizarPontos = async (operacao) => {
if (pin !== PIN_MESTRE) {
alert("PIN incorreto!");
return;
}
if (!clientId) {
alert("Insere o ID!");
return;
}
const valor = operacao === 'adicionar' ? Number(quantidade) : -Number(quantidade);
try {
await setDoc(doc(db, "clientes", clientId), { pontos: increment(valor) }, { merge: true });
await addDoc(collection(db, "historico"), {
clienteId: clientId,
pontos: valor,
data: serverTimestamp(),
tipo: operacao
});
alert("Sucesso!");
setClientId('');
setPin('');
} catch (e) {
alert("Erro!");
}
};

return (

<div>
<nav style={{ background: '#333', padding: '10px', textAlign: 'center' }}>
<button onClick={() => setView('comerciante')} style={{ marginRight: '10px' }}>Comerciante</button>
<button onClick={() => setView('cliente')}>Cliente</button>
</nav>
{view === 'comerciante' ? (
<div style={{ textAlign: 'center', marginTop: '50px' }}>
<h1>Painel Comerciante</h1>
<input type="password" placeholder="PIN" value={pin} onChange={(e) => setPin(e.target.value)} style={{ display: 'block', margin: '10px auto' }} />
<input type="text" placeholder="ID Cliente" value={clientId} onChange={(e) => setClientId(e.target.value)} style={{ display: 'block', margin: '10px auto' }} />
<input type="number" value={quantidade} onChange={(e) => setQuantidade(e.target.value)} />
<br /><br />
<button onClick={() => atualizarPontos('adicionar')}>+ Dar Pontos</button>
<button onClick={() => atualizarPontos('retirar')}>- Retirar Pontos</button>
</div>
) : (
<Cliente />
)}
</div>
);
}

export default App;