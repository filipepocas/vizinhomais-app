import React, { useState } from 'react';
import { db } from './firebase';
import { doc, setDoc, updateDoc, increment, collection, addDoc, serverTimestamp, getDoc } from "firebase/firestore";

function Comerciante({ loja, sair }) {
  const [perc, setPerc] = useState(loja.percentagem * 100);
  const [cid, setCid] = useState(''); 
  const [valor, setValor] = useState('');
  const [docNum, setDocNum] = useState('');
  const [tipo, setTipo] = useState('compra');

  const processar = async () => {
    if (!cid || !valor) return;
    const cSnap = await getDoc(doc(db, "clientes", cid));
    if (!cSnap.exists()) { alert("Cliente não registado!"); return; }
    
    const v = Number(valor);
    const vCash = tipo === 'compra' ? (v * (perc/100)) : (tipo === 'devolucao' ? -(v * (perc/100)) : -v);

    if (tipo === 'desconto') {
      const sRef = doc(db, "clientes", cid, "saldos_por_loja", loja.nif);
      const sSnap = await getDoc(sRef);
      if ((sSnap.data()?.saldoDisponivel || 0) < v) { alert("Saldo insuficiente."); return; }
    }

    const sRef = doc(db, "clientes", cid, "saldos_por_loja", loja.nif);
    await setDoc(sRef, { saldoDisponivel: increment(vCash), nomeLoja: loja.nome }, { merge: true });

    await addDoc(collection(db, "historico"), {
      clienteId: cid, clienteCP: cSnap.data().cp, lojaId: loja.nif, nomeLoja: loja.nome,
      valorBruto: v, valorCashback: vCash, tipo, fatura: docNum, data: serverTimestamp(),
      disponivelEm: tipo === 'compra' ? Date.now() + (172800000) : Date.now()
    });

    alert("Sucesso!");
    setValor(''); setDocNum('');
  };

  return (
    <div style={{padding: '20px', fontFamily: 'sans-serif'}}>
      <div style={{display:'flex', justifyContent:'space-between'}}>
        <h2>Loja: {loja.nome}</h2>
        <button onClick={sair}>Sair</button>
      </div>
      <div style={{background: '#f1f1f1', padding: '10px', borderRadius: '8px', marginBottom: '15px'}}>
        Cashback: <input type="number" value={perc} onChange={e=>setPerc(e.target.value)} style={{width:'50px'}}/> %
        <button onClick={async()=>await updateDoc(doc(db,"comerciantes",loja.nif),{percentagem:perc/100})}>Atualizar %</button>
      </div>
      <input placeholder="Ler Cartão / Telemóvel" value={cid} onChange={e=>setCid(e.target.value)} style={inS}/>
      <input placeholder="Valor Documento €" type="number" value={valor} onChange={e=>setValor(e.target.value)} style={inS}/>
      <input placeholder="Nº Fatura / NC" value={docNum} onChange={e=>setDocNum(e.target.value)} style={inS}/>
      <select value={tipo} onChange={e=>setTipo(e.target.value)} style={inS}>
        <option value="compra">Venda (Gera Cashback)</option>
        <option value="devolucao">Devolução (Retira Cashback)</option>
        <option value="desconto">Usar Saldo (Desconto)</option>
      </select>
      <button onClick={processar} style={{width:'100%', padding:'15px', background:'green', color:'white', border:'none', borderRadius:'8px'}}>EXECUTAR</button>
    </div>
  );
}
const inS = { display: 'block', width: '100%', padding: '12px', marginBottom: '10px', boxSizing: 'border-box' };
export default Comerciante;