import React, { useState, useEffect } from 'react';
import { auth, db } from './firebase';
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import Login from './Login';
import Register from './Register';
import Profile from './Profile';
// Nota: Criaremos estes componentes nos próximos passos
const ComercianteDash = () => <div style={{padding: '20px'}}><h2>Painel Comerciante</h2><button onClick={() => auth.signOut()}>Sair</button></div>;
const AdminDash = () => <div style={{padding: '20px'}}><h2>Painel Administrador</h2><button onClick={() => auth.signOut()}>Sair</button></div>;

function App() {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [tela, setTela] = useState('login'); 
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (usuarioFirebase) => {
      if (usuarioFirebase) {
        // Quando o utilizador loga, vamos buscar o tipo dele ao Firestore
        const docRef = doc(db, "utilizadores", usuarioFirebase.uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          setUserData(data);
          setUser(usuarioFirebase);
          
          // Define a tela com base no tipo de utilizador do Check-list
          if (data.tipo === 'admin') setTela('admin');
          else if (data.tipo === 'comerciante') setTela('comerciante');
          else setTela('perfil'); // Cliente
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
      {tela === 'login' && (
        <Login 
          aoLogar={() => {}} // O useEffect já trata da mudança
          irParaRegisto={() => setTela('registro')} 
        />
      )}

      {tela === 'registro' && (
        <Register voltar={() => setTela('login')} />
      )}

      {/* Interface Cliente */}
      {tela === 'perfil' && (
        <Profile voltar={() => setTela('login')} />
      )}

      {/* Interface Comerciante (Check-list) */}
      {tela === 'comerciante' && (
        <ComercianteDash />
      )}

      {/* Interface Administrador (Check-list) */}
      {tela === 'admin' && (
        <AdminDash />
      )}
    </div>
  );
}

export default App;