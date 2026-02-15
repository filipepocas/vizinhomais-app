import React, { useState } from 'react';
import { db } from './firebase';
import { doc, getDoc, collection, query, where, orderBy, getDocs } from "firebase/firestore";

function Cliente() {
const [id, setId] = useState('');
const [pontos, setPontos] = useState(null);
const [historico, setHistorico] = useState([]);
const [mensagem, setMensagem] = useState('');

const consultarDados = async () => {
if (!id) return alert("Insere o teu ID!");
try {
const docRef = doc(db, "clientes", id);
const docSnap = await getDoc(docRef);
if (docSnap.exists()) {
setPontos(docSnap.data().pontos);
setMensagem('Pontos encontrados!');
} else {
setPontos(0);
setMensagem('Cliente não encontrado.');
}

const historicoRef = collection(db, "historico");
const q = query(historicoRef, where("clienteId", "==", id), orderBy("data", "desc"));
const querySnapshot = await getDocs(q);
const transacoes = [];
querySnapshot.forEach((doc) => { transacoes.push({ id: doc.id, ...doc.data() }); });
setHistorico(transacoes);
} catch (e) {
console.error(e);
setMensagem('Erro ao consultar. Vê a consola (F12).');
}
};

return (

<div style={{ textAlign: 'center', marginTop: '50px' }}>
<h1>Consultar Pontos</h1>
<input
type="text"
placeholder="O teu ID"
value={id}
onChange={(e) => setId(e.target.value)}
/>
<button onClick={consultarDados}>Ver Pontos</button>

{pontos !== null && (

<div>
<h2>{mensagem}</h2>
<h3>Saldo: {pontos} pontos</h3>
<hr />
<h4>Histórico:</h4>
{historico.map((t) => (
<div key={t.id} style={{ color: t.pontos > 0 ? 'green' : 'red' }}>
{t.pontos > 0 ? '+' : ''}{t.pontos} pontos
</div>
))}
</div>
)}
</div>
);
}

export default Cliente;