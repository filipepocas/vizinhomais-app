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
snap.forEach((doc) => { lista.push({ id: doc.id, ...doc.data() }); });
setHistoricoGlobal(lista);
} catch (e) { console.error(e); }
};

useEffect(() => { carregarDados(); }, []);

return (

<div style={{ padding: '20px' }}>
<h1>Painel do Gestor - Auditoria</h1>
<button onClick={carregarDados} style={{ padding: '10px' }}>Atualizar Dados</button>
<table style={{ width: '100%', marginTop: '20px', borderCollapse: 'collapse' }}>
<thead>
<tr style={{ background: '#eee' }}>
<th style={{ border: '1px solid #ddd', padding: '8px' }}>Data</th>
<th style={{ border: '1px solid #ddd', padding: '8px' }}>Loja</th>
<th style={{ border: '1px solid #ddd', padding: '8px' }}>Cliente</th>
<th style={{ border: '1px solid #ddd', padding: '8px' }}>Tipo</th>
<th style={{ border: '1px solid #ddd', padding: '8px' }}>Valor</th>
</tr>
</thead>
<tbody>
{historicoGlobal.map((h) => (
<tr key={h.id}>
<td style={{ border: '1px solid #ddd', padding: '8px' }}>{h.data?.toDate().toLocaleString()}</td>
<td style={{ border: '1px solid #ddd', padding: '8px' }}>{h.nomeLoja}</td>
<td style={{ border: '1px solid #ddd', padding: '8px' }}>{h.clienteId}</td>
<td style={{ border: '1px solid #ddd', padding: '8px' }}>{h.tipo}</td>
<td style={{ border: '1px solid #ddd', padding: '8px', color: h.valorCashback > 0 ? 'green' : 'red' }}>
{h.valorCashback.toFixed(2)}€
</td>
</tr>
))}
</tbody>
</table>
</div>
);
}

export default Gestor;