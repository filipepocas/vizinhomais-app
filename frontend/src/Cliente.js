import React, { useState, useEffect } from 'react';
import { db } from './firebase';
import { collection, query, getDocs, orderBy } from "firebase/firestore";

function Cliente() {
const [id, setId] = useState(localStorage.getItem('clienteId') || '');
const [saldos, setSaldos] = useState([]);
const [historico, setHistorico] = useState([]);

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
</div>
))
) : (
<p>Ainda não tens saldos acumulados.</p>
)}
</div>

<hr />
<h3>Histórico de Atividade</h3>
{historico.map((h) => (
<div key={h.id} style={{ fontSize: '14px', borderBottom: '1px solid #ddd', padding: '5px' }}>
{h.nomeLoja}: <strong>{h.valorCashback.toFixed(2)}€</strong> ({h.tipo})
</div>
))}
</div>
);
}

export default Cliente;