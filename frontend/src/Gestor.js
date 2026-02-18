import React, { useState } from 'react';
import { db } from './firebase';
import { doc, setDoc } from "firebase/firestore";

function Gestor() {
  const [f, setF] = useState({ nif: '', nome: '', pass: '', perc: '' });

  const salvar = async () => {
    await setDoc(doc(db, "comerciantes", f.nif), {
      nome: f.nome, password: f.pass, percentagem: Number(f.perc)/100
    });
    alert("Loja registada!");
  };

  return (
    <div>
      <h3>Configurar Nova Loja</h3>
      <input type="text" placeholder="NIF" onChange={e=>setF({...f, nif: e.target.value})} style={{display:'block', marginBottom:'5px'}}/>
      <input type="text" placeholder="Nome" onChange={e=>setF({...f, nome: e.target.value})} style={{display:'block', marginBottom:'5px'}}/>
      <input type="password" placeholder="Senha" onChange={e=>setF({...f, pass: e.target.value})} style={{display:'block', marginBottom:'5px'}}/>
      <input type="number" placeholder="% Cashback" onChange={e=>setF({...f, perc: e.target.value})} style={{display:'block', marginBottom:'5px'}}/>
      <button onClick={salvar}>CADASTRAR LOJA</button>
    </div>
  );
}

export default Gestor;