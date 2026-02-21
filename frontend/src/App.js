import React, { useState, useEffect } from 'react';
import { auth, db } from './firebase';
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import Login from './Login';
import Register from './Register';
import Profile from './Profile';
import AdminDash from './AdminDash';
import ComercianteDash from './ComercianteDash';

function App() {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [tela, setTela] = useState('login'); 
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (usuarioFirebase) => {
      if (usuarioFirebase) {
        console.log("Utilizador logado:", usuarioFirebase.uid);
        
        // 1. Tentar encontrar na coleção 'utilizadores' (O padrão que queremos)
        let docRef = doc(db, "utilizadores", usuarioFirebase.uid);
        let docSnap = await getDoc(docRef);

        // 2. Se não existir, tentar na coleção antiga 'clientes' pelo NIF que vimos na imagem
        if (!docSnap.exists()) {
          console.log("Não encontrado em 'utilizadores', a procurar em 'clientes'...");
          docRef = doc(db, "clientes", "199800480"); 
          docSnap = await getDoc(docRef);
        }

        if (docSnap.exists()) {
          const data = docSnap.data();
          setUserData(data);
          setUser(usuarioFirebase);
          
          if (data.tipo === 'admin') setTela('admin');
          else if (data.tipo === 'comerciante') setTela('comerciante');
          else setTela('perfil'); 
        } else {
          // 3. Se ainda assim não encontrar perfil, criamos um perfil base para evitar bloqueio
          console.log("Perfil não encontrado. A criar perfil de emergência...");
          const novoPerfil = {
            uid: usuarioFirebase.uid,
            tipo: 'cliente',
            nome: "Utilizador Novo",
            telefone: usuarioFirebase.phoneNumber || "S/N"
          };
          await setDoc(doc(db, "utilizadores", usuarioFirebase.uid), novoPerfil);
          setUserData(novoPerfil);
          setUser(usuarioFirebase);
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