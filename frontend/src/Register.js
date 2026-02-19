import React, { useState } from 'react';
import { auth, db } from './firebase'; // Importamos também o db
import { RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore"; // Ferramentas para gravar dados

function Register({ voltar }) {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [confirmationResult, setConfirmationResult] = useState(null);
  const [message, setMessage] = useState('');

  const setupRecaptcha = () => {
    if (!window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
        'size': 'invisible',
      });
    }
  };

  const sendSMS = (e) => {
    e.preventDefault();
    setupRecaptcha();
    const appVerifier = window.recaptchaVerifier;
    const formattedPhone = `+351${phoneNumber}`; 
    
    signInWithPhoneNumber(auth, formattedPhone, appVerifier)
      .then((result) => {
        setConfirmationResult(result);
        setMessage('Código SMS enviado com sucesso!');
      }).catch((error) => {
        setMessage('Erro ao enviar SMS: ' + error.message);
      });
  };

  // FUNÇÃO PARA CRIAR O CLIENTE NA BASE DE DADOS
  const criarPerfilNoFirestore = async (uid, telefone) => {
    try {
      const userRef = doc(db, "clientes", telefone); // Usamos o telefone como ID único
      const docSnap = await getDoc(userRef);

      if (!docSnap.exists()) {
        await setDoc(userRef, {
          uid: uid,
          telefone: telefone,
          pontos: 0,
          dataRegisto: new Date().toISOString(),
          historico: []
        });
        setMessage('Conta criada e perfil configurado!');
      } else {
        setMessage('Bem-vindo de volta! Já tinha uma conta ativa.');
      }
      
      // Espera 2 segundos e volta para o login
      setTimeout(() => voltar(), 2000);

    } catch (error) {
      setMessage('Erro ao criar perfil: ' + error.message);
    }
  };

  const verifyCode = (e) => {
    e.preventDefault();
    confirmationResult.confirm(verificationCode).then((result) => {
      const user = result.user;
      setMessage('Número validado com sucesso!');
      // Chama a função para gravar na base de dados
      criarPerfilNoFirestore(user.uid, phoneNumber);
    }).catch((error) => {
      setMessage('Código incorreto ou expirado: ' + error.message);
    });
  };

  return (
    <div style={{ padding: '20px', textAlign: 'center', fontFamily: 'sans-serif' }}>
      <button onClick={voltar} style={{ background: 'none', border: 'none', color: '#7f8c8d', cursor: 'pointer' }}>← Voltar</button>
      <h2>Registo de Novo Cliente</h2>
      
      <div id="recaptcha-container"></div>

      {!confirmationResult ? (
        <form onSubmit={sendSMS}>
          <div style={{ marginBottom: '10px' }}>
            <label>Número de Telefone:</label><br />
            <input
              type="tel"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="912345678"
              style={{ padding: '10px', width: '80%', marginTop: '5px' }}
              required
            />
          </div>
          <button type="submit" style={btnStyle}>Enviar Código SMS</button>
        </form>
      ) : (
        <form onSubmit={verifyCode}>
          <div style={{ marginBottom: '10px' }}>
            <label>Código SMS (6 dígitos):</label><br />
            <input
              type="text"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value)}
              placeholder="123456"
              style={{ padding: '10px', width: '80%', marginTop: '5px' }}
              required
            />
          </div>
          <button type="submit" style={{ ...btnStyle, background: '#2ecc71' }}>Verificar e Finalizar</button>
        </form>
      )}
      
      <p style={{ marginTop: '20px', color: 'blue', fontWeight: 'bold' }}>{message}</p>
    </div>
  );
}

const btnStyle = { padding: '12px 20px', background: '#3498db', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' };

export default Register;