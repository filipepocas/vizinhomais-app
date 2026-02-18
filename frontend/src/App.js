import React, { useState } from 'react';
import { db } from './firebase';
import { doc, setDoc, increment, collection, addDoc, serverTimestamp, getDoc } from "firebase/firestore";
import Cliente from './Cliente';
import Gestor from './Gestor';
import Relatorio from './Relatorio';

function App() {
  const [userType, setUserType] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [nifLogado, setNifLogado] = useState(null);
  const [lojaData, setLojaData] = useState(null);

  const loginLoja = async (nif, pass) => {
    if (!nif || !pass) return;
    try {
      const docSnap = await getDoc(doc(db, "comerciantes", nif));
      if (docSnap.exists() && String(docSnap.data().password) === String(pass)) {
        setLojaData({ nif, ...docSnap.data() });
        setNifLogado(nif);
        setIsLoggedIn(true);
      } else { alert("NIF ou Password incorretos."); }
    } catch (e) { alert("Erro no login."); }
  };

  const executarOperacao = async (tipo, clientId, valor, fatura, pinComer, pinCli) => {
    if (pinComer !== "1234") { alert("PIN Comerciante Inválido"); return; }
    if (!clientId || !valor) { alert("Preencha Telemóvel e Valor"); return; }
    
    try {
      const v = Number(valor);
      const valorMov = tipo === 'emissao' ? (v * lojaData.percentagem) : -v;
      const saldoRef = doc(db, "clientes", clientId, "saldos_por_loja", nifLogado);

      if (tipo === 'desconto') {
        const cSnap = await getDoc(doc(db, "clientes", clientId));
        if (!cSnap.exists() || String(pinCli) !== String(cSnap.data().pin)) {
          alert("PIN do Cliente Inválido!"); return;
        }
        const s = await getDoc(saldoRef);
        if ((s.data()?.saldoDisponivel || 0) < v) {
          alert("Saldo insuficiente nesta loja ou ainda em carência."); return;
        }
      }

      await setDoc(saldoRef, { 
        saldoDisponivel: increment(valorMov), 
        nomeLoja: lojaData.nome,
        ultimoMovimento: serverTimestamp() 
      }, { merge: true });

      await addDoc(collection(db, "historico"), {
        clienteId: clientId, lojaId: nifLogado, nomeLoja: lojaData.nome,
        valorVenda: tipo === 'desconto' ? 0 : v,
        valorCashback: valorMov, tipo, fatura, data: serverTimestamp(),
        disponivelEm: tipo === 'emissao' ? Date.now() + (2 * 24 * 60 * 60 * 1000) : Date.now()
      });

      alert("Operação Sucesso!");
    } catch (e) { alert("Erro na operação."); }
  };

  if (!userType) {
    return (
      <div style={{ padding: '50px', textAlign: 'center', fontFamily: 'sans-serif' }}>
        <h1>VizinhoMais</h1>
        <button onClick={() => setUserType('cliente')} style={btnStyle}>SOU CLIENTE</button>
        <button onClick={() => setUserType('loja')} style={btnStyle}>SOU COMERCIANTE</button>
        <button onClick={() => setUserType('admin')} style={{ ...btnStyle, background: '#34495e' }}>ADMIN</button>
      </div>
    );
  }

  if (userType === 'cliente') return <div style={{padding:'20px'}}><button onClick={()=>setUserType(null)}>Sair</button><Cliente /></div>;
  if (userType === 'admin') return <div style={{padding:'20px'}}><button onClick={()=>setUserType(null)}>Sair</button><Relatorio /><hr/><Gestor /></div>;

  if (userType === 'loja' && !isLoggedIn) {
    return (
      <div style={{ padding: '50px', textAlign: 'center' }}>
        <button onClick={() => setUserType(null)}>Voltar</button>
        <h3>Login Loja</h3>
        <input id="n" type="text" placeholder="NIF" style={inputStyle} />
        <input id="p" type="password" placeholder="Senha" style={inputStyle} />
        <button onClick={() => loginLoja(document.getElementById('n').value, document.getElementById('p').value)}>ENTRAR</button>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', maxWidth: '500px', margin: 'auto', fontFamily: 'sans-serif' }}>
      <h2>Loja: {lojaData.nome}</h2>
      <input id="pc" type="password" placeholder="PIN Comerciante" style={inputStyle} />
      <input id="cid" type="text" placeholder="Telemóvel Cliente" style={inputStyle} />
      <input id="val" type="number" placeholder="Valor (€)" style={inputStyle} />
      <input id="fat" type="text" placeholder="Nº Fatura" style={inputStyle} />
      <input id="pcli" type="password" placeholder="PIN Cliente (só p/ desconto)" style={{...inputStyle, background:'#fff3cd'}} />
      <div style={{display:'flex', gap:'10px'}}>
        <button onClick={() => executarOperacao('emissao', document.getElementById('cid').value, document.getElementById('val').value, document.getElementById('fat').value, document.getElementById('pc').value)} style={{flex:1, padding:'15px', background:'green', color:'white'}}>EMITIR</button>
        <button onClick={() => executarOperacao('desconto', document.getElementById('cid').value, document.getElementById('val').value, document.getElementById('fat').value, document.getElementById('pc').value, document.getElementById('pcli').value)} style={{flex:1, padding:'15px', background:'orange', color:'white'}}>DESCONTAR</button>
      </div>
      <button onClick={()=>setIsLoggedIn(false)} style={{marginTop:'20px', width:'100%'}}>SAIR</button>
    </div>
  );
}

const btnStyle = { display: 'block', width: '250px', margin: '10px auto', padding: '15px', background: '#3498db', color: 'white', border: 'none', borderRadius: '5px', cursor:'pointer' };
const inputStyle = { display: 'block', width: '100%', padding: '10px', marginBottom: '10px', boxSizing: 'border-box' };

export default App;