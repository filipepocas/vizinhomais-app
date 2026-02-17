import React, { useState } from 'react';
import { db } from './firebase';
import { doc, setDoc } from "firebase/firestore";

function Gestor() {
  const [nome, setNome] = useState('');
  const [nif, setNif] = useState('');
  const [password, setPassword] = useState('');
  const [percentagem, setPercentagem] = useState('');
  const [carregando, setCarregando] = useState(false);

  const registarLoja = async () => {
    if (!nome || !nif || !password || !percentagem) {
      alert("Preencha todos os campos!");
      return;
    }
    setCarregando(true);
    try {
      // Regista a loja usando o NIF como ID do documento
      await setDoc(doc(db, "comerciantes", nif), {
        nome: nome,
        nif: nif,
        password: password,
        percentagem: Number(percentagem) / 100, // Converte 10% para 0.1
        dataRegisto: new Date()
      });
      alert("Loja registada com sucesso!");
      setNome(''); setNif(''); setPassword(''); setPercentagem('');
    } catch (e) {
      alert("Erro ao registar: " + e.message);
    }
    setCarregando(false);
  };

  return (
    <div style={{ fontFamily: 'sans-serif' }}>
      <h2>🛠️ Gestão de Lojas (Admin)</h2>
      
      <div style={{ background: '#f4f4f4', padding: '20px', borderRadius: '5px' }}>
        <h3>Adicionar Nova Loja</h3>
        <input type="text" placeholder="Nome da Loja" value={nome} onChange={(e) => setNome(e.target.value)} style={{ width: '100%', padding: '10px', marginBottom: '10px' }} />
        <input type="text" placeholder="NIF da Loja" value={nif} onChange={(e) => setNif(e.target.value)} style={{ width: '100%', padding: '10px', marginBottom: '10px' }} />
        <input type="password" placeholder="Password de Acesso" value={password} onChange={(e) => setPassword(e.target.value)} style={{ width: '100%', padding: '10px', marginBottom: '10px' }} />
        <input type="number" placeholder="Percentagem Cashback (%)" value={percentagem} onChange={(e) => setPercentagem(e.target.value)} style={{ width: '100%', padding: '10px', marginBottom: '10px' }} />
        
        <button onClick={registarLoja} disabled={carregando} style={{ width: '100%', padding: '10px', background: '#3498db', color: 'white', border: 'none', fontWeight: 'bold' }}>
          {carregando ? "A REGISTAR..." : "REGISTAR LOJA"}
        </button>
      </div>
    </div>
  );
}

export default Gestor;