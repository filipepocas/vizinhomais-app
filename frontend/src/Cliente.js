import React, { useState } from 'react';
import { db } from './firebase';
import { collection, getDocs, query, where, orderBy } from "firebase/firestore";

function Cliente() {
  const [telemovel, setTelemovel] = useState('');
  const [saldos, setSaldos] = useState([]);
  const [historico, setHistorico] = useState([]);
  const [carregando, setCarregando] = useState(false);

  const consultarDados = async () => {
    if (!telemovel) { alert("Introduza o seu número!"); return; }
    setCarregando(true);
    try {
      // 1. Procurar saldos por loja
      const saldosRef = collection(db, "clientes", telemovel, "saldos_por_loja");
      const saldosSnap = await getDocs(saldosRef);
      const listaSaldos = [];
      saldosSnap.forEach(doc => listaSaldos.push({ id: doc.id, ...doc.data() }));
      setSaldos(listaSaldos);

      // 2. Procurar histórico de transações
      const histRef = collection(db, "historico");
      const q = query(histRef, where("clienteId", "==", telemovel), orderBy("data", "desc"));
      const histSnap = await getDocs(q);
      const listaHist = [];
      histSnap.forEach(doc => listaHist.push(doc.data()));
      setHistorico(listaHist);

    } catch (e) {
      console.error(e);
      alert("Erro ao consultar. Verifique se o telemóvel está correto.");
    }
    setCarregando(false);
  };

  return (
    <div style={{ fontFamily: 'sans-serif' }}>
      <h2>📱 Área do Cliente</h2>
      
      <div style={{ marginBottom: '20px' }}>
        <input 
          type="text" 
          placeholder="O seu telemóvel" 
          value={telemovel} 
          onChange={(e) => setTelemovel(e.target.value)} 
          style={{ width: '100%', padding: '10px', marginBottom: '10px' }}
        />
        <button 
          onClick={consultarDados} 
          disabled={carregando}
          style={{ width: '100%', padding: '10px', background: '#27ae60', color: 'white', border: 'none', fontWeight: 'bold' }}
        >
          {carregando ? "A CONSULTAR..." : "VER MEU SALDO"}
        </button>
      </div>

      {saldos.length > 0 && (
        <div style={{ background: '#f9f9f9', padding: '15px', borderRadius: '5px', marginBottom: '20px' }}>
          <h3>💰 Saldos por Loja</h3>
          {saldos.map((s, i) => (
            <p key={i} style={{ borderBottom: '1px solid #ddd', padding: '5px 0' }}>
              <strong>{s.nomeLoja}:</strong> {s.saldoDisponivel.toFixed(2)}€
            </p>
          ))}
        </div>
      )}

      {historico.length > 0 && (
        <div>
          <h3>📜 Histórico Recente</h3>
          {historico.map((h, i) => (
            <div key={i} style={{ fontSize: '13px', borderBottom: '1px solid #eee', marginBottom: '5px' }}>
              <span>{h.tipo === 'emissao' ? '✅' : '🟠'} {h.valorCashback.toFixed(2)}€</span>
              <span style={{ color: 'gray', marginLeft: '10px' }}>em {h.nomeLoja}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Cliente;