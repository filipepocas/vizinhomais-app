import React, { useState, useEffect } from 'react';
import { db } from './firebase';
import { collection, query, getDocs, orderBy, where } from "firebase/firestore";

function Gestor() {
const [historicoGlobal, setHistoricoGlobal] = useState([]);
const [dataFiltro, setDataFiltro] = useState('');

const carregarDados = async () => {
try {
let q = query(collection(db, "historico"), orderBy("data", "desc"));
const snap = await getDocs(q);
const lista = [];
snap.forEach((doc) => {
const data = doc.data();
if (data && data.valorCashback !== undefined) {
lista.push({ id: doc.id, ...data });
}
});
setHistoricoGlobal(lista);
} catch (e) { console.error("Erro ao ler dados:", e); }
};

useEffect(() => { carregarDados(); }, []);

return (

<div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
<h1>Painel do Gestor - Auditoria Global</h1>
<div style={{ marginBottom: '20px' }}>
<input type="date" value={dataFiltro} onChange={(e) => setDataFiltro(e.target.value)} style={{ padding: '10px', marginRight: '10px' }} />
<button onClick={carregarDados} style={{ padding: '10px', cursor: 'pointer' }}>Atualizar/Limpar</button>
</div>

<table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
<thead>
<tr style={{ background: '#333', color: 'white' }}>
<th style={{ padding: '10px', border: '1px solid #ddd' }}>Data</th>
<th style={{ padding: '10px', border: '1px solid #ddd' }}>Loja</th>
<th style={{ padding: '10px', border: '1px solid #ddd' }}>Cliente</th>
<th style={{ padding: '10px', border: '1px solid #ddd' }}>Tipo</th>
<th style={{ padding: '10px', border: '1px solid #ddd' }}>Valor</th>
</tr>
</thead>
<tbody>
{historicoGlobal.map((h) => (
<tr key={h.id}>
<td style={{ padding: '10px', border: '1px solid #ddd' }}>{h.data?.toDate().toLocaleString() || '---'}</td>
<td style={{ padding: '10px', border: '1px solid #ddd' }}>{h.nomeLoja}</td>
<td style={{ padding: '10px', border: '1px solid #ddd' }}>{h.clienteId}</td>
<td style={{ padding: '10px', border: '1px solid #ddd' }}>{h.tipo}</td>
<td style={{ padding: '10px', border: '1px solid #ddd', fontWeight: 'bold', color: h.valorCashback > 0 ? 'green' : 'red' }}>
{Number(h.valorCashback).toFixed(2)}€
</td>
</tr>
))}
</tbody>
</table>
</div>
);
}

export default Gestor;