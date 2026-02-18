import React, { useState } from 'react';
import { db } from './firebase';
import { doc, setDoc } from "firebase/firestore";

function AdminPortal({ voltar }) {
  const [f, setF] = useState({ nif: '', nome: '', pass: '', cp: '', morada: '', email: '' });

  const registar = async () => {
    if (!f.nif || !f.nome) return;
    await setDoc(doc(db, "comerciantes", f.nif), { ...f, percentagem: 0.05 });
    alert("Loja Criada!");
  };

  return (
    <div style={{padding: '20px', fontFamily: 'sans-serif'}}>
      <button onClick={voltar}>← Voltar</button>
      <h2>Painel Gestão Admin</h2>
      <div style={{background: '#eee', padding: '20px', borderRadius: '10px'}}>
        <h4>Registar Comerciante</h4>
        <input placeholder="NIF" onChange={e=>setF({...f, nif:e.target.value})} style={iS}/>
        <input placeholder="Nome Loja" onChange={e=>setF({...f, nome:e.target.value})} style={iS}/>
        <input placeholder="Morada" onChange={e=>setF({...f, morada:e.target.value})} style={iS}/>
        <input placeholder="CP" onChange={e=>setF({...f, cp:e.target.value})} style={iS}/>
        <input placeholder="Senha" type="password" onChange={e=>setF({...f, pass:e.target.value})} style={iS}/>
        <button onClick={registar} style={{width:'100%', padding:'10px', background:'#333', color:'white'}}>CRIAR LOJA</button>
      </div>
    </div>
  );
}
const iS = { display: 'block', width: '100%', padding: '10px', marginBottom: '5px' };
export default AdminPortal;