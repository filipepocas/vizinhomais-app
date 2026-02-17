import React, { useState } from 'react';
import { db } from './firebase';
import { doc, setDoc } from "firebase/firestore";

function Gestor() {
  const [nif, setNif] = useState('');
  const [nome, setNome] = useState('');
  const [pass, setPass] = useState('');
  const [perc, setPerc] = useState('');

  const criarLoja = async () => {
    if (!nif || !nome || !pass || !perc) return;
    await setDoc(doc(db, "comerciantes", nif), {
      nome, password: pass, percentagem: Number(perc) / 100
    });
    alert("Loja criada com sucesso!");
    setNif(''); setNome(''); setPass(''); setPerc('');
  };

  return (
    <div>
      <h3>Gestão de Lojas</h3>
      <input type="text" placeholder="NIF da Loja" value={nif} onChange={e => setNif(e.target.value)} style={{display: 'block', marginBottom: '10px', width: '100%', padding: '8px'}} />
      <input type="text" placeholder="Nome da Loja" value={nome} onChange={e => setNome(e.target.value)} style={{display: 'block', marginBottom: '10px', width: '100%', padding: '8px'}} />
      <input type="password" placeholder="Password de Acesso" value={pass} onChange={e => setPass(e.target.value)} style={{display: 'block', marginBottom: '10px', width: '100%', padding: '8px'}} />
      <input type="number" placeholder="Percentagem de Cashback (ex: 5)" value={perc} onChange={e => setPerc(e.target.value)} style={{display: 'block', marginBottom: '10px', width: '100%', padding: '8px'}} />
      <button onClick={criarLoja} style={{width: '100%', padding: '10px', background: '#34495e', color: 'white'}}>CADASTRAR LOJA NA REDE</button>
    </div>
  );
}

export default Gestor;