import React, { useState, useEffect } from 'react';
import { db } from './firebase';
import { collection, getDocs, query, where, orderBy } from "firebase/firestore";

function Relatorio() {
  const [metricas, setMetricas] = useState({ totalVendas: 0, totalCashback: 0, totalTransacoes: 0 });
  const [carregando, setCarregando] = useState(false);
  const [lojas, setLojas] = useState([]);
  
  // Estados dos Filtros
  const [filtroLoja, setFiltroLoja] = useState('todas');
  const [dataInicio, setDataInicio] = useState('');
  const [dataFim, setDataFim] = useState('');

  // 1. Busca lista de lojas para o dropdown
  useEffect(() => {
    const buscarLojas = async () => {
      const snap = await getDocs(collection(db, "comerciantes"));
      const lista = [];
      snap.forEach((doc) => lista.push({ id: doc.id, ...doc.data() }));
      setLojas(lista);
    };
    buscarLojas();
  }, []);

  // 2. Calcula métricas baseadas nos filtros
  const calcularRelatorio = async () => {
    setCarregando(true);
    try {
      let q = collection(db, "historico");
      const constraints = [];

      if (filtroLoja !== 'todas') {
        constraints.push(where("lojaId", "==", filtroLoja));
      }
      
      // Nota: Filtros de data exigem índice composto no Firestore
      if (dataInicio) {
        constraints.push(where("data", ">=", new Date(dataInicio)));
      }
      if (dataFim) {
        // Adiciona um dia para incluir o dia final completo
        const dFim = new Date(dataFim);
        dFim.setDate(dFim.getDate() + 1);
        constraints.push(where("data", "<=", dFim));
      }

      const qFinal = query(q, ...constraints);
      const snap = await getDocs(qFinal);
      
      let vendas = 0;
      let cashback = 0;
      let contador = 0;

      snap.forEach((doc) => {
        const d = doc.data();
        vendas += Number(d.valorVenda || 0);
        cashback += Number(d.valorCashback || 0);
        contador++;
      });

      setMetricas({ totalVendas: vendas, totalCashback: cashback, totalTransacoes: contador });
    } catch (e) {
      console.error(e);
      alert("Erro ao gerar relatório. Verifique se criou o índice composto para datas.");
    }
    setCarregando(false);
  };

  return (
    <div style={{ fontFamily: 'sans-serif', padding: '10px' }}>
      <h2>📊 Relatório Avançado</h2>
      
      {/* PAINEL DE FILTROS */}
      <div style={{ background: '#eee', padding: '15px', borderRadius: '5px', marginBottom: '20px' }}>
        <label>Loja:</label><br/>
        <select value={filtroLoja} onChange={(e) => setFiltroLoja(e.target.value)} style={{width: '100%', padding: '8px', marginBottom: '10px'}}>
          <option value="todas">Todas as Lojas</option>
          {lojas.map(loja => (
            <option key={loja.id} value={loja.id}>{loja.nome}</option>
          ))}
        </select>
        
        <label>De:</label>
        <input type="date" value={dataInicio} onChange={(e) => setDataInicio(e.target.value)} style={{width: '100%', padding: '8px', marginBottom: '10px'}} />
        
        <label>Até:</label>
        <input type="date" value={dataFim} onChange={(e) => setDataFim(e.target.value)} style={{width: '100%', padding: '8px', marginBottom: '10px'}} />
        
        <button onClick={calcularRelatorio} disabled={carregando} style={{width: '100%', padding: '10px', background: '#2c3e50', color: 'white', border: 'none', borderRadius: '5px', fontWeight: 'bold'}}>
          {carregando ? "A calcular..." : "GERAR RELATÓRIO"}
        </button>
      </div>

      {/* RESULTADOS */}
      <div style={{ border: '1px solid #ccc', padding: '10px', marginBottom: '10px', borderRadius: '5px' }}>
        <p><strong>Vendas:</strong> {metricas.totalVendas.toFixed(2)}€</p>
      </div>
      <div style={{ border: '1px solid #ccc', padding: '10px', marginBottom: '10px', borderRadius: '5px' }}>
        <p><strong>Cashback Gerado:</strong> {metricas.totalCashback.toFixed(2)}€</p>
      </div>
      <div style={{ border: '1px solid #ccc', padding: '10px', marginBottom: '10px', borderRadius: '5px' }}>
        <p><strong>Transações:</strong> {metricas.totalTransacoes}</p>
      </div>
    </div>
  );
}

export default Relatorio;