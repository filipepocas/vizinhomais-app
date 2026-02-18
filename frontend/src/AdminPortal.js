import React, { useState } from 'react';
import { db } from './firebase';
import { doc, setDoc, collection, getDocs } from "firebase/firestore";

function AdminPortal({ voltar }) {
  const [f, setF] = useState({ nif: '', nome: '', pass: '', tel: '', cp: '', morada: '' });

  const registarLoja = async () => {
    await setDoc(doc(db, "comerciantes", f.nif), { ...f, percentagem: 0.05 });
    alert("Comerciante registado com sucesso!");
  };

  return (
    <div style={{padding:'20px', fontFamily:'sans-serif'}}>
      <button onClick={voltar}>← Voltar à Home</button>
      <h2>Painel de Administração</h2>
      
      <div style={{background:'#f9f9f9', padding:'20px', borderRadius:'10px'}}>
        <h4>Registar Novo Comerciante</h4>
        <input placeholder="NIF" onChange={e=>setF({...f, nif:e.target.value})} style={inputStyle}/>
        <input placeholder="Nome da Loja" onChange={e=>setF({...f, nome:e.target.value})} style={inputStyle}/>
        <input placeholder="Morada" onChange={e=>setF({...f, morada:e.target.value})} style={inputStyle}/>
        <input placeholder="Código Postal" onChange={e=>setF({...f, cp:e.target.value})} style={inputStyle}/>
        <input placeholder="Telefone" onChange={e=>setF({...f, tel:e.target.value})} style={inputStyle}/>
        <input placeholder="Password de Acesso" type="password" onChange={e=>setF({...f, pass:e.target.value})} style={inputStyle}/>
        <button onClick={registarLoja} style={{...btnStyle, background:'#2c3e50'}}>CRIAR CONTA LOJA</button>
      </div>
    </div>
  );
}

const btnStyle = { width: '100%', padding: '15px', color: 'white', border: 'none', borderRadius: '5px' };
const inputStyle = { display: 'block', width: '100%', padding: '10px', marginBottom: '10px', boxSizing: 'border-box' };

export default AdminPortal;