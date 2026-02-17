import React, { useState, useEffect } from 'react';
import { db } from './firebase';
import { collection, getDocs } from "firebase/firestore";

function Relatorio() {
  const [totalEmissao, setTotalEmissao] = useState(0);
  const [totalDesconto, setTotalDesconto] = useState(0);

  useEffect(() => {
    const carregar = async () => {
      const snap = await getDocs(collection(db, "historico"));
      let e = 0, d = 0;
      snap.forEach(doc => {
        const data = doc.data();
        if (data.tipo === 'emissao') e += data.valorCashback;
        if (data.tipo === 'desconto') d += Math.abs(data.valorCashback);
      });
      setTotalEmissao(e);
      setTotalDesconto(d);
    };
    carregar();
  }, []);

  return (
    <div>
      <h3>Resumo da Rede VizinhoMais</h3>
      <div style={{display: 'flex', gap: '20px'}}>
        <div style={{flex: 1, background: '#d4edda', padding: '20px', borderRadius: '10px'}}>
          <h4>Total Emitido</h4>
          <p style={{fontSize: '24px', fontWeight: 'bold'}}>{totalEmissao.toFixed(2)}€</p>
        </div>
        <div style={{flex: 1, background: '#f8d7da', padding: '20px', borderRadius: '10px'}}>
          <h4>Total Descontado</h4>
          <p style={{fontSize: '24px', fontWeight: 'bold'}}>{totalDesconto.toFixed(2)}€</p>
        </div>
      </div>
      <p style={{marginTop: '20px'}}>Saldo Pendente na Rede: {(totalEmissao - totalDesconto).toFixed(2)}€</p>
    </div>
  );
}

export default Relatorio;