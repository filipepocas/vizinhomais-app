import React, { useState } from 'react';
import { db } from './firebase';
import { doc, getDoc, setDoc, collection, query, where, getDocs } from "firebase/firestore";

function Cliente({ voltar }) {
  const [tel, setTel] = useState('');
  const [perfil, setPerfil] = useState(null);
  const [saldos, setSaldos] = useState([]);
  const [isRegisto, setIsRegisto] = useState(false);
  const [regData, setRegData] = useState({ nome: '', cp: '', email: '' });

  const verificarEEntrar = async () => {
    if (!tel) return;
    const cSnap = await getDoc(doc(db, "clientes", tel));
    if (cSnap.exists()) {
      setPerfil(cSnap.data());
      carregarSaldos(tel);
    } else {
      setIsRegisto(true);
    }
  };

  const carregarSaldos = async (clienteId) => {
    const q = query(collection(db, "historico"), where("clienteId", "==", clienteId));
    const snap = await getDocs(q);
    const agora = Date.now();
    let mapa = {};
    snap.forEach(d => {
      const m = d.data();
      if (!mapa[m.lojaId]) mapa[m.lojaId] = { nome: m.nomeLoja, disp: 0, pend: 0 };
      if (m.tipo === 'compra') {
        if (m.disponivelEm <= agora) mapa[m.lojaId].disp += m.valorCashback;
        else mapa[m.lojaId].pend += m.valorCashback;
      } else {
        mapa[m.lojaId].disp += m.valorCashback; // Devoluções/Descontos abatem na hora
      }
    });
    setSaldos(Object.entries(mapa));
  };

  const fazerRegisto = async () => {
    if (!regData.nome || !regData.cp) { alert("Nome e CP obrigatórios."); return; }
    await setDoc(doc(db, "clientes", tel), { ...regData, tel, criadoEm: new Date().toISOString() });
    setPerfil({ ...regData, tel });
  };

  if (perfil) {
    return (
      <div style={{padding: '20px', maxWidth: '400px', margin: 'auto', textAlign: 'center', fontFamily: 'sans-serif'}}>
        <button onClick={voltar}>Sair</button>
        <div style={{background: '#2c3e50', color: 'white', padding: '25px', borderRadius: '20px', margin: '20px 0'}}>
          <h3>CARTÃO VIZINHO</h3>
          <p style={{fontSize: '20px'}}>{perfil.nome}</p>
          <div style={{background: 'white', height: '50px', margin: '15px 0', color: 'black', display: 'flex', alignItems: 'center', justifyContent: 'center', letterSpacing: '4px'}}>|||| || ||||| |||</div>
          <small>{tel}</small>
        </div>
        <h4>Os Meus Saldos (Uso Exclusivo em Loja)</h4>
        {saldos.map(([id, info]) => (
          <div key={id} style={{textAlign: 'left', padding: '10px', borderBottom: '1px solid #eee'}}>
            <strong>{info.nome}</strong>: <span style={{color: 'green'}}>{info.disp.toFixed(2)}€</span>
            {info.pend > 0 && <div style={{fontSize: '11px', color: 'orange'}}>A libertar (2 dias): {info.pend.toFixed(2)}€</div>}
          </div>
        ))}
      </div>
    );
  }

  return (
    <div style={{padding: '40px 20px', textAlign: 'center', fontFamily: 'sans-serif'}}>
      <button onClick={voltar}>← Voltar</button>
      {!isRegisto ? (
        <>
          <h3>Aceder ao Cartão</h3>
          <input placeholder="Telemóvel" value={tel} onChange={e=>setTel(e.target.value)} style={inputS}/>
          <button onClick={verificarEEntrar} style={btnS}>ENTRAR</button>
        </>
      ) : (
        <>
          <h3>Criar Novo Cartão</h3>
          <p>Telemóvel: {tel}</p>
          <input placeholder="Nome Completo" onChange={e=>setRegData({...regData, nome: e.target.value})} style={inputS}/>
          <input placeholder="Código Postal Residência" onChange={e=>setRegData({...regData, cp: e.target.value})} style={inputS}/>
          <input placeholder="Email (Opcional)" onChange={e=>setRegData({...regData, email: e.target.value})} style={inputS}/>
          <button onClick={fazerRegisto} style={{...btnS, background: '#27ae60'}}>CONCLUIR REGISTO</button>
        </>
      )}
    </div>
  );
}

const inputS = { width: '100%', padding: '12px', marginBottom: '10px', boxSizing: 'border-box', borderRadius: '8px', border: '1px solid #ccc' };
const btnS = { width: '100%', padding: '15px', background: '#3498db', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold' };

export default Cliente;