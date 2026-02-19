import React, { useState, useEffect } from 'react';
import { auth, db } from './firebase';
import { RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";

function Register({ voltar }) {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [codigoPostal, setCodigoPostal] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [confirmationResult, setConfirmationResult] = useState(null);
  const [message, setMessage] = useState('');

  // Limpar reCAPTCHA ao desmontar o componente para evitar o erro "element removed"
  useEffect(() => {
    return () => {
      if (window.recaptchaVerifier) {
        window.recaptchaVerifier.clear();
        window.recaptchaVerifier = null;
      }
    };
  }, []);

  const setupRecaptcha = () => {
    try {
      if (window.recaptchaVerifier) {
        window.recaptchaVerifier.clear();
      }
      window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
        'size': 'invisible',
      });
    } catch (error) {
      console.error("Erro ao configurar reCAPTCHA:", error);
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
        setMessage('Dados validados! Introduza o código SMS enviado.');
      }).catch((error) => {
        setMessage('Erro ao enviar SMS: ' + error.message);
        if (window.recaptchaVerifier) window.recaptchaVerifier.clear();
      });
  };

  const criarPerfilNoFirestore = async (uid, telefone) => {
    try {
      const userRef = doc(db, "clientes", telefone);
      const docSnap = await getDoc(userRef);

      if (!docSnap.exists()) {
        await setDoc(userRef, {
          uid: uid,
          nome: nome,
          email: email,
          codigoPostal: codigoPostal,
          telefone: telefone,
          pontos: 0,
          dataRegisto: new Date().toISOString(),
          historico: []
        });
        setMessage('Conta criada com sucesso! Bem-vindo(a), ' + nome);
      } else {
        setMessage('Bem-vindo de volta! O seu perfil já existia.');
      }
      
      setTimeout(() => voltar(), 3000);
    } catch (error) {
      setMessage('Erro ao gravar dados: ' + error.message);
    }
  };

  const verifyCode = (e) => {
    e.preventDefault();
    confirmationResult.confirm(verificationCode).then((result) => {
      criarPerfilNoFirestore(result.user.uid, phoneNumber);
    }).catch((error) => {
      setMessage('Código incorreto: ' + error.message);
    });
  };

  // Estilos mantidos para consistência
  const containerStyle = { padding: '20px', textAlign: 'center', fontFamily: 'sans-serif', maxWidth: '400px', margin: 'auto', border: '1px solid #eee', borderRadius: '10px', marginTop: '50px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' };
  const inputStyle = { padding: '12px', borderRadius: '5px', border: '1px solid #ddd', fontSize: '16px', marginBottom: '15px', width: '100%', boxSizing: 'border-box' };
  const btnStyle = { padding: '15px', background: '#3498db', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold', fontSize: '16px', width: '100%' };
  const labelStyle = { display: 'block', textAlign: 'left', marginBottom: '5px', fontWeight: 'bold', color: '#333' };

  return (
    <div style={containerStyle}>
      <button onClick={voltar} style={{ background: 'none', border: 'none', color: '#7f8c8d', cursor: 'pointer', float: 'left' }}>← Voltar</button>
      <br /><br />
      <h2 style={{ color: '#2c3e50' }}>Registo de Novo Cliente</h2>
      
      {/* O contentor do reCAPTCHA deve estar sempre presente */}
      <div id="recaptcha-container"></div>

      {!confirmationResult ? (
        <form onSubmit={sendSMS} style={{ display: 'flex', flexDirection: 'column' }}>
          <label style={labelStyle}>Nome Completo</label>
          <input type="text" placeholder="Ex: João Silva" value={nome} onChange={(e) => setNome(e.target.value)} style={inputStyle} required />
          
          <label style={labelStyle}>Email</label>
          <input type="email" placeholder="exemplo@email.com" value={email} onChange={(e) => setEmail(e.target.value)} style={inputStyle} required />
          
          <label style={labelStyle}>Código Postal</label>
          <input type="text" placeholder="4000-000" value={codigoPostal} onChange={(e) => setCodigoPostal(e.target.value)} style={inputStyle} required />
          
          <label style={labelStyle}>Telemóvel</label>
          <input type="tel" placeholder="912345678" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} style={inputStyle} required />
          
          <button type="submit" style={btnStyle}>Enviar Código SMS</button>
        </form>
      ) : (
        <form onSubmit={verifyCode} style={{ display: 'flex', flexDirection: 'column' }}>
          <p style={{ color: '#27ae60' }}>Enviámos um SMS para o número +351{phoneNumber}</p>
          <label style={labelStyle}>Código de 6 dígitos</label>
          <input type="text" placeholder="123456" value={verificationCode} onChange={(e) => setVerificationCode(e.target.value)} style={inputStyle} required />
          <button type="submit" style={{ ...btnStyle, background: '#2ecc71' }}>Verificar e Finalizar</button>
        </form>
      )}
      
      <p style={{ marginTop: '20px', color: 'blue', fontWeight: 'bold' }}>{message}</p>
    </div>
  );
}

export default Register;