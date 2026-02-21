import React, { useEffect, useState } from 'react';
import { auth, db } from './firebase';
import { doc, updateDoc, query, where, getDocs, collection } from "firebase/firestore";
import { updatePassword, updateEmail } from "firebase/auth";

function Profile({ voltar }) {
  const [userData, setUserData] = useState(null);
  const [novoTelefone, setNovoTelefone] = useState('');
  const [novoEmail, setNovoEmail] = useState('');
  const [novaPass, setNovaPass] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);

  // Carregar os dados do utilizador logado
  useEffect(() => {
    const loadData = async () => {
      try {
        const user = auth.currentUser;
        if (user) {
          // Procuramos no Firestore o documento que tem o UID deste utilizador
          const q = query(collection(db, "clientes"), where("uid", "==", user.uid));
          const querySnapshot = await getDocs(q);
          
          querySnapshot.forEach((doc) => {
            const data = doc.data();
            setUserData(data);
            setNovoTelefone(data.telefone);
            setNovoEmail(data.email);
          });
        }
      } catch (error) {
        console.error("Erro ao carregar dados:", error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const handleUpdate = async (e) => {
    e.preventDefault();
    setMessage('A atualizar...');
    
    try {
      const user = auth.currentUser;
      // Usamos o NIF como referência para encontrar o documento certo
      const docRef = doc(db, "clientes", userData.nif);

      // 1. Atualizar Telemóvel no Firestore
      await updateDoc(docRef, { 
        telefone: novoTelefone,
        email: novoEmail 
      });

      // 2. Atualizar Email na Autenticação (se mudou)
      if (novoEmail !== user.email) {
        await updateEmail(user, novoEmail);
      }

      // 3. Atualizar Password se o campo não estiver vazio
      if (novaPass) {
        await updatePassword(user, novaPass);
      }

      setMessage("Dados atualizados com sucesso!");
    } catch (error) {
      setMessage("Erro ao atualizar: " + error.message);
    }
  };

  const containerStyle = { padding: '20px', textAlign: 'center', fontFamily: 'sans-serif', maxWidth: '400px', margin: 'auto', border: '1px solid #eee', borderRadius: '10px', marginTop: '30px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' };
  const inputStyle = { padding: '12px', borderRadius: '5px', border: '1px solid #ddd', fontSize: '16px', marginBottom: '10px', width: '100%', boxSizing: 'border-box' };
  const labelStyle = { display: 'block', textAlign: 'left', fontWeight: 'bold', marginBottom: '5px', color: '#333' };

  if (loading) return <div style={containerStyle}>Carregando dados...</div>;
  if (!userData) return <div style={containerStyle}>Utilizador não encontrado. <button onClick={voltar}>Voltar</button></div>;

  return (
    <div style={containerStyle}>
      <h2 style={{ color: '#2c3e50' }}>Gerir Perfil</h2>
      <p style={{ fontSize: '14px', color: '#7f8c8d' }}>Identificador NIF: <strong>{userData.nif}</strong></p>
      
      <form onSubmit={handleUpdate}>
        <label style={labelStyle}>Nome (Fixo)</label>
        <input type="text" value={userData.nome} disabled style={{ ...inputStyle, backgroundColor: '#f9f9f9' }} />

        <label style={labelStyle}>Alterar Telemóvel</label>
        <input type="tel" value={novoTelefone} onChange={(e) => setNovoTelefone(e.target.value)} style={inputStyle} required />

        <label style={labelStyle}>Alterar Email</label>
        <input type="email" value={novoEmail} onChange={(e) => setNovoEmail(e.target.value)} style={inputStyle} required />

        <label style={labelStyle}>Nova Password (opcional)</label>
        <input type="password" placeholder="Mínimo 6 caracteres" onChange={(e) => setNovaPass(e.target.value)} style={inputStyle} />

        <button type="submit" style={{ padding: '15px', background: '#3498db', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold', width: '100%' }}>
          Guardar Alterações
        </button>
      </form>

      <button onClick={() => { auth.signOut(); voltar(); }} style={{ marginTop: '15px', background: 'none', border: 'none', color: '#e74c3c', cursor: 'pointer', fontWeight: 'bold' }}>
        Sair da Conta
      </button>

      {message && <p style={{ marginTop: '15px', color: message.includes('sucesso') ? 'green' : 'red' }}>{message}</p>}
    </div>
  );
}

export default Profile;