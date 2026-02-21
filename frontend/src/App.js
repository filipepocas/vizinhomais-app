import React, { useState, useEffect } from 'react';
import { auth, db } from './firebase';
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import Login from './Login';
import Register from './Register';
import Profile from './Profile';
import AdminDash from './AdminDash';

// Componente temporário para o Comerciante (criaremos o ficheiro depois)
const ComercianteDash = () => (
  <div style={{padding: '20px', textAlign: 'center'}}>
    <h2>Painel Comerciante</h2>
    <p>Área em desenvolvimento...</p>
    <button onClick={() => auth.signOut()} style={{padding: '10px', background: '#e74c3c', color: 'white', border: 'none', borderRadius: '5px'}}>Sair</button>
  </div>
);

function App() {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [tela, setTela] = useState('login'); 
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (usuarioFirebase) => {
      if (usuarioFirebase) {
        // Tentamos procurar primeiro na coleção 'clientes' (conforme a tua imagem)
        let docRef = doc(db, "clientes", "199800480"); // Usando o teu NIF da imagem para teste direto
        let docSnap = await getDoc(docRef);

        // Se não encontrar pelo NIF, tenta procurar numa coleção geral 'utilizadores'
        if (!docSnap.exists()) {
          docRef = doc(db, "utilizadores", usuarioFirebase.uid);
          docSnap = await getDoc(docRef);
        }

        if (docSnap.exists()) {
          const data = docSnap.data();
          setUserData(data);
          setUser(usuarioFirebase);
          
          // Lógica de Redirecionamento baseada no campo 'tipo' que vais adicionar
          if (data.tipo === 'admin') setTela('admin');
          else if (data.tipo === 'comerciante') setTela('comerciante');
          else setTela('perfil'); 
        } else {
          // Se o utilizador existe no Auth mas não no Firestore
          setTela('perfil');
        }
      } else {
        setUser(null);
        setUserData(null);
        if (tela !== 'registro') setTela('login');
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [tela]);

  if (loading) return <div style={{ textAlign: 'center', marginTop: '50px' }}>A carregar VizinhoMais...</div>;

  return (
    <div>
      {tela === 'login' && <Login aoLogar={() => {}} irParaRegisto={() => setTela('registro')} />}
      {tela === 'registro' && <Register voltar={() => setTela('login')} />}
      {tela === 'perfil' && <Profile voltar={() => setTela('login')} />}
      {tela === 'admin' && <AdminDash />}
      {tela === 'comerciante' && <ComercianteDash />}
    </div>
  );
}

export default App;