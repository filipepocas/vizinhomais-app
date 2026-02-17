import React, { useState, useEffect } from 'react';
import { db } from './firebase';
import { collection, query, getDocs, orderBy, doc, setDoc, increment, addDoc, serverTimestamp } from "firebase/firestore";

function Cliente() {
const [id, setId] = useState(localStorage.getItem('clienteId') || '');
const [saldos, setSaldos] = useState([]);
const [historico, setHistorico] = useState([]);
const [valorDesconto, setValorDesconto] = useState('');
const [pinCliente, setPinCliente] = useState('');

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
if (pinCliente !== "9999") { alert("PIN de Cliente incorreto! (Teste: 9999)"); return; }

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

alert("Sucesso! Desconto de " + valor + "€ aplicado.");
setValorDesconto('');
setPinCliente('');
consultarDados();
} catch (e) { alert("Erro na operação."); }
};

useEffect(() => { if (id) { consultarDados(); } }, []);

return (

<div style={{ textAlign: 'center', marginTop: '50px', padding: '20px', fontFamily: 'sans-serif' }}>
<h1>O Meu Cartão VizinhoMais</h1>
<input value={id} onChange={(e) => setId(e.target.value)} placeholder="Telemóvel do Cliente" style={{ padding: '10px' }} />
<button onClick={consultarDados} style={{ padding: '10px', marginLeft: '5px' }}>Ver Meus Cartões</button>

<div style={{ marginTop: '30px' }}>
{saldos.length > 0 ? (
saldos.map((s) => (
<div key={s.id} style={{ border: '2px solid #333', borderRadius: '15px', padding: '15px', margin: '15px auto', maxWidth: '300px', backgroundColor: '#fff', boxShadow: '0 4px 8px rgba(0,0,0,0.1)' }}>
<h2 style={{ margin: '0', color: '#333' }}>{s.nomeLoja}</h2>
<p style={{ fontSize: '24px', fontWeight: 'bold', color: 'green' }}>{s.saldoDisponivel.toFixed(2)}€</p>
<input type="number" placeholder="Valor a gastar" onChange={(e) => setValorDesconto(e.target.value)} style={{ width: '90%', padding: '8px', marginBottom: '10px' }} />
<input type="password" placeholder="Teu PIN (9999)" onChange={(e) => setPinCliente(e.target.value)} style={{ width: '90%', padding: '8px', marginBottom: '10px' }} />
<button onClick={() => utilizarSaldo(s.id, s.nomeLoja, s.saldoDisponivel)} style={{ background: '#e67e22', color: 'white', padding: '10px 20px', border: 'none', borderRadius: '5px', fontWeight: 'bold', cursor: 'pointer' }}>Utilizar Saldo Agora</button>
</div>
))
) : (
<p style={{ color: '#666' }}>Ainda não tens saldos nesta loja.</p>
)}
</div>
</div>
);
}

export default Cliente;