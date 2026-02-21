import React, { useState, useEffect } from 'react';
import { auth, db } from './firebase';
import { signOut, updatePassword } from "firebase/auth";
import { doc, getDoc, updateDoc } from "firebase/firestore";

function ComercianteDash() {
  const [userData, setUserData] = useState(null);
  const [novaPass, setNovaPass] = useState('');
  const [erro, setErro] = useState('');

  useEffect(() => {
    const buscarDados = async () => {
      const user = auth.currentUser;
      if (user) {
        // Procuramos os dados da loja na coleção utilizadores
        const docSnap = await getDoc(doc(db, "utilizadores", user.uid));
        if (docSnap.exists()) {
          setUserData(docSnap.data());
        }
      }
    };
    buscarDados();
  }, []);

  const alterarSenhaObrigatoria = async (e) => {
    e.preventDefault();
    if (novaPass.length < 6) {
      setErro('A nova password deve ter pelo menos 6 caracteres.');
      return;
    }

    try {
      const user = auth.currentUser;
      // 1. Atualiza a password no Authentication
      await updatePassword(user, novaPass);
      // 2. Atualiza o Firestore para dizer que já não é provisória
      await updateDoc(doc(db, "utilizadores", user.uid), {
        passwordProvisoria: false
      });
      // 3. Atualiza o estado local para libertar o ecrã
      setUserData({ ...userData, passwordProvisoria: false });
      alert('Password atualizada com sucesso!');
    } catch (error) {
      setErro('Erro ao atualizar: ' + error.message);
    }
  };

  if (!userData) return <p style={{textAlign: 'center', marginTop: '50px'}}>A carregar dados da loja...</p>;

  // BLOQUEIO DE SEGURANÇA: Se for pass provisória, obriga a mudar
  if (userData.passwordProvisoria) {
    return (
      <div style={{ padding: '30px', textAlign: 'center', fontFamily: 'sans-serif', maxWidth: '400px', margin: 'auto', border: '1px solid #ddd', marginTop: '50px', borderRadius: '15px' }}>
        <h2>Primeiro Acesso</h2>
        <p>Olá, <strong>{userData.nomeLoja}</strong>!</p>
        <p>Por segurança, defina uma password definitiva para a sua conta.</p>
        <form onSubmit={alterarSenhaObrigatoria}>
          <input 
            type="password" 
            placeholder="Nova Password (min. 6 caracteres)" 
            value={novaPass} 
            onChange={(e) => setNovaPass(e.target.value)} 
            style={{ width: '100%', padding: '12px', marginBottom: '15px', borderRadius: '5px', border: '1px solid #ccc' }} 
            required 
          />
          <button type="submit" style={{ width: '100%', padding: '15px', background: '#2ecc71', color: 'white', border: 'none', borderRadius: '5px', fontWeight: 'bold', cursor: 'pointer' }}>
            Gravar e Entrar na Loja
          </button>
        </form>
        {erro && <p style={{ color: 'red', marginTop: '10px' }}>{erro}</p>}
      </div>
    );
  }

  // ECRÃ PRINCIPAL DO COMERCIANTE (Após mudar pass)
  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif', maxWidth: '800px', margin: 'auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #3498db', paddingBottom: '10px' }}>
        <div>
          <h2 style={{margin: 0}}>🏪 {userData.nomeLoja}</h2>
          <small>{userData.morada}</small>
        </div>
        <button onClick={() => signOut(auth)} style={{ background: '#e74c3c', color: 'white', border: 'none', padding: '10px 15px', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}>Sair</button>
      </div>
      
      <div style={{ marginTop: '30px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        <div style={{ background: '#ebf5fb', padding: '30px', borderRadius: '15px', textAlign: 'center', border: '1px dashed #3498db' }}>
          <h3>📸 Scanner de Cartão</h3>
          <p style={{color: '#7f8c8d'}}>Usar a câmara para ler o código de barras do cliente.</p>
          <button style={{ padding: '15px', background: '#3498db', color: 'white', border: 'none', borderRadius: '5px', width: '100%', fontWeight: 'bold', cursor: 'pointer' }}>Abrir Câmara</button>
        </div>
        
        <div style={{ background: '#f4fbf7', padding: '30px', borderRadius: '15px', textAlign: 'center', border: '1px dashed #27ae60' }}>
          <h3>🔢 Introdução Manual</h3>
          <p style={{color: '#7f8c8d'}}>Introduzir o número de 10 dígitos do cartão.</p>
          <input type="text" placeholder="Ex: 1234567890" style={{ width: '100%', padding: '12px', marginBottom: '15px', borderRadius: '5px', border: '1px solid #ccc', boxSizing: 'border-box' }} />
          <button style={{ padding: '15px', background: '#27ae60', color: 'white', border: 'none', borderRadius: '5px', width: '100%', fontWeight: 'bold', cursor: 'pointer' }}>Validar Cartão</button>
        </div>
      </div>
    </div>
  );
}

export default ComercianteDash;