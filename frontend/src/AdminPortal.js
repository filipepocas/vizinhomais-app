import React, { useState, useEffect } from 'react';
import { db } from './firebase';
import { doc, setDoc, getDoc, collection, getDocs, query, orderBy } from "firebase/firestore";

function AdminPortal({ voltar }) {
  const [f, setF] = useState({ idUnico: '', nif: '', nome: '', pass: '', cp: '', tel: '' });
  const [historico, setHistorico] = useState([]);
  const [filtro, setFiltro] = useState('');

  const carregarDados = async () => {
    const q = query(collection(db, "historico"), orderBy("data", "desc"));
    const snap = await getDocs(q);
    setHistorico(snap.docs.map(d => ({ id: d.id, ...d.data() })));
  };

  useEffect(() => { carregarDados(); }, []);

  const registarLoja = async () => {
    if (!f.idUnico || !f.nif) { alert("Preencha ID e NIF!"); return; }
    const check = await getDoc(doc(db, "comerciantes", f.idUnico));
    if (check.exists()) { alert("Este ID Único já existe!"); return; }
    
    await setDoc(doc(db, "comerciantes", f.idUnico), { ...f, percentagem: 0.05, precisaTrocarSenha: false });
    alert("Loja Criada!");
    setF({ idUnico: '', nif: '', nome: '', pass: '', cp: '', tel: '' });
  };

  const listaFiltrada = historico.filter(h => h.clienteCP?.includes(filtro) || h.nomeLoja?.toLowerCase().includes(filtro.toLowerCase()));

  return (
    <div style={{padding: '20px', fontFamily: 'sans-serif'}}>
      <button onClick={voltar}>← Sair do Admin</button>
      <h2>Gestão Estratégica</h2>

      <div style={adminBox}>
        <h4>Registar Novo Comerciante</h4>
        <input placeholder="ID Único Login (ex: lojafilipe)" value={f.idUnico} onChange={e=>setF({...f, idUnico:e.target.value})} style={inS}/>
        <input placeholder="NIF da Empresa" value={f.nif} onChange={e=>setF({...f, nif:e.target.value})} style={inS}/>
        <input placeholder="Nome da Loja" value={f.nome} onChange={e=>setF({...f, nome:e.target.value})} style={inS}/>
        <input placeholder="CP Loja" value={f.cp} onChange={e=>setF({...f, cp:e.target.value})} style={inS}/>
        <input placeholder="Telefone" value={f.tel} onChange={e=>setF({...f, tel:e.target.value})} style={inS}/>
        <input placeholder="Senha Inicial" type="password" value={f.pass} onChange={e=>setF({...f, pass:e.target.value})} style={inS}/>
        <button onClick={registarLoja} style={btnAdmin}>CRIAR CONTA</button>
      </div>

      <h4>Auditoria de Movimentos</h4>
      <input placeholder="Filtrar por CP Cliente ou Nome Loja..." onChange={e=>setFiltro(e.target.value)} style={inS}/>
      <table style={{width: '100%', fontSize: '12px', borderCollapse: 'collapse'}}>
        <thead style={{background: '#333', color: 'white'}}>
          <tr><th>Data</th><th>Loja</th><th>CP Cliente</th><th>Cashback</th></tr>
        </thead>
        <tbody>
          {listaFiltrada.map(h => (
            <tr key={h.id} style={{borderBottom: '1px solid #ccc'}}>
              <td>{h.data?.toDate().toLocaleDateString()}</td>
              <td>{h.nomeLoja}</td>
              <td>{h.clienteCP}</td>
              <td style={{color: h.valorCashback > 0 ? 'green' : 'red'}}>{h.valorCashback.toFixed(2)}€</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const adminBox = { background: '#f0f2f5', padding: '15px', borderRadius: '10px', marginBottom: '20px' };
const inS = { display: 'block', width: '100%', padding: '10px', marginBottom: '5px', boxSizing: 'border-box' };
const btnAdmin = { width: '100%', padding: '12px', background: '#34495e', color: 'white', border: 'none', borderRadius: '5px' };

export default AdminPortal;