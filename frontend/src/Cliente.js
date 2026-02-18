import React, { useState } from 'react';
import { db } from './firebase';
import { doc, getDoc, setDoc, collection, query, where, getDocs } from "firebase/firestore";

function Cliente({ voltar }) {
  const [tel, setTel] = useState('');
  const [perfil, setPerfil] = useState(null);
  const [saldos, setSaldos] = useState([]);
  const [isRegisto, setIsRegisto] = useState(false);
  const [regData, setRegData] = useState({ nome: '', cp: '', email: '' });

  const entrar = async () => {
    const cSnap = await getDoc(doc(db, "clientes", tel));
    if (cSnap.exists()) {
      setPerfil(cSnap.data());
      carregarSaldos();
    } else {
      setIsRegisto(true);
    }
  };

  const registar = async () => {
    await setDoc(doc(db, "clientes", tel), { ...regData, tel, criadoEm: new Date() });
    alert("Conta criada com sucesso!");
    setPerfil({ ...regData, tel });
    carregarSaldos();
  };

  const carregarSaldos = async () => {
    const hSnap = await getDocs(query(collection(db, "historico"), where("clienteId", "==", tel)));
    const agora = Date.now();
    let mapa = {};
    hSnap.forEach(d => {
      const m = d.data();
      if (!mapa[m.lojaId]) mapa[m.lojaId] = { nome: m.nomeLoja, disp: 0, pend: 0 };
      if (m.tipo === 'compra') {
        if (m.disponivelEm <= agora) mapa[m.lojaId].disp += m.valorCashback;
        else mapa[m.lojaId].pend += m.valorCashback;
      } else if (m.tipo === 'devolucao' || m.tipo === 'desconto') {
        mapa[m.lojaId].disp += m.valorCashback;
      }
    });
    setSaldos(Object.entries(mapa));
  };

  if (isRegisto && !perfil) {
    return (
      <div style={{padding:'20px'}}>
        <h3>Criar Conta VizinhoMais</h3>
        <input placeholder="Nome Completo" onChange={e=>setRegData({...regData, nome:e.target.value})} style={inputStyle}/>
        <input placeholder="Código Postal" onChange={e=>setRegData({...regData, cp:e.target.value})} style={inputStyle}/>
        <input placeholder="Email (Opcional)" onChange={e=>setRegData({...regData, email:e.target.value})} style={inputStyle}/>
        <button onClick={registar} style={btnStyle}>CRIAR CARTÃO DIGITAL</button>
      </div>
    );
  }

  if (perfil) {
    return (
      <div style={{padding:'20px', textAlign:'center'}}>
        <button onClick={voltar}>Sair</button>
        <div style={{border:'2px solid #333', padding:'20px', borderRadius:'15px', margin:'20px 0', background:'#fff'}}>
          <h2 style={{margin:0}}>CARTÃO VIZINHO</h2>
          <p>{perfil.nome}</p>
          <div style={{background:'#000', height:'60px', width:'100%', marginTop:'10px'}}></div>
          <small>{tel}</small>
        </div>
        <h4>Saldos por Loja:</h4>
        {saldos.map(([id, info]) => (
          <div key={id} style={{borderBottom:'1px solid #eee', padding:'10px', textAlign:'left'}}>
            <strong>{info.nome}</strong>: <span style={{color:'green'}}>{info.disp.toFixed(2)}€</span>
            {info.pend > 0 && <div style={{fontSize:'11px', color:'orange'}}>Pendente: {info.pend.toFixed(2)}€</div>}
          </div>
        ))}
      </div>
    );
  }

  return (
    <div style={{padding:'20px', textAlign:'center'}}>
      <button onClick={voltar}>← Voltar</button>
      <h3>Entrar na Minha Carteira</h3>
      <input placeholder="Telemóvel" value={tel} onChange={e=>setTel(e.target.value)} style={inputStyle}/>
      <button onClick={entrar} style={btnStyle}>ACEDER</button>
    </div>
  );
}

const btnStyle = { width: '100%', padding: '15px', background: '#3498db', color: 'white', border: 'none', borderRadius: '5px' };
const inputStyle = { display: 'block', width: '100%', padding: '10px', marginBottom: '10px', boxSizing: 'border-box' };

export default Cliente;