import React, { useState, useEffect } from 'react';
import { db } from './firebase';
import { doc, setDoc, increment, collection, addDoc, serverTimestamp, getDoc, query, where, orderBy, getDocs, limit } from "firebase/firestore";
import Cliente from './Cliente';
import Gestor from './Gestor';
import Relatorio from './Relatorio';

function App() {
  // O estado 'userType' define o que a App mostra no início
  const [userType, setUserType] = useState(null); // 'cliente', 'loja', 'admin'
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [nifLogado, setNifLogado] = useState(null);
  const [lojaData, setLojaData] = useState(null);
  const [carregando, setCarregando] = useState(false);

  // Estados do Terminal da Loja
  const [clientId, setClientId] = useState('');
  const [valorFatura, setValorFatura] = useState('');
  const [numFatura, setNumFatura] = useState('');
  const [pinComerciante, setPinComerciante] = useState('');
  const [pinCliente, setPinCliente] = useState(''); 
  const [historico, setHistorico] = useState([]);

  // Login da Loja
  const loginLoja = async (nif, pass) => {
    setCarregando(true);
    try {
      const docSnap = await getDoc(doc(db, "comerciantes", nif));
      if (docSnap.exists() && String(docSnap.data().password) === String(pass)) {
        setLojaData(docSnap.data());
        setNifLogado(nif);
        setIsLoggedIn(true);
      } else { alert("NIF ou Password de Loja incorretos!"); }
    } finally { setCarregando(false); }
  };

  // Lógica de Operação (Terminal)
  const executarOperacao = async (tipo) => {
    if (pinComerciante !== "1234") { alert("PIN Comerciante Inválido"); return; }
    setCarregando(true);
    try {
      const v = Number(valorFatura);
      const valorMov = tipo === 'emissao' ? (v * lojaData.percentagem) : -v;
      
      if (tipo === 'desconto') {
        const clientSnap = await getDoc(doc(db, "clientes", clientId));
        if (!clientSnap.exists() || String(pinCliente) !== String(clientSnap.data().pin)) {
          throw new Error("PIN do Cliente Inválido!");
        }
      }

      const saldoRef = doc(db, "clientes", clientId, "saldos_por_loja", nifLogado);
      await setDoc(saldoRef, { 
        saldoDisponivel: increment(valorMov), 
        nomeLoja: lojaData.nome,
        ultimoMovimento: serverTimestamp() 
      }, { merge: true });

      await addDoc(collection(db, "historico"), {
        clienteId: clientId, lojaId: nifLogado, nomeLoja: lojaData.nome,
        valorVenda: tipo === 'desconto' ? 0 : v,
        valorCashback: valorMov, tipo, fatura: numFatura, data: serverTimestamp()
      });

      alert("Sucesso!");
      setClientId(''); setValorFatura(''); setPinCliente('');
    } catch (e) { alert(e.message); }
    finally { setCarregando(false); }
  };

  // 1. ECRÃ DE SELEÇÃO INICIAL (O que faltava!)
  if (!userType) {
    return (
      <div style={{ padding: '50px', textAlign: 'center', fontFamily: 'sans-serif' }}>
        <h1 style={{ color: '#2c3e50' }}>VizinhoMais</h1>
        <p>Escolha o seu perfil de acesso:</p>
        <button onClick={() => setUserType('cliente')} style={btnStyle}>SOU CLIENTE</button>
        <button onClick={() => setUserType('loja')} style={btnStyle}>SOU COMERCIANTE</button>
        <button onClick={() => setUserType('admin')} style={{ ...btnStyle, background: '#34495e' }}>ADMINISTRAÇÃO</button>
      </div>
    );
  }

  // 2. VISTA DO CLIENTE (Independente)
  if (userType === 'cliente') {
    return (
      <div style={{ padding: '20px' }}>
        <button onClick={() => setUserType(null)}>← Voltar</button>
        <Cliente />
      </div>
    );
  }

  // 3. VISTA DO ADMIN (Independente)
  if (userType === 'admin') {
    return (
      <div style={{ padding: '20px' }}>
        <button onClick={() => setUserType(null)}>← Voltar</button>
        <h2>Área Administrativa</h2>
        <Relatorio />
        <hr />
        <Gestor />
      </div>
    );
  }

  // 4. VISTA DA LOJA (Com Login)
  if (userType === 'loja' && !isLoggedIn) {
    return (
      <div style={{ padding: '50px', textAlign: 'center' }}>
        <button onClick={() => setUserType(null)}>← Voltar</button>
        <h3>Login da Loja</h3>
        <input id="n" type="text" placeholder="NIF da Loja" style={inputStyle} />
        <input id="p" type="password" placeholder="Senha da Loja" style={inputStyle} />
        <button onClick={() => loginLoja(document.getElementById('n').value, document.getElementById('p').value)}>ENTRAR NO TERMINAL</button>
      </div>
    );
  }

  // 5. TERMINAL DA LOJA LOGADA
  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: 'auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <h2>Terminal: {lojaData.nome}</h2>
        <button onClick={() => setIsLoggedIn(false)} style={{ color: 'red' }}>Sair</button>
      </div>
      <div style={{ background: '#f9f9f9', padding: '20px', borderRadius: '10px' }}>
        <input type="password" placeholder="PIN Comerciante" value={pinComerciante} onChange={e => setPinComerciante(e.target.value)} style={inputStyle} />
        <input type="text" placeholder="Telemóvel Cliente" value={clientId} onChange={e => setClientId(e.target.value)} style={inputStyle} />
        <input type="number" placeholder="Valor (€)" value={valorFatura} onChange={e => setValorFatura(e.target.value)} style={inputStyle} />
        <input type="password" placeholder="PIN Secreto do Cliente (para desconto)" value={pinCliente} onChange={e => setPinCliente(e.target.value)} style={{ ...inputStyle, background: '#fff3cd' }} />
        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={() => executarOperacao('emissao')} style={{ flex: 1, padding: '15px', background: 'green', color: 'white' }}>EMITIR</button>
          <button onClick={() => executarOperacao('desconto')} style={{ flex: 1, padding: '15px', background: 'orange', color: 'white' }}>DESCONTAR</button>
        </div>
      </div>
    </div>
  );
}

// Estilos rápidos para o esqueleto não ser confuso
const btnStyle = { display: 'block', width: '200px', margin: '10px auto', padding: '15px', fontSize: '16px', cursor: 'pointer', background: '#3498db', color: 'white', border: 'none', borderRadius: '5px' };
const inputStyle = { display: 'block', width: '100%', padding: '10px', marginBottom: '10px', boxSizing: 'border-box' };

export default App;