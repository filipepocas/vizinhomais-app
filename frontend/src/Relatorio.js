import React, { useState, useEffect } from 'react';
import { db } from './firebase';
import { collection, query, where, getDocs } from "firebase/firestore";

function Relatorio() {
const [resumo, setResumo] = useState({ emitido: 0, utilizado: 0 });
const LOJA_ID = "Padaria_Central";

const gerarRelatorio = async () => {
try {
const q = query(collection(db, "historico"), where("lojaId", "==", LOJA_ID));
const snap = await getDocs(q);
let totalEmitido = 0;
let totalUtilizado = 0;

snap.forEach((doc) => {
const data = doc.data();
if (data.tipo === "emissao") totalEmitido += data.valorCashback;
if (data.tipo === "utilizacao") totalUtilizado += Math.abs(data.valorCashback);
});

setResumo({ emitido: totalEmitido, utilizado: totalUtilizado });
} catch (e) { console.error(e); }
};

useEffect(() => { gerarRelatorio(); }, []);

return (

<div style={{ padding: '20px', fontFamily: 'sans-serif', textAlign: 'center' }}>
<h1>Relatório de Movimentos</h1>
<p style={{fontSize: '18px'}}>Loja: <strong>{LOJA_ID.replace('_', ' ')}</strong></p>
<button onClick={gerarRelatorio} style={{ padding: '10px', marginTop: '10px' }}>Atualizar Relatório</button>

<div style={{ display: 'flex', justifyContent: 'center', marginTop: '30px', gap: '20px' }}>
<div style={{ border: '2px solid green', borderRadius: '10px', padding: '20px', width: '200px' }}>
<h3>Total Emitido</h3>
<p style={{ fontSize: '28px', color: 'green', fontWeight: 'bold' }}>{resumo.emitido.toFixed(2)}€</p>
</div>
<div style={{ border: '2px solid orange', borderRadius: '10px', padding: '20px', width: '200px' }}>
<h3>Total Utilizado</h3>
<p style={{ fontSize: '28px', color: 'orange', fontWeight: 'bold' }}>{resumo.utilizado.toFixed(2)}€</p>
</div>
</div>
</div>
);
}

export default Relatorio;