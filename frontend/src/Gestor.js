import React, { useState } from 'react';
import { db } from './firebase';
import { doc, setDoc } from "firebase/firestore";

function Gestor() {
  const [f, setF] = useState({ nif: '', nome: '', pass: '', perc: '' });

  const salvar = async () => {
    if(!f.nif || !f.nome) return;
    await setDoc(doc(db, "comerciantes", f.nif), {
      nome: f.nome, password: f.pass, percentagem: Number(f.perc)/100
    });
    alert("Loja Registada!");
  };

  return (
    <div style={{padding:'10px'}}>
      <h3>Adicionar Loja à Rede</h3>
      <input placeholder="NIF" onChange={e=>setF({...f, nif: e.target.value})} style={{display:'block', marginBottom:'5px'}}/>
      <input placeholder="Nome da Loja" onChange={e=>setF({...f, nome: e.target.value})} style={{display:'block', marginBottom:'5px'}}/>
      <input placeholder="Senha Acesso" type="password" onChange={e=>setF({...f, pass: e.target.value})} style={{display:'block', marginBottom:'5px'}}/>
      <input placeholder="% Cashback (ex: 5)" type="number" onChange={e=>setF({...f, perc: e.target.value})} style={{display:'block', marginBottom:'5px'}}/>
      <button onClick={salvar}>CADASTRAR</button>
    </div>
  );
}

export default Gestor;