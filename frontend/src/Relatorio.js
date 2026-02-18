import React, { useState, useEffect } from 'react';
import { db } from './firebase';
import { collection, getDocs } from "firebase/firestore";

function Relatorio() {
  const [dados, setDados] = useState([]);

  useEffect(() => {
    const carregar = async () => {
      const snap = await getDocs(collection(db, "historico"));
      let lojas = {};
      snap.forEach(doc => {
        const m = doc.data();
        if (!lojas[m.lojaId]) lojas[m.lojaId] = { nome: m.nomeLoja, e: 0, d: 0 };
        if (m.tipo === 'emissao') lojas[m.lojaId].e += m.valorCashback;
        else lojas[m.lojaId].d += Math.abs(m.valorCashback);
      });
      setDados(Object.values(lojas));
    };
    carregar();
  }, []);

  return (
    <div>
      <h3>Balanço Geral da Rede</h3>
      <table border="1" width="100%" style={{borderCollapse:'collapse'}}>
        <thead>
          <tr style={{background:'#f4f4f4'}}>
            <th>Loja</th><th>Emitido</th><th>Descontado</th><th>Balanço (Dívida)</th>
          </tr>
        </thead>
        <tbody>
          {dados.map((l, i) => (
            <tr key={i}>
              <td>{l.nome}</td><td>{l.e.toFixed(2)}€</td><td>{l.d.toFixed(2)}€</td>
              <td style={{fontWeight:'bold'}}>{(l.d - l.e).toFixed(2)}€</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default Relatorio;