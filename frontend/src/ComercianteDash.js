import React, { useState, useEffect } from 'react';
import { auth, db } from './firebase';
import { signOut, updatePassword } from "firebase/auth";
import { doc, getDoc, updateDoc, collection, query, where, getDocs, orderBy } from "firebase/firestore";
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
  const [percentagem, setPercentagem] = useState('10');
  const [mensagemTransacao, setMensagemTransacao] = useState('');

  // Estado para o Histórico da Loja
  const [historico, setHistorico] = useState([]);

  const carregarDadosLoja = async () => {
    const user = auth.currentUser;
    if (user) {
      // 1. Dados do Perfil
      const docSnap = await getDoc(doc(db, "utilizadores", user.uid));
      if (docSnap.exists()) {
        setUserData(docSnap.data());
      }

      // 2. Histórico de Vendas desta Loja
      const q = query(
        collection(db, "movimentos"),
        where("comercianteId", "==", user.uid),
        orderBy("dataMovimento", "desc")
      );
      const querySnapshot = await getDocs(q);
      const movimentos = [];
      querySnapshot.forEach((doc) => {
        movimentos.push({ id: doc.id, ...doc.data() });
      });
      setHistorico(movimentos);
    }
  };

  useEffect(() => {
    carregarDadosLoja();
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
      carregarDadosLoja(); // Recarregar histórico após venda
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

  if (!userData) return <p style={{textAlign: 'center', marginTop: '50px'}}>A carregar dados da loja...</p>;

  if (userData.passwordProvisoria) {
    return (
      <div style={{ padding: '30px', textAlign: 'center', maxWidth: '400px', margin: 'auto' }}>
        <h2>Primeiro Acesso</h2>
        <form onSubmit={alterarSenhaObrigatoria}>
          <input type="password" placeholder="Nova Password" value={novaPass} onChange={(e) => setNovaPass(e.target.value)} style={{ width: '100%', padding: '10px', marginBottom: '10px' }} required />
          <button type="submit" style={{ width: '100%', padding: '10px', background: '#2ecc71', color: 'white', border: 'none', borderRadius: '5px' }}>Gravar</button>
        </form>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif', maxWidth: '900px', margin: 'auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '2px solid #3498db', paddingBottom: '10px' }}>
        <h2>🏪 {userData.nomeLoja}</h2>
        <button onClick={() => signOut(auth)} style={{ background: '#e74c3c', color: 'white', border: 'none', padding: '10px', borderRadius: '5px', cursor: 'pointer' }}>Sair</button>
      </div>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px', marginTop: '20px' }}>
        
        {/* COLUNA ESQUERDA: REGISTO DE VENDA */}
        <div style={{ background: '#f9f9f9', padding: '20px', borderRadius: '15px', height: 'fit-content' }}>
          <h3>Registar Venda</h3>
          {!clienteEncontrado ? (
            <div style={{ display: 'flex', gap: '10px' }}>
              <input type="text" placeholder="Nº do Cartão" value={numCartao} onChange={(e) => setNumCartao(e.target.value)} style={{ flex: 1, padding: '12px', borderRadius: '5px', border: '1px solid #ddd' }} />
              <button onClick={buscarCliente} style={{ padding: '10px', background: '#3498db', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>Validar</button>
            </div>
          ) : (
            <form onSubmit={confirmarVenda} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ background: '#d4edda', padding: '10px', borderRadius: '5px' }}>
                <strong>Cliente:</strong> {clienteEncontrado.nome}
              </div>
              <input type="number" step="0.01" placeholder="Valor Venda (€)" value={valorVenda} onChange={(e) => setValorVenda(e.target.value)} style={{ padding: '10px' }} required />
              <input type="text" placeholder="Nº Fatura" value={numFatura} onChange={(e) => setNumFatura(e.target.value)} style={{ padding: '10px' }} required />
              <button type="submit" style={{ padding: '15px', background: '#27ae60', color: 'white', border: 'none', borderRadius: '5px', fontWeight: 'bold', cursor: 'pointer' }}>Atribuir Saldo</button>
              <button type="button" onClick={() => setClienteEncontrado(null)} style={{ background: 'none', border: 'none', color: 'red', cursor: 'pointer', fontSize: '12px' }}>Cancelar</button>
            </form>
          )}
          {mensagemTransacao && <p style={{ textAlign: 'center', color: 'blue', fontWeight: 'bold' }}>{mensagemTransacao}</p>}
        </div>

        {/* COLUNA DIREITA: HISTÓRICO DE HOJE */}
        <div style={{ background: '#fff', border: '1px solid #eee', padding: '20px', borderRadius: '15px' }}>
          <h3>Últimas Vendas</h3>
          <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
            {historico.length === 0 ? <p>Nenhuma venda registada.</p> : historico.map(mov => (
              <div key={mov.id} style={{ padding: '10px 0', borderBottom: '1px solid #f0f0f0', display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                <div>
                  <strong>Fatura: {mov.fatura}</strong><br/>
                  <small>{new Date(mov.dataMovimento).toLocaleString('pt-PT')}</small>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ color: '#27ae60', fontWeight: 'bold' }}>+{mov.valorCashback}€</span><br/>
                  <small>Venda: {mov.valorCompra}€</small>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}

export default ComercianteDash;