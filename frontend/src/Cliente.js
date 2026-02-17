import React, { useState } from 'react';
import { db } from './firebase';
import { collection, getDocs, query, where, orderBy } from "firebase/firestore";

function Cliente() {
  const [tel, setTel] = useState('');
  const [saldos, setSaldos] = useState([]);
  const [hist, setHist] = useState([]);

  const consultar = async () => {
    if (!tel) return;
    const sSnap = await getDocs(collection(db, "clientes", tel, "saldos_por_loja"));
    setSaldos(sSnap.docs.map(d => ({ id: d.id, ...d.data() })));

    const hSnap = await getDocs(query(collection(db, "historico"), where("clienteId", "==", tel), orderBy("data", "desc")));
    setHist(hSnap.docs.map(d => d.data()));
  };

  return (
    <div>
      <h3>Área do Cliente</h3>
      <input type="text" placeholder="Telemóvel" value={tel} onChange={e => setTel(e.target.value)} style={{padding: '10px', width: '70%'}} />
      <button onClick={consultar} style={{padding: '10px'}}>VER SALDOS</button>

      <div style={{marginTop: '20px'}}>
        <h4>Meus Saldos:</h4>
        {saldos.map((s, i) => (
          <div key={i} style={{background: '#eef', padding: '10px', margin: '5px 0'}}>
            <strong>{s.nomeLoja}:</strong> {s.saldoDisponivel.toFixed(2)}€
          </div>
        ))}
      </div>

      <div style={{marginTop: '20px'}}>
        <h4>Histórico:</h4>
        {hist.map((h, i) => (
          <div key={i} style={{fontSize: '12px', borderBottom: '1px solid #ddd'}}>{h.nomeLoja}: {h.valorCashback.toFixed(2)}€</div>
        ))}
      </div>
    </div>
  );
}

export default Cliente;