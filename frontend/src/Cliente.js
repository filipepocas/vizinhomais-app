import React, { useState } from 'react';
import { db } from './firebase';
import { collection, getDocs, query, where, doc, getDoc, setDoc, updateDoc } from "firebase/firestore";

function Cliente() {
  const [tel, setTel] = useState('');
  const [saldos, setSaldos] = useState([]);
  const [perfil, setPerfil] = useState(null);
  const [novoPin, setNovoPin] = useState('');

  const entrarOuRegistar = async () => {
    if (!tel || tel.length < 9) { alert("Insira um telemóvel válido."); return; }
    
    try {
      const cRef = doc(db, "clientes", tel);
      const cSnap = await getDoc(cRef);

      if (!cSnap.exists()) {
        if (window.confirm("Telemóvel não encontrado. Deseja criar conta com PIN 0000?")) {
          await setDoc(cRef, { pin: "0000", criadoEm: new Date() });
          alert("Conta criada! O seu PIN inicial é 0000.");
          setPerfil({ pin: "0000" });
        } else return;
      } else {
        setPerfil(cSnap.data());
      }

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
    } catch (e) { alert("Erro ao aceder aos dados."); }
  };

  return (
    <div style={{fontFamily:'sans-serif'}}>
      <h2>Minha Carteira VizinhoMais</h2>
      <input type="text" placeholder="Telemóvel" value={tel} onChange={e=>setTel(e.target.value)} style={{padding:'10px', width:'60%'}}/>
      <button onClick={entrarOuRegistar} style={{padding:'10px'}}>ENTRAR / REGISTAR</button>

      {perfil && (
        <div style={{marginTop:'20px', padding:'15px', background:'#f0f0f0', borderRadius:'8px'}}>
          <p>Seu PIN: <strong>{perfil.pin}</strong> (Use para descontar em loja)</p>
          <input type="password" placeholder="Novo PIN" value={novoPin} onChange={e=>setNovoPin(e.target.value)} maxLength={4} style={{padding:'5px'}}/>
          <button onClick={async ()=>{if(novoPin.length===4){await updateDoc(doc(db,"clientes",tel),{pin:novoPin}); alert("PIN Alterado!");} else alert("PIN deve ter 4 dígitos");}}>Mudar PIN</button>
        </div>
      )}

      <h3>Saldos por Loja:</h3>
      {saldos.map(([id, info]) => (
        <div key={id} style={{border:'1px solid #ddd', padding:'15px', margin:'10px 0', borderRadius:'10px'}}>
          <div style={{display:'flex', justifyContent:'space-between'}}>
            <strong>{info.nome}</strong>
            <span style={{color:'green', fontWeight:'bold'}}>{info.disponivel.toFixed(2)}€</span>
          </div>
          {info.pendente > 0 && <small style={{color:'orange'}}>A libertar em 2 dias: {info.pendente.toFixed(2)}€</small>}
        </div>
      ))}
    </div>
  );
}

export default Cliente;