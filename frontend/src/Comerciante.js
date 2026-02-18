import React, { useState, useEffect } from 'react';
import { db } from './firebase';
import { doc, setDoc, updateDoc, increment, collection, addDoc, serverTimestamp, getDoc, query, where, getDocs, orderBy } from "firebase/firestore";

function Comerciante({ loja, sair }) {
  const [perc, setPerc] = useState(loja.percentagem * 100);
  const [cid, setCid] = useState(''); 
  const [valor, setValor] = useState('');
  const [docNum, setDocNum] = useState('');
  const [tipo, setTipo] = useState('compra');
  const [historico, setHistorico] = useState([]);

  const carregarHistorico = async () => {
    const q = query(collection(db, "historico"), where("lojaId", "==", loja.id), orderBy("data", "desc"));
    const snap = await getDocs(q);
    setHistorico(snap.docs.map(d => ({ id: d.id, ...d.data() })));
  };

  useEffect(() => { carregarHistorico(); }, []);

  const processar = async () => {
    if (!cid || !valor) return;
    const cSnap = await getDoc(doc(db, "clientes", cid));
    if (!cSnap.exists()) { alert("Cartão/Cliente não encontrado!"); return; }
    
    const v = Number(valor);
    const vCash = tipo === 'compra' ? (v * (perc/100)) : (tipo === 'devolucao' ? -(v * (perc/100)) : -v);

    if (tipo === 'desconto') {
      const sRef = doc(db, "clientes", cid, "saldos_por_loja", loja.id);
      const sSnap = await getDoc(sRef);
      if ((sSnap.data()?.saldoDisponivel || 0) < v) { alert("Saldo insuficiente nesta loja."); return; }
    }

    await setDoc(doc(db, "clientes", cid, "saldos_por_loja", loja.id), { 
      saldoDisponivel: increment(vCash), nomeLoja: loja.nome 
    }, { merge: true });

    await addDoc(collection(db, "historico"), {
      clienteId: cid, clienteCP: cSnap.data().cp, lojaId: loja.id, nomeLoja: loja.nome,
      valorBruto: v, valorCashback: vCash, tipo, fatura: docNum, data: serverTimestamp(),
      disponivelEm: tipo === 'compra' ? Date.now() + 172800000 : Date.now()
    });

    alert("Operação concluída!");
    setValor(''); setDocNum(''); carregarHistorico();
  };

  return (
    <div style={{padding: '20px', fontFamily: 'sans-serif'}}>
      <div style={{display:'flex', justifyContent:'space-between', marginBottom:'20px'}}>
        <h3>Loja: {loja.nome}</h3>
        <button onClick={sair}>Sair</button>
      </div>
      
      <div style={sectionBox}>
        <p>Configuração de Cashback: <strong>{perc}%</strong></p>
        <input type="number" value={perc} onChange={e=>setPerc(e.target.value)} style={{width: '60px'}}/>
        <button onClick={async() => await updateDoc(doc(db,"comerciantes",loja.id), {percentagem: perc/100})}>Salvar %</button>
      </div>

      <div style={sectionBox}>
        <h4>Novo Movimento</h4>
        <input placeholder="Nº Cartão / Telemóvel" value={cid} onChange={e=>setCid(e.target.value)} style={inS}/>
        <input placeholder="Valor Documento (€)" type="number" value={valor} onChange={e=>setValor(e.target.value)} style={inS}/>
        <input placeholder="Fatura / Nota Crédito" value={docNum} onChange={e=>setDocNum(e.target.value)} style={inS}/>
        <select value={tipo} onChange={e=>setTipo(e.target.value)} style={inS}>
          <option value="compra">Venda (Gera Cashback)</option>
          <option value="devolucao">Devolução (Anula Cashback)</option>
          <option value="desconto">Uso de Saldo (Desconto)</option>
        </select>
        <button onClick={processar} style={btnExec}>EXECUTAR</button>
      </div>

      <h4>Histórico da Loja</h4>
      <div style={{overflowX: 'auto'}}>
        <table style={tabS}>
          <thead><tr style={{background:'#eee'}}><th>Data</th><th>Cliente</th><th>Valor</th><th>Cashback</th></tr></thead>
          <tbody>
            {historico.map(h => (
              <tr key={h.id}>
                <td>{h.data?.toDate().toLocaleDateString()}</td>
                <td>{h.clienteId}</td>
                <td>{h.valorBruto}€</td>
                <td style={{color: h.valorCashback > 0 ? 'green' : 'red'}}>{h.valorCashback.toFixed(2)}€</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const sectionBox = { background: '#f8f9fa', padding: '15px', borderRadius: '8px', marginBottom: '15px', border: '1px solid #ddd' };
const inS = { display: 'block', width: '100%', padding: '10px', marginBottom: '8px', boxSizing: 'border-box' };
const btnExec = { width: '100%', padding: '15px', background: '#27ae60', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold' };
const tabS = { width: '100%', borderCollapse: 'collapse', fontSize: '12px' };

export default Comerciante;