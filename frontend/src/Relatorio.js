import React, { useState, useEffect } from 'react';
import { db } from './firebase';
import { collection, getDocs } from "firebase/firestore";

function Relatorio() {
  const [metricas, setMetricas] = useState({ totalVendas: 0, totalCashback: 0, totalTransacoes: 0 });
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    const calcularDados = async () => {
      try {
        const snap = await getDocs(collection(db, "historico"));
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
      } catch (e) { console.error(e); }
      setCarregando(false);
    };
    calcularDados();
  }, []);

  if (carregando) return <p>A carregar relatórios...</p>;

  return (
    <div style={{ fontFamily: 'sans-serif' }}>
      <h2>📊 Relatório Geral do Sistema</h2>
      
      <div style={{ border: '1px solid #ccc', padding: '10px', marginBottom: '10px' }}>
        <p><strong>Total de Vendas Processadas:</strong> {metricas.totalVendas.toFixed(2)}€</p>
      </div>

      <div style={{ border: '1px solid #ccc', padding: '10px', marginBottom: '10px' }}>
        <p><strong>Total de Cashback Gerado:</strong> {metricas.totalCashback.toFixed(2)}€</p>
      </div>

      <div style={{ border: '1px solid #ccc', padding: '10px', marginBottom: '10px' }}>
        <p><strong>Nº de Transações:</strong> {metricas.totalTransacoes}</p>
      </div>

      <p style={{ fontSize: '12px', color: 'gray' }}>* Estes valores refletem a soma de todas as lojas registadas.</p>
    </div>
  );
}

export default Relatorio;