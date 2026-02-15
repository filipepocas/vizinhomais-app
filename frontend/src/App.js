import React, { useState } from 'react';
import { db } from './firebase';
import { doc, setDoc, increment, collection, addDoc, serverTimestamp } from "firebase/firestore";
import Cliente from './Cliente';

function App() {
const [view, setView] = useState('comerciante');
const [clientId, setClientId] = useState('');
const [quantidade, setQuantidade] = useState(10);
const [pin, setPin] = useState('');

const PIN_MESTRE = "1234"; // Esta é a tua senha. Podes mudar para o que quiseres.

const atualizarPontos = async (operacao) => {
if (pin !== PIN_MESTRE) {
alert("PIN de Comerciante incorreto!");
return;
}
if (!clientId) {
alert("Insere o ID do cliente!");
return;
}

const valorAlterar = operacao === 'adicionar' ? Number(quantidade) : -Number(quantidade);

try {
const docRef = doc(db, "clientes", clientId);
await setDoc(docRef, { pontos: increment(valorAlterar) }, { merge: true });

await addDoc(collection(db, "historico"), {
clienteId: clientId,
pontos: valorAlterar,
data: serverTimestamp(),
tipo: operacao
});

alert("Sucesso! Pontos atualizados.");
setClientId('');
setPin('');
} catch (e) {
console.error(e);
alert("Erro ao gravar dados.");
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
<h1>Painel do Comerciante</h1>
<input
type="password"
placeholder="Introduz o PIN"
value={pin}
onChange={(e) => setPin(e.target.value)}
style={{ display: 'block', margin: '10px auto', padding: '10px' }}
/>
<input
type="text"
placeholder="ID do Cliente"
value={clientId}
onChange={(e) => setClientId(e.target.value)}
style={{ display: 'block', margin: '10px auto', padding: '10px' }}
/>
<input
type="number"
value={quantidade}
onChange={(e) => setQuantidade(e.target.value)}
style={{ padding: '10px', width: '60px' }}
/>
<br /><br />
<button onClick={() => atualizarPontos('adicionar')} style={{ color: 'green', padding: '10px' }}>+ Dar Pontos</button>
<button onClick={() => atualizarPontos('retirar')} style={{ color: 'red', marginLeft: '10px', padding: '10px' }}>- Retirar Pontos</button>
</div>
) : (
<Cliente />
)}
</div>
);
}

export default App;