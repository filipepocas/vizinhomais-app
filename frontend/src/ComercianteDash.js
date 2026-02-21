import React, { useState, useEffect } from 'react';
import { auth, db } from './firebase';
import { signOut, updatePassword } from "firebase/auth";
import { doc, getDoc, updateDoc, collection, query, where, getDocs } from "firebase/firestore";
import { registarCompra } from './Transacoes';

function ComercianteDash() {
  const [userData, setUserData] = useState(null);
  const [novaPass, setNovaPass] = useState('');
  const [erro, setErro] = useState('');
  
  // Estados para a Transação
  const [numCartao, setNumCartao] = useState('');
  const [clienteEncontrado, setClienteEncontrado] = useState(null);
  const [valorVenda, setValorVenda] = useState('');
  const [numFatura, setNumFatura] = useState('');
  const [percentagem, setPercentagem] = useState('10'); // Valor padrão 10%
  const [mensagemTransacao, setMensagemTransacao] = useState('');

  useEffect(() => {
    const buscarDados = async () => {
      const user = auth.currentUser;
      if (user) {
        const docSnap = await getDoc(doc(db, "utilizadores", user.uid));
        if (docSnap.exists()) {
          setUserData(docSnap.data());
        }
      }
    };
    buscarDados();
  }, []);

  const buscarCliente = async () => {
    setMensagemTransacao('A procurar cliente...');
    const q = query(collection(db, "utilizadores"), where("nCartao", "==", numCartao));
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      const docCliente = querySnapshot.docs[0];
      setClienteEncontrado({ id: docCliente.id, ...docCliente.data() });
      setMensagemTransacao('Cliente encontrado!');
    } else {
      setClienteEncontrado(null);
      setMensagemTransacao('Cartão não encontrado.');
    }
  };

  const confirmarVenda = async (e) => {
    e.preventDefault();
    if (!clienteEncontrado) return;

    const dados = {
      clienteId: clienteEncontrado.id,
      comercianteId: auth.currentUser.uid,
      lojaNome: userData.nomeLoja,
      valorCompra: valorVenda,
      percentagem: percentagem,
      fatura: numFatura
    };

    const resultado = await registarCompra(dados);
    if (resultado.sucesso) {
      setMensagemTransacao(`Sucesso! Cashback de ${resultado.valor}€ gerado.`);
      setValorVenda('');
      setNumFatura('');
      setClienteEncontrado(null);
      setNumCartao('');
    } else {
      setMensagemTransacao('Erro ao registar: ' + resultado.erro);
    }
  };

  const alterarSenhaObrigatoria = async (e) => {
    e.preventDefault();
    try {
      const user = auth.currentUser;
      await updatePassword(user, novaPass);
      await updateDoc(doc(db, "utilizadores", user.uid), { passwordProvisoria: false });
      setUserData({ ...userData, passwordProvisoria: false });
    } catch (error) {
      setErro('Erro: ' + error.message);
    }
  };

  if (!userData) return <p style={{textAlign: 'center', marginTop: '50px'}}>A carregar...</p>;

  if (userData.passwordProvisoria) {
    return (
      <div style={{ padding: '30px', textAlign: 'center', maxWidth: '400px', margin: 'auto' }}>
        <h2>Primeiro Acesso</h2>
        <p>Defina a sua password definitiva para a loja <strong>{userData.nomeLoja}</strong></p>
        <form onSubmit={alterarSenhaObrigatoria}>
          <input type="password" placeholder="Nova Password" value={novaPass} onChange={(e) => setNovaPass(e.target.value)} style={{ width: '100%', padding: '10px', marginBottom: '10px' }} required />
          <button type="submit" style={{ width: '100%', padding: '10px', background: '#2ecc71', color: 'white', border: 'none', borderRadius: '5px' }}>Gravar</button>
        </form>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif', maxWidth: '800px', margin: 'auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '2px solid #3498db', paddingBottom: '10px' }}>
        <h2>🏪 {userData.nomeLoja}</h2>
        <button onClick={() => signOut(auth)} style={{ background: '#e74c3c', color: 'white', border: 'none', padding: '10px', borderRadius: '5px', cursor: 'pointer' }}>Sair</button>
      </div>
      
      <div style={{ marginTop: '30px', background: '#f9f9f9', padding: '20px', borderRadius: '15px' }}>
        <h3>Registar Nova Venda</h3>
        
        {!clienteEncontrado ? (
          <div style={{ display: 'flex', gap: '10px' }}>
            <input 
              type="text" 
              placeholder="Nº do Cartão (10 dígitos)" 
              value={numCartao} 
              onChange={(e) => setNumCartao(e.target.value)} 
              style={{ flex: 1, padding: '12px', borderRadius: '5px', border: '1px solid #ddd' }}
            />
            <button onClick={buscarCliente} style={{ padding: '10px 20px', background: '#3498db', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>Validar</button>
          </div>
        ) : (
          <form onSubmit={confirmarVenda} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ background: '#d4edda', padding: '10px', borderRadius: '5px', color: '#155724' }}>
              <strong>Cliente:</strong> {clienteEncontrado.nome} ({clienteEncontrado.nCartao})
            </div>
            <input type="number" step="0.01" placeholder="Valor da Fatura (€)" value={valorVenda} onChange={(e) => setValorVenda(e.target.value)} style={{ padding: '12px', borderRadius: '5px', border: '1px solid #ddd' }} required />
            <input type="text" placeholder="Nº da Fatura" value={numFatura} onChange={(e) => setNumFatura(e.target.value)} style={{ padding: '12px', borderRadius: '5px', border: '1px solid #ddd' }} required />
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <label>Cashback %:</label>
              <input type="number" value={percentagem} onChange={(e) => setPercentagem(e.target.value)} style={{ width: '70px', padding: '5px' }} />
              <span>(Ganho: {((valorVenda || 0) * (percentagem / 100)).toFixed(2)}€)</span>
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button type="submit" style={{ flex: 1, padding: '15px', background: '#27ae60', color: 'white', border: 'none', borderRadius: '5px', fontWeight: 'bold', cursor: 'pointer' }}>Confirmar e Atribuir Saldo</button>
              <button type="button" onClick={() => setClienteEncontrado(null)} style={{ padding: '15px', background: '#95a5a6', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>Cancelar</button>
            </div>
          </form>
        )}
        
        {mensagemTransacao && <p style={{ marginTop: '15px', color: mensagemTransacao.includes('Sucesso') ? 'green' : 'red', fontWeight: 'bold', textAlign: 'center' }}>{mensagemTransacao}</p>}
      </div>
    </div>
  );
}

export default ComercianteDash;