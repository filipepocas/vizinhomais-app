import React, { useState } from 'react';
import { db } from './firebase';
import { collection, getDocs, query, where, orderBy, doc, updateDoc, setDoc, getDoc } from "firebase/firestore";

function Cliente() {
  const [tel, setTel] = useState('');
  const [pinAtual, setPinAtual] = useState('');
  const [saldos, setSaldos] = useState([]);
  const [hist, setHist] = useState([]);
  const [perfil, setPerfil] = useState(null);

  const consultar = async () => {
    if (!tel) return;
    
    // Buscar Perfil do Cliente
    const cSnap = await getDoc(doc(db, "clientes", tel));
    if (cSnap.exists()) {
        setPerfil(cSnap.data());
    } else {
        // Se não existir, cria perfil básico
        await setDoc(doc(db, "clientes", tel), { pin: "0000" });
        setPerfil({ pin: "0000" });
    }

    // Buscar Saldos
    const sSnap = await getDocs(collection(db, "clientes", tel, "saldos_por_loja"));
    setSaldos(sSnap.docs.map(d => ({ id: d.id, ...d.data() })));

    // Buscar Histórico
    const hSnap = await getDocs(query(collection(db, "historico"), where("clienteId", "==", tel), orderBy("data", "desc")));
    setHist(hSnap.docs.map(d => d.data()));
  };

  const atualizarPin = async () => {
    if (!pinAtual || pinAtual.length !== 4) { alert("PIN deve ter 4 dígitos!"); return; }
    await updateDoc(doc(db, "clientes", tel), { pin: pinAtual });
    alert("PIN atualizado!");
  };

  return (
    <div style={{fontFamily: 'sans-serif'}}>
      <h3>Área do Cliente</h3>
      <div style={{marginBottom: '20px', background: '#f0f0f0', padding: '15px', borderRadius: '8px'}}>
        <input type="text" placeholder="Telemóvel" value={tel} onChange={e => setTel(e.target.value)} style={{padding: '10px', width: '60%', marginRight: '10px'}} />
        <button onClick={consultar} style={{padding: '10px', background: '#2c3e50', color: 'white', border: 'none', borderRadius: '4px'}}>CONSULTAR</button>
      </div>

      {perfil && (
        <div style={{border: '1px solid #ccc', padding: '15px', borderRadius: '8px', marginBottom: '20px'}}>
            <h4>Gestão de Segurança</h4>
            <input type="password" placeholder="Novo PIN (4 dígitos)" value={pinAtual} onChange={e => setPinAtual(e.target.value)} style={{padding: '10px', width: '50%'}} maxLength={4} />
            <button onClick={atualizarPin} style={{padding: '10px', marginLeft: '10px', background: '#e67e22', color: 'white', border: 'none'}}>ALTERAR PIN</button>
            <p style={{fontSize: '12px', color: '#7f8c8d'}}>PIN atual no sistema: {perfil.pin}</p>
        </div>
      )}

      <div style={{marginTop: '20px'}}>
        <h4>Saldos por Loja:</h4>
        {saldos.map((s, i) => (
          <div key={i} style={{background: '#d9eaf7', padding: '15px', margin: '5px 0', borderRadius: '8px', display: 'flex', justifyContent: 'space-between'}}>
            <strong>{s.nomeLoja}</strong> 
            <span style={{fontWeight: 'bold', fontSize: '18px', color: '#2980b9'}}>{s.saldoDisponivel.toFixed(2)}€</span>
          </div>
        ))}
        {saldos.length === 0 && <p>Nenhum saldo encontrado.</p>}
      </div>

      <div style={{marginTop: '20px'}}>
        <h4>Últimos Movimentos:</h4>
        {hist.slice(0, 5).map((h, i) => (
          <div key={i} style={{fontSize: '14px', borderBottom: '1px solid #eee', padding: '8px 0'}}>
            {h.tipo === 'emissao' ? '💰' : '🔥'} {h.nomeLoja}: 
            <span style={{fontWeight: 'bold', color: h.tipo === 'emissao' ? 'green' : 'red'}}> {h.valorCashback.toFixed(2)}€</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Cliente;