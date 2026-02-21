import React, { useState, useEffect } from 'react';
import { auth, db } from './firebase';
import { signOut } from "firebase/auth";
import { doc, getDoc, collection, query, where, getDocs, orderBy } from "firebase/firestore";
import { consultarSaldoPorLoja } from './Transacoes';

function Profile() {
  const [userData, setUserData] = useState(null);
  const [saldosPorLoja, setSaldosPorLoja] = useState([]);
  const [movimentos, setMovimentos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const carregarDadosCliente = async () => {
      const user = auth.currentUser;
      if (user) {
        // 1. Procurar dados do perfil
        const docSnap = await getDoc(doc(db, "utilizadores", user.uid));
        if (docSnap.exists()) {
          const dados = docSnap.data();
          setUserData(dados);

          // 2. Carregar Histórico de Movimentos (Ordenado por data)
          const qMov = query(
            collection(db, "movimentos"),
            where("clienteId", "==", user.uid),
            orderBy("dataMovimento", "desc")
          );
          const querySnapshot = await getDocs(qMov);
          const listaMovimentos = [];
          const lojasUnicas = new Set();

          querySnapshot.forEach((doc) => {
            const mov = doc.data();
            listaMovimentos.push({ id: doc.id, ...mov });
            lojasUnicas.add(mov.comercianteId);
          });
          setMovimentos(listaMovimentos);

          // 3. Calcular Saldos por cada Loja (Regra do Check-list)
          const calculosSaldos = [];
          for (let lojaId of lojasUnicas) {
            const saldoLoja = await consultarSaldoPorLoja(user.uid, lojaId);
            // Procuramos o nome da loja no primeiro movimento que encontrarmos dela
            const nomeLoja = listaMovimentos.find(m => m.comercianteId === lojaId)?.lojaNome || "Loja Desconhecida";
            calculosSaldos.push({
              nome: nomeLoja,
              total: saldoLoja.total,
              disponivel: saldoLoja.disponivel
            });
          }
          setSaldosPorLoja(calculosSaldos);
        }
      }
      setLoading(false);
    };

    carregarDadosCliente();
  }, []);

  if (loading) return <div style={{textAlign: 'center', marginTop: '50px'}}>A carregar os seus movimentos...</div>;

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif', maxWidth: '600px', margin: 'auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #2ecc71', paddingBottom: '10px' }}>
        <h2>Olá, {userData?.nome || 'Cliente'}!</h2>
        <button onClick={() => signOut(auth)} style={{ background: '#e74c3c', color: 'white', border: 'none', padding: '10px', borderRadius: '5px', cursor: 'pointer' }}>Sair</button>
      </div>

      {/* Cartão Virtual (Simples por agora, design virá depois) */}
      <div style={{ background: 'linear-gradient(45deg, #2ecc71, #27ae60)', color: 'white', padding: '20px', borderRadius: '15px', marginTop: '20px', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }}>
        <p style={{ margin: 0, fontSize: '14px' }}>Cartão VizinhoMais</p>
        <h3 style={{ fontSize: '24px', letterSpacing: '2px', margin: '10px 0' }}>{userData?.nCartao || '0000000000'}</h3>
        <p style={{ margin: 0, textAlign: 'right', fontSize: '12px' }}>{userData?.nome}</p>
      </div>

      {/* Secção de Saldos Acumulados */}
      <div style={{ marginTop: '30px' }}>
        <h3>Os Meus Saldos</h3>
        {saldosPorLoja.length === 0 ? (
          <p style={{color: '#7f8c8d'}}>Ainda não tem saldo acumulado.</p>
        ) : (
          saldosPorLoja.map((loja, index) => (
            <div key={index} style={{ background: '#f9f9f9', padding: '15px', borderRadius: '10px', marginBottom: '10px', borderLeft: '5px solid #2ecc71' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <strong>{loja.nome}</strong>
                <span style={{ color: '#27ae60', fontWeight: 'bold' }}>{loja.disponivel}€</span>
              </div>
              <small style={{ color: '#7f8c8d' }}>Total acumulado: {loja.total}€ (Disponível após 2 dias)</small>
            </div>
          ))
        )}
      </div>

      {/* Histórico Detalhado */}
      <div style={{ marginTop: '30px' }}>
        <h3>Últimos Movimentos</h3>
        {movimentos.map((mov) => {
          const data = new Date(mov.dataMovimento).toLocaleDateString('pt-PT');
          const isDisponivel = new Date() >= new Date(mov.dataDisponivel);
          
          return (
            <div key={mov.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #eee', fontSize: '14px' }}>
              <div>
                <div style={{ fontWeight: 'bold' }}>{mov.lojaNome}</div>
                <small style={{ color: '#95a5a6' }}>{data} • Fatura: {mov.fatura}</small>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ color: '#27ae60', fontWeight: 'bold' }}>+{mov.valorCashback}€</div>
                <small style={{ color: isDisponivel ? '#2ecc71' : '#e67e22' }}>
                  {isDisponivel ? 'Disponível' : 'Pendente'}
                </small>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default Profile;