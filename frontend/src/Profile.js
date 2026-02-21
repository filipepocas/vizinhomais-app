import React, { useEffect, useState } from 'react';
import { auth, db } from './firebase';
import { doc, updateDoc, query, where, getDocs, collection } from "firebase/firestore";
import { updatePassword, updateEmail } from "firebase/auth";

function Profile({ voltar }) {
  const [userData, setUserData] = useState(null);
  const [novoTelefone, setNovoTelefone] = useState('');
  const [novaPass, setNovaPass] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const user = auth.currentUser;
        if (user) {
          // Procuramos o cliente pelo UID que o Firebase gerou no login
          const q = query(collection(db, "clientes"), where("uid", "==", user.uid));
          const querySnapshot = await getDocs(q);
          
          querySnapshot.forEach((doc) => {
            const data = doc.data();
            setUserData(data);
            setNovoTelefone(data.telefone);
          });
        }
      } catch (error) {
        console.error("Erro ao carregar perfil:", error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const handleUpdate = async (e) => {
    e.preventDefault();
    setMessage('A guardar alterações...');
    
    try {
      const user = auth.currentUser;
      const docRef = doc(db, "clientes", userData.nif);

      // 1. Se o telemóvel mudou, temos de atualizar o Firestore e o Login (email fictício)
      if (novoTelefone !== userData.telefone) {
        const novoEmailFicticio = `${novoTelefone}@vizinhomais.com`;
        await updateEmail(user, novoEmailFicticio);
        await updateDoc(docRef, { 
          telefone: novoTelefone,
          emailInterno: novoEmailFicticio 
        });
      }

      // 2. Se escreveu uma nova password, atualizamos no Firebase Auth
      if (novaPass) {
        if (novaPass.length < 6) {
          throw new Error("A password deve ter pelo menos 6 caracteres.");
        }
        await updatePassword(user, novaPass);
      }

      setMessage("Dados atualizados com sucesso!");
      setNovaPass(''); // Limpa o campo da pass por segurança
    } catch (error) {
      setMessage("Erro: " + error.message);
    }
  };

  const containerStyle = { padding: '20px', textAlign: 'center', fontFamily: 'sans-serif', maxWidth: '400px', margin: 'auto', border: '1px solid #eee', borderRadius: '10px', marginTop: '30px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' };
  const inputStyle = { padding: '12px', borderRadius: '5px', border: '1px solid #ddd', fontSize: '16px', marginBottom: '10px', width: '100%', boxSizing: 'border-box' };
  const labelStyle = { display: 'block', textAlign: 'left', fontWeight: 'bold', marginBottom: '5px', color: '#333', fontSize: '14px' };

  if (loading) return <div style={containerStyle}>A carregar o seu cartão...</div>;

  return (
    <div style={containerStyle}>
      <h2 style={{ color: '#2c3e50' }}>O Meu Cartão Cliente</h2>
      
      {/* Mostra os Pontos com destaque */}
      <div style={{ background: '#f1c40f', padding: '20px', borderRadius: '10px', marginBottom: '20px' }}>
        <span style={{ fontSize: '14px', fontWeight: 'bold' }}>SALDO DE PONTOS</span>
        <h1 style={{ margin: '5px 0' }}>{userData?.pontos || 0}</h1>
      </div>

      <p style={{ fontSize: '14px', color: '#7f8c8d' }}>NIF: <strong>{userData?.nif}</strong> (Inalterável)</p>
      
      <form onSubmit={handleUpdate}>
        <label style={labelStyle}>Nome</label>
        <input type="text" value={userData?.nome} disabled style={{ ...inputStyle, backgroundColor: '#f5f5f5' }} />

        <label style={labelStyle}>Telemóvel (Login)</label>
        <input type="tel" value={novoTelefone} onChange={(e) => setNovoTelefone(e.target.value)} style={inputStyle} required />

        <label style={labelStyle}>Nova Password (deixe vazio para manter)</label>
        <input type="password" placeholder="Mínimo 6 caracteres" value={novaPass} onChange={(e) => setNovaPass(e.target.value)} style={inputStyle} />

        <button type="submit" style={{ padding: '15px', background: '#3498db', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold', width: '100%' }}>
          Atualizar Dados
        </button>
      </form>

      <button onClick={() => { auth.signOut(); voltar(); }} style={{ marginTop: '20px', background: 'none', border: 'none', color: '#e74c3c', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px' }}>
        Sair do Cartão
      </button>

      {message && <p style={{ marginTop: '15px', color: message.includes('sucesso') ? 'green' : 'red', fontWeight: 'bold' }}>{message}</p>}
    </div>
  );
}

export default Profile;