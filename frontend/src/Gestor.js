import React, { useState, useEffect } from 'react';
import { db } from './firebase';
import { collection, query, getDocs, orderBy } from "firebase/firestore";

function Gestor() {
const [historicoGlobal, setHistoricoGlobal] = useState([]);
const [dataFiltro, setDataFiltro] = useState('');

const carregarDados = async () => {
try {
const q = query(collection(db, "historico"), orderBy("data", "desc"));
const snap = await getDocs(q);
const lista = [];
snap.forEach((doc) => {
const data = doc.data();
if (data && data.valorCashback !== undefined) {
const dataTransacao = data.data?.toDate().toISOString().split('T')[0];
if (!dataFiltro || dataFiltro === dataTransacao) {
lista.push({ id: doc.id, ...data });
}
}
});
setHistoricoGlobal(lista);
} catch (e) { console.error("Erro:", e); }
};

const exportarCSV = () => {
let csvContent = "data:text/csv;charset=utf-8,Data,Loja,Cliente,Tipo,Valor\n";
historicoGlobal.forEach((h) => {
const dataFormatada = h.data?.toDate().toLocaleString().replace(',', '');
const linha = dataFormatada + "," + h.nomeLoja + "," + h.clienteId + "," + h.tipo + "," + h.valorCashback + "\n";
csvContent += linha;
});
const encodedUri = encodeURI(csvContent);
const link = document.createElement("a");
link.setAttribute("href", encodedUri);
link.setAttribute("download", "auditoria_vizinhomais.csv");
document.body.appendChild(link);
link.click();
document.body.removeChild(link);
};

useEffect(() => { carregarDados(); }, [dataFiltro]);

return (

<div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
<h1>Painel do Gestor - Auditoria</h1>
<div style={{ marginBottom: '20px', display: 'flex', gap: '10px', alignItems: 'center' }}>
<input type="date" value={dataFiltro} onChange={(e) => setDataFiltro(e.target.value)} style={{ padding: '8px' }} />
<button onClick={() => setDataFiltro('')} style={{ padding: '8px' }}>Limpar Filtro</button>
<button onClick={exportarCSV} style={{ padding: '8px', background: '#27ae60', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>Exportar Excel (CSV)</button>
</div>

<table style={{ width: '100%', borderCollapse: 'collapse' }}>
<thead>
<tr style={{ background: '#333', color: 'white' }}>
<th style={{ padding: '10px', border: '1px solid #ddd' }}>Data/Hora</th>
<th style={{ padding: '10px', border: '1px solid #ddd' }}>Loja</th>
<th style={{ padding: '10px', border: '1px solid #ddd' }}>Cliente</th>
<th style={{ padding: '10px', border: '1px solid #ddd' }}>Tipo</th>
<th style={{ padding: '10px', border: '1px solid #ddd' }}>Valor</th>
</tr>
</thead>
<tbody>
{historicoGlobal.map((h) => (
<tr key={h.id}>
<td style={{ padding: '10px', border: '1px solid #ddd' }}>{h.data?.toDate().toLocaleString()}</td>
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