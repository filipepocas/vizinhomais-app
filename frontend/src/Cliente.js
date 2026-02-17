import React, { useState, useEffect } from 'react';
import { db } from './firebase';
import { collection, query, where, getDocs } from "firebase/firestore";

function Cliente() {
const [clienteId, setClienteId] = useState('');
const [saldos, setSaldos] = useState([]);
const [carregando, setCarregando] = useState(false);

const verificarSaldo = async () => {
if (!clienteId) return;
setCarregando(true);
try {
const q = query(collection(db, "historico"), where("clienteId", "==", clienteId));
const snap = await getDocs(q);
const resumoPorLoja = {};
const agora = new Date();

snap.forEach((doc) => {
const trans = doc.data();
const dataTrans = trans.data.toDate();
const diasPassados = (agora - dataTrans) / (1000 * 60 * 60 * 24);

if (!resumoPorLoja[trans.lojaId]) {
resumoPorLoja[trans.lojaId] = { nomeLoja: trans.nomeLoja, disponivel: 0, pendente: 0 };
}

if (diasPassados >= 2) {
resumoPorLoja[trans.lojaId].disponivel += trans.valorCashback;
} else {
resumoPorLoja[trans.lojaId].pendente += trans.valorCashback;
}
});
setSaldos(Object.values(resumoPorLoja));
} catch (e) { console.error(e); }
setCarregando(false);
};

return (

<div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
<h1>Área do Cliente</h1>
<div style={{ marginBottom: '20px' }}>
<input type="text" placeholder="Telemóvel do Cliente" value={clienteId} onChange={(e) => setClienteId(e.target.value)} style={{ padding: '10px', width: '200px' }} />
<button onClick={verificarSaldo} style={{ padding: '10px', marginLeft: '10px' }}>Ver Saldo</button>
</div>

{carregando ? <p>A calcular saldos...</p> : (

<table style={{ width: '100%', borderCollapse: 'collapse' }}>
<thead>
<tr style={{ background: '#333', color: 'white' }}>
<th style={{ padding: '10px' }}>Loja</th>
<th style={{ padding: '10px' }}>Saldo Disponível (2+ dias)</th>
<th style={{ padding: '10px' }}>Saldo Pendente</th>
</tr>
</thead>
<tbody>
{saldos.map((s, i) => (
<tr key={i} style={{textAlign: 'center', borderBottom: '1px solid #ddd'}}>
<td style={{ padding: '10px' }}>{s.nomeLoja}</td>
<td style={{ padding: '10px', color: 'green', fontWeight: 'bold' }}>{s.disponivel.toFixed(2)}€</td>
<td style={{ padding: '10px', color: 'orange' }}>{s.pendente.toFixed(2)}€</td>
</tr>
))}
</tbody>
</table>
)}
</div>
);
}

export default Cliente;