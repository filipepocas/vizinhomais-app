import React, { useState, useEffect } from 'react';
import { db } from './firebase';
import { doc, getDoc, collection, query, where, orderBy, getDocs } from "firebase/firestore";

function Cliente() {
const [id, setId] = useState(localStorage.getItem('clienteId') || '');
const [pontos, setPontos] = useState(null);
const [historico, setHistorico] = useState([]);

const consultarDados = async () => {
if (!id) return alert("Insere o teu ID!");
localStorage.setItem('clienteId', id);
try {
const docRef = doc(db, "clientes", id);
const docSnap = await getDoc(docRef);
if (docSnap.exists()) { setPontos(docSnap.data().pontos); }
const q = query(collection(db, "historico"), where("clienteId", "==", id), orderBy("data", "desc"));
const querySnapshot = await getDocs(q);
const transacoes = [];
querySnapshot.forEach((doc) => { transacoes.push({ id: doc.id, ...doc.data() }); });
setHistorico(transacoes);
} catch (e) { console.error(e); }
};

useEffect(() => { if (id) { consultarDados(); } }, []);

return (
<div style={{ textAlign: 'center', marginTop: '50px' }}>
<h1>VizinhoMais - Meus Pontos</h1>
<input value={id} onChange={(e) => setId(e.target.value)} placeholder="ID" style={{ padding: '10px' }} />
<button onClick={consultarDados} style={{ padding: '10px' }}>Ver</button>
{pontos !== null && (
<div>
<h2>Saldo: {pontos}</h2>
{historico.map(t => (
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