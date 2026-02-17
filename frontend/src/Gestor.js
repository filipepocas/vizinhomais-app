import React, { useState, useEffect } from 'react';
import { db } from './firebase';
import { collection, query, getDocs, orderBy } from "firebase/firestore";

function Gestor() {
const [historicoGlobal, setHistoricoGlobal] = useState([]);

const carregarDados = async () => {
try {
const q = query(collection(db, "historico"), orderBy("data", "desc"));
const snap = await getDocs(q);
const lista = [];
snap.forEach((doc) => {
const data = doc.data();
// Proteção: Só adiciona se o valorCashback existir
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
<button onClick={carregarDados} style={{ padding: '10px', marginBottom: '20px', cursor: 'pointer' }}>Atualizar Dados</button>
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