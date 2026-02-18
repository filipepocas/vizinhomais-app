import React, { useState } from 'react';
import { db } from './firebase';
import { collection, getDocs, query, where, doc, getDoc, setDoc, updateDoc } from "firebase/firestore";

function Cliente() {
  const [tel, setTel] = useState('');
  const [saldos, setSaldos] = useState([]);
  const [perfil, setPerfil] = useState(null);
  const [novoPin, setNovoPin] = useState('');

  const consultar = async () => {
    const cRef = doc(db, "clientes", tel);
    const cSnap = await getDoc(cRef);
    if (!cSnap.exists()) { await setDoc(cRef, { pin: "0000" }); setPerfil({pin:"0000"}); }
    else { setPerfil(cSnap.data()); }

    const hSnap = await getDocs(query(collection(db, "historico"), where("clienteId", "==", tel)));
    const agora = Date.now();
    let mapa = {};

    hSnap.forEach(d => {
      const m = d.data();
      if (!mapa[m.lojaId]) mapa[m.lojaId] = { nome: m.nomeLoja, disponivel: 0, pendente: 0 };
      if (m.tipo === 'emissao') {
        if (m.disponivelEm <= agora) mapa[m.lojaId].disponivel += m.valorCashback;
        else mapa[m.lojaId].pendente += m.valorCashback;
      } else {
        mapa[m.lojaId].disponivel -= Math.abs(m.valorCashback);
      }
    });
    setSaldos(Object.entries(mapa));
  };

  return (
    <div style={{fontFamily:'sans-serif'}}>
      <h2>A Minha Carteira VizinhoMais</h2>
      <input type="text" placeholder="Telemóvel" value={tel} onChange={e=>setTel(e.target.value)} style={{padding:'10px'}}/>
      <button onClick={consultar} style={{padding:'10px', marginLeft:'5px'}}>ENTRAR</button>

      {perfil && (
        <div style={{marginTop:'20px', padding:'15px', background:'#eee'}}>
          <p>O seu PIN atual: <strong>{perfil.pin}</strong></p>
          <input type="password" placeholder="Novo PIN" value={novoPin} onChange={e=>setNovoPin(e.target.value)} maxLength={4}/>
          <button onClick={async ()=>{await updateDoc(doc(db,"clientes",tel),{pin:novoPin}); alert("PIN alterado!");}}>Mudar PIN</button>
        </div>
      )}

      <h3>Os Meus Saldos (Por Loja):</h3>
      {saldos.map(([id, info]) => (
        <div key={id} style={{border:'1px solid #ddd', padding:'15px', margin:'10px 0', borderRadius:'10px'}}>
          <h4>{info.nome}</h4>
          <p>Disponível para uso: <strong style={{color:'green'}}>{info.disponivel.toFixed(2)}€</strong></p>
          {info.pendente > 0 && <p style={{color:'orange', fontSize:'12px'}}>Pendente (Carência 2 dias): {info.pendente.toFixed(2)}€</p>}
        </div>
      ))}
    </div>
  );
}

export default Cliente;