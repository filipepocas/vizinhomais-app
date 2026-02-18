import React, { useState, useEffect } from 'react';
import { db } from './firebase';
import { collection, getDocs, query, where } from "firebase/firestore";

function Relatorio() {
  const [totalEmissao, setTotalEmissao] = useState(0);
  const [totalDesconto, setTotalDesconto] = useState(0);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    const calcularTotais = async () => {
      setCarregando(true);
      try {
        const snap = await getDocs(collection(db, "historico"));
        let emissao = 0;
        let desconto = 0;
        
        snap.forEach(doc => {
          const mov = doc.data();
          if (mov.tipo === 'emissao') {
            emissao += mov.valorCashback;
          } else if (mov.tipo === 'desconto') {
            desconto += Math.abs(mov.valorCashback);
          }
        });
        
        setTotalEmissao(emissao);
        setTotalDesconto(desconto);
      } catch (e) {
        console.error("Erro ao calcular:", e);
      }
      setCarregando(false);
    };
    
    calcularTotais();
  }, []);

  if (carregando) return <p>A carregar dashboard...</p>;

  return (
    <div style={{fontFamily: 'sans-serif'}}>
      <h3>Dashboard Financeiro da Rede VizinhoMais</h3>
      
      <div style={{display: 'flex', gap: '20px', flexWrap: 'wrap'}}>
        <div style={{flex: 1, background: '#d4edda', padding: '20px', borderRadius: '10px', minWidth: '250px'}}>
          <h4 style={{margin: 0, color: '#155724'}}>Total Emitido (Ganhos Clientes)</h4>
          <p style={{fontSize: '32px', fontWeight: 'bold', margin: '10px 0', color: '#155724'}}>{totalEmissao.toFixed(2)}€</p>
        </div>
        
        <div style={{flex: 1, background: '#fff3cd', padding: '20px', borderRadius: '10px', minWidth: '250px'}}>
          <h4 style={{margin: 0, color: '#856404'}}>Total Descontado (Uso Clientes)</h4>
          <p style={{fontSize: '32px', fontWeight: 'bold', margin: '10px 0', color: '#856404'}}>{totalDesconto.toFixed(2)}€</p>
        </div>
      </div>
      
      <div style={{background: '#e2e3e5', padding: '20px', borderRadius: '10px', marginTop: '20px'}}>
        <h4 style={{margin: 0}}>Saldo Total Pendente na Rede</h4>
        <p style={{fontSize: '28px', fontWeight: 'bold', margin: '10px 0'}}>{(totalEmissao - totalDesconto).toFixed(2)}€</p>
        <p style={{fontSize: '14px', color: '#383d41'}}>Este é o valor que os clientes acumularam e ainda não gastaram.</p>
      </div>
    </div>
  );
}

export default Relatorio;