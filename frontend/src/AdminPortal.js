import React, { useState, useEffect } from 'react';
import { db } from './firebase';
import { collection, getDocs, query, where, orderBy } from "firebase/firestore";

function AdminPortal({ voltar }) {
  const [historicoTotal, setHistoricoTotal] = useState([]);
  const [filtroCP, setFiltroCP] = useState('');
  const [lojas, setLojas] = useState([]);

  // Carregar dados para o Admin
  useEffect(() => {
    const carregarTudo = async () => {
      const hSnap = await getDocs(query(collection(db, "historico"), orderBy("data", "desc")));
      setHistoricoTotal(hSnap.docs.map(d => ({ id: d.id, ...d.data() })));
      
      const lSnap = await getDocs(collection(db, "comerciantes"));
      setLojas(lSnap.docs.map(d => ({ id: d.id, ...d.data() })));
    };
    carregarTudo();
  }, []);

  const historicoFiltrado = historicoTotal.filter(h => 
    h.clienteCP?.includes(filtroCP) || h.lojaId?.includes(filtroCP)
  );

  return (
    <div style={{padding: '20px', fontFamily: 'sans-serif'}}>
      <button onClick={voltar}>← Sair do Painel</button>
      <h2>Painel de Controlo Central (Admin)</h2>

      {/* Estatísticas Rápidas */}
      <div style={statsContainer}>
        <div style={statBox}>Lojas: {lojas.length}</div>
        <div style={statBox}>Movimentos: {historicoTotal.length}</div>
      </div>

      <div style={{marginTop: '20px'}}>
        <h4>Filtro de Movimentos (CP ou ID Loja)</h4>
        <input 
          placeholder="Pesquisar por Código Postal ou Loja..." 
          value={filtroCP} 
          onChange={e => setFiltroCP(e.target.value)} 
          style={iS}
        />
        
        <table style={tableS}>
          <thead>
            <tr style={{background: '#eee'}}>
              <th>Data</th>
              <th>Loja</th>
              <th>Cliente (CP)</th>
              <th>Valor Bruto</th>
              <th>Cashback</th>
              <th>Doc</th>
            </tr>
          </thead>
          <tbody>
            {historicoFiltrado.map(h => (
              <tr key={h.id}>
                <td>{h.data?.toDate().toLocaleDateString()}</td>
                <td>{h.nomeLoja}</td>
                <td>{h.clienteId} ({h.clienteCP})</td>
                <td>{h.valorBruto}€</td>
                <td style={{color: h.valorCashback > 0 ? 'green' : 'red'}}>
                  {h.valorCashback.toFixed(2)}€
                </td>
                <td>{h.fatura}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const statsContainer = { display: 'flex', gap: '10px', marginBottom: '20px' };
const statBox = { padding: '20px', background: '#2c3e50', color: 'white', borderRadius: '8px', flex: 1, textAlign: 'center' };
const tableS = { width: '100%', borderCollapse: 'collapse', marginTop: '10px', fontSize: '13px' };
const iS = { width: '100%', padding: '12px', boxSizing: 'border-box', marginBottom: '10px' };

export default AdminPortal;