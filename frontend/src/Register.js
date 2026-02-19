import React, { useState } from 'react';
import { auth } from './firebase'; // Importa a config que criámos
import { RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";

function Register() {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [confirmationResult, setConfirmationResult] = useState(null);
  const [message, setMessage] = useState('');

  // 1. Configurar o Recaptcha (obrigatório para SMS do Firebase)
  const setupRecaptcha = () => {
    if (!window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
        'size': 'invisible',
      });
    }
  };

  // 2. Função para enviar o SMS
  const sendSMS = (e) => {
    e.preventDefault();
    setupRecaptcha();
    const appVerifier = window.recaptchaVerifier;
    
    // Formato internacional: +351912345678
    const formattedPhone = `+351${phoneNumber}`; 
    
    signInWithPhoneNumber(auth, formattedPhone, appVerifier)
      .then((result) => {
        setConfirmationResult(result);
        setMessage('Código SMS enviado com sucesso!');
      }).catch((error) => {
        setMessage('Erro ao enviar SMS: ' + error.message);
      });
  };

  // 3. Função para verificar o código recebido
  const verifyCode = (e) => {
    e.preventDefault();
    confirmationResult.confirm(verificationCode).then((result) => {
      setMessage('Número validado com sucesso! Utilizador criado.');
      // Aqui podes redirecionar para a página principal
    }).catch((error) => {
      setMessage('Código incorreto ou expirado: ' + error.message);
    });
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2>Registo de Novo Cliente</h2>
      
      {/* Container para o Recaptcha invisível */}
      <div id="recaptcha-container"></div>

      {!confirmationResult ? (
        <form onSubmit={sendSMS}>
          <div style={{ marginBottom: '10px' }}>
            <label>Número de Telefone (sem +351):</label><br />
            <input
              type="tel"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="912345678"
              required
            />
          </div>
          <button type="submit">Enviar Código SMS</button>
        </form>
      ) : (
        <form onSubmit={verifyCode}>
          <div style={{ marginBottom: '10px' }}>
            <label>Código SMS recebido:</label><br />
            <input
              type="text"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value)}
              placeholder="123456"
              required
            />
          </div>
          <button type="submit">Verificar Código</button>
        </form>
      )}
      
      <p style={{ marginTop: '20px', color: 'blue' }}>{message}</p>
    </div>
  );
}

export default Register;    