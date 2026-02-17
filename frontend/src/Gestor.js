import React, { useState, useEffect } from 'react';
import { db } from './firebase';
import { collection, doc, setDoc, getDocs } from "firebase/firestore";

function Gestor() {
const [lojas, setLojas] = useState([]);
const [nomeLoja, setNomeLoja] = useState('');
const [nif, setNif] = useState('');
const [percentagem, setPercentagem] = useState(10); // Valor padrão 10%
const [codigoPostal, setCodigoPostal] = useState('');

const carregarLojas = async () => {
const snap = await getDocs(collection(db, "comerciantes"));
const lista = [];
snap.forEach((doc) => lista.push({ id: doc.id, ...doc.data() }));
setLojas(lista);
};

const registarLoja = async () => {
if (!nomeLoja || !nif || !codigoPostal) { alert("Preencha todos os campos!"); return; }
if (percentagem < 1 || percentagem > 50) { alert("O cashback deve ser entre 1% e 50%"); return; }

try {
await setDoc(doc(db, "comerciantes", nif), {
nome: nomeLoja,
nif: nif,
percentagem: Number(percentagem) / 100,
codigoPostal: codigoPostal,
utilizadores: [nif]
});
alert("Loja registada com sucesso!");
carregarLojas();
setNomeLoja(''); setNif(''); setCodigoPostal('');
} catch (e) { console.error(e); }
};

useEffect(() => { carregarLojas(); }, []);

return (

<div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
<h1>Painel Admin - Registo de Comerciantes</h1>
<div style={{ background: '#eee', padding: '20px', borderRadius: '10px', marginBottom: '20px' }}>
<h3>Nova Loja</h3>
<input type="text" placeholder="Nome da Loja" value={nomeLoja} onChange={(e) => setNomeLoja(e.target.value)} style={{marginRight: '10px', padding: '5px'}}/>
<input type="text" placeholder="NIF" value={nif} onChange={(e) => setNif(e.target.value)} style={{marginRight: '10px', padding: '5px'}}/>
<input type="text" placeholder="Código Postal" value={codigoPostal} onChange={(e) => setCodigoPostal(e.target.value)} style={{marginRight: '10px', padding: '5px'}}/>




<label>Percentagem Cashback (1 a 50%): </label>
<input type="number" min="1" max="50" value={percentagem} onChange={(e) => setPercentagem(e.target.value)} style={{padding: '5px', width: '60px'}} /> %
<button onClick={registarLoja} style={{marginLeft: '20px', background: 'blue', color: 'white', padding: '10px', border: 'none', borderRadius: '5px', cursor: 'pointer'}}>Registar Loja</button>
</div>

<h3>Lojas Registadas</h3>
<table style={{ width: '100%', borderCollapse: 'collapse' }}>
<thead>
<tr style={{ background: '#333', color: 'white' }}>
<th style={{ padding: '10px' }}>NIF</th>
<th style={{ padding: '10px' }}>Nome</th>
<th style={{ padding: '10px' }}>CP</th>
<th style={{ padding: '10px' }}>% Cashback</th>
</tr>
</thead>
<tbody>
{lojas.map((l) => (
<tr key={l.id} style={{textAlign: 'center', borderBottom: '1px solid #ddd'}}>
<td style={{ padding: '10px' }}>{l.nif}</td>
<td style={{ padding: '10px' }}>{l.nome}</td>
<td style={{ padding: '10px' }}>{l.codigoPostal}</td>
<td style={{ padding: '10px' }}>{(l.percentagem * 100).toFixed(0)}%</td>
</tr>
))}
</tbody>
</table>
</div>
);
}

export default Gestor;