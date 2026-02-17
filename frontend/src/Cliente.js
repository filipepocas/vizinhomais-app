import React, { useState, useEffect } from 'react';
import { db } from './firebase';
import { collection, query, getDocs, orderBy, doc, setDoc, increment, addDoc, serverTimestamp } from "firebase/firestore";

function Cliente() {
const [id, setId] = useState(localStorage.getItem('clienteId') || '');
const [saldos, setSaldos] = useState([]);
const [historico, setHistorico] = useState([]);
const [valorDesconto, setValorDesconto] = useState('');

const consultarDados = async () => {
if (!id) return;
localStorage.setItem('clienteId', id);
try {
const saldosSnap = await getDocs(collection(db, "clientes", id, "saldos_por_loja"));
const listaSaldos = [];
saldosSnap.forEach((doc) => { listaSaldos.push({ id: doc.id, ...doc.data() }); });
setSaldos(listaSaldos);

const hQuery = query(collection(db, "historico"), orderBy("data", "desc"));
const hSnap = await getDocs(hQuery);
const listaH = [];
hSnap.forEach((doc) => {
if(doc.data().clienteId === id) { listaH.push({ id: doc.id, ...doc.data() }); }
});
setHistorico(listaH);
} catch (e) { console.error(e); }
};

const utilizarSaldo = async (lojaId, nomeLoja, saldoAtual) => {
const valor = Number(valorDesconto);
if (!valor || valor <= 0) { alert("Valor inválido!"); return; }
if (valor > saldoAtual) { alert("Saldo insuficiente!"); return; }

try {
const saldoRef = doc(db, "clientes", id, "saldos_por_loja", lojaId);
await setDoc(saldoRef, {
saldoDisponivel: increment(-valor)
}, { merge: true });

await addDoc(collection(db, "historico"), {
clienteId: id,
lojaId: lojaId,
nomeLoja: nomeLoja,
valorCashback: -valor,
data: serverTimestamp(),
tipo: "utilizacao"
});

alert("Saldo de " + valor + "€ utilizado com sucesso!");
setValorDesconto('');
consultarDados();
} catch (e) { alert("Erro ao utilizar saldo."); }
};

useEffect(() => { if (id) { consultarDados(); } }, []);

return (

<div style={{ textAlign: 'center', marginTop: '50px', padding: '20px' }}>
<h1>O Meu Cartão VizinhoMais</h1>
<input value={id} onChange={(e) => setId(e.target.value)} placeholder="ID do Cliente" style={{ padding: '10px' }} />
<button onClick={consultarDados} style={{ padding: '10px', marginLeft: '5px' }}>Ver Saldos</button>

<div style={{ marginTop: '30px' }}>
{saldos.length > 0 ? (
saldos.map((s) => (
<div key={s.id} style={{ border: '2px solid #333', borderRadius: '10px', padding: '15px', margin: '10px auto', maxWidth: '300px', backgroundColor: '#f9f9f9' }}>
<h2 style={{ margin: '0' }}>{s.nomeLoja}</h2>
<p style={{ fontSize: '20px', fontWeight: 'bold', color: 'green' }}>{s.saldoDisponivel.toFixed(2)}€ em saldo</p>
<input type="number" placeholder="Valor a descontar" onChange={(e) => setValorDesconto(e.target.value)} style={{ width: '80%', padding: '5px', marginBottom: '5px' }} />
<button onClick={() => utilizarSaldo(s.id, s.nomeLoja, s.saldoDisponivel)} style={{ background: '#333', color: 'white', padding: '5px 10px', border: 'none', borderRadius: '5px' }}>Utilizar Saldo</button>
</div>
))
) : (
<p>Ainda não tens saldos acumulados.</p>
)}
</div>
</div>
);
}

export default Cliente;