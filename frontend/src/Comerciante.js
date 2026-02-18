import React, { useState, useEffect } from 'react';
import { db } from './firebase';
import { doc, setDoc, updateDoc, increment, collection, addDoc, serverTimestamp, query, where, getDocs, getDoc } from "firebase/firestore";

function Comerciante({ loja, sair }) {
  const [perc, setPerc] = useState(loja.percentagem * 100);
  const [cid, setCid] = useState(''); // ID do Cliente (Telemóvel ou Cartão)
  const [valor, setValor] = useState('');
  const [docNum, setDocNum] = useState('');
  const [tipoOp, setTipoOp] = useState('compra'); // compra, devolucao, desconto
  const [historico, setHistorico] = useState([]);

  // Atualizar Percentagem da Loja
  const salvarConfig = async () => {
    await updateDoc(doc(db, "comerciantes", loja.nif), { percentagem: Number(perc)/100 });
    alert("Configuração guardada!");
  };

  const executar = async () => {
    if (!cid || !valor) { alert("Preencha os dados do cliente e valor."); return; }
    try {
      const v = Number(valor);
      let valorCashback = 0;
      
      // Obter dados do cliente para o histórico (CP e Nome)
      const cSnap = await getDoc(doc(db, "clientes", cid));
      if (!cSnap.exists()) { alert("Cliente não encontrado!"); return; }
      const cData = cSnap.data();

      if (tipoOp === 'compra') valorCashback = v * (Number(perc)/100);
      if (tipoOp === 'devolucao') valorCashback = -(v * (Number(perc)/100));
      if (tipoOp === 'desconto') {
        valorCashback = -v;
        // Validar se tem saldo nesta loja
        const sRef = doc(db, "clientes", cid, "saldos_por_loja", loja.nif);
        const sSnap = await getDoc(sRef);
        if ((sSnap.data()?.saldoDisponivel || 0) < v) { alert("Saldo insuficiente nesta loja."); return; }
      }

      const saldoRef = doc(db, "clientes", cid, "saldos_por_loja", loja.nif);
      await setDoc(saldoRef, { 
        saldoDisponivel: increment(valorCashback), 
        nomeLoja: loja.nome 
      }, { merge: true });

      await addDoc(collection(db, "historico"), {
        clienteId: cid, clienteCP: cData.cp || 'N/D', lojaId: loja.nif,
        valorBruto: v, valorCashback, tipo: tipoOp, fatura: docNum,
        data: serverTimestamp(),
        disponivelEm: tipoOp === 'compra' ? Date.now() + (2 * 24 * 60 * 60 * 1000) : Date.now()
      });

      alert("Operação registada!");
      setValor(''); setDocNum('');
    } catch (e) { alert("Erro na operação."); }
  };

  return (
    <div style={{padding:'20px', fontFamily:'sans-serif'}}>
      <div style={{display:'flex', justifyContent:'space-between'}}>
        <h2>Loja: {loja.nome}</h2>
        <button onClick={sair}>SAIR</button>
      </div>

      <div style={{background:'#ecf0f1', padding:'15px', borderRadius:'8px', marginBottom:'20px'}}>
        <h4>Configuração</h4>
        Cashback Atual: <input type="number" value={perc} onChange={e=>setPerc(e.target.value)} style={{width:'50px'}}/> %
        <button onClick={salvarConfig} style={{marginLeft:'10px'}}>Guardar</button>
      </div>

      <div style={{border:'1px solid #ccc', padding:'15px', borderRadius:'8px'}}>
        <h4>Nova Operação</h4>
        <input placeholder="Nº Cartão / Telemóvel" value={cid} onChange={e=>setCid(e.target.value)} style={inputStyle}/>
        <input placeholder="Valor do Documento (€)" type="number" value={valor} onChange={e=>setValor(e.target.value)} style={inputStyle}/>
        <input placeholder="Nº Fatura / Nota Crédito" value={docNum} onChange={e=>setDocNum(e.target.value)} style={inputStyle}/>
        
        <select value={tipoOp} onChange={e=>setTipoOp(e.target.value)} style={inputStyle}>
          <option value="compra">Emissão Cashback (Compra)</option>
          <option value="devolucao">Retirar Cashback (Devolução)</option>
          <option value="desconto">Utilizar Saldo (Desconto)</option>
        </select>

        <button onClick={executar} style={{...btnStyle, background:'green'}}>PROCESSAR AGORA</button>
      </div>
    </div>
  );
}

const btnStyle = { width: '100%', padding: '15px', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' };
const inputStyle = { display: 'block', width: '100%', padding: '10px', marginBottom: '10px', boxSizing: 'border-box' };

export default Comerciante;