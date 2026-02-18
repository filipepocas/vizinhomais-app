import React, { useState, useEffect } from 'react';
import { db } from './firebase';
import { collection, getDocs } from "firebase/firestore";

function Relatorio() {
  const [totaisGerais, setTotaisGerais] = useState({ emissao: 0, desconto: 0 });
  const [dadosLojas, setDadosLojas] = useState([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    const calcularFinanceiro = async () => {
      setCarregando(true);
      try {
        const snap = await getDocs(collection(db, "historico"));
        const lojasMap = {};
        let totalE = 0;
        let totalD = 0;

        snap.forEach(doc => {
          const mov = doc.data();
          const idLoja = mov.lojaId;
          const nomeLoja = mov.nomeLoja || idLoja;

          if (!lojasMap[idLoja]) {
            lojasMap[idLoja] = { nome: nomeLoja, emitido: 0, descontado: 0 };
          }

          const valor = Math.abs(mov.valorCashback);
          if (mov.tipo === 'emissao') {
            lojasMap[idLoja].emitido += valor;
            totalE += valor;
          } else if (mov.tipo === 'desconto') {
            lojasMap[idLoja].descontado += valor;
            totalD += valor;
          }
        });

        setTotaisGerais({ emissao: totalE, desconto: totalD });
        setDadosLojas(Object.values(lojasMap));
      } catch (e) {
        console.error("Erro ao processar relatórios:", e);
      }
      setCarregando(false);
    };

    calcularFinanceiro();
  }, []);

  if (carregando) return <p>A gerar balanço da rede...</p>;

  return (
    <div style={{ fontFamily: 'sans-serif' }}>
      <h3>Balanço Financeiro da Rede</h3>

      {/* Cartões de Resumo */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
        <div style={{ flex: 1, background: '#2ecc71', color: 'white', padding: '15px', borderRadius: '8px' }}>
          <small>Total Emitido</small>
          <div style={{ fontSize: '20px', fontWeight: 'bold' }}>{totaisGerais.emissao.toFixed(2)}€</div>
        </div>
        <div style={{ flex: 1, background: '#e67e22', color: 'white', padding: '15px', borderRadius: '8px' }}>
          <small>Total Descontado</small>
          <div style={{ fontSize: '20px', fontWeight: 'bold' }}>{totaisGerais.desconto.toFixed(2)}€</div>
        </div>
      </div>

      {/* Tabela de Detalhe por Loja */}
      <div style={{ background: 'white', border: '1px solid #ddd', borderRadius: '8px', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead style={{ background: '#f4f4f4' }}>
            <tr>
              <th style={{ padding: '10px', borderBottom: '1px solid #ddd' }}>Loja</th>
              <th style={{ padding: '10px', borderBottom: '1px solid #ddd' }}>Emitiu</th>
              <th style={{ padding: '10px', borderBottom: '1px solid #ddd' }}>Descontou</th>
              <th style={{ padding: '10px', borderBottom: '1px solid #ddd' }}>Balanço</th>
            </tr>
          </thead>
          <tbody>
            {dadosLojas.map((loja, i) => {
              const balanco = loja.descontado - loja.emitido;
              return (
                <tr key={i}>
                  <td style={{ padding: '10px', borderBottom: '1px solid #eee' }}>{loja.nome}</td>
                  <td style={{ padding: '10px', borderBottom: '1px solid #eee', color: 'green' }}>{loja.emitido.toFixed(2)}€</td>
                  <td style={{ padding: '10px', borderBottom: '1px solid #eee', color: 'orange' }}>{loja.descontado.toFixed(2)}€</td>
                  <td style={{ 
                    padding: '10px', 
                    borderBottom: '1px solid #eee', 
                    fontWeight: 'bold',
                    color: balanco >= 0 ? '#27ae60' : '#c0392b' 
                  }}>
                    {balanco.toFixed(2)}€
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      
      <p style={{ fontSize: '12px', marginTop: '10px', color: '#666' }}>
        * Balanço Positivo: A loja recebeu mais descontos do que emitiu (deve compensar a rede).<br/>
        * Balanço Negativo: A loja emitiu mais do que recebeu (a rede deve à loja).
      </p>
    </div>
  );
}

export default Relatorio;