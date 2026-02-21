import React, { useState } from 'react';
import { auth } from './firebase';
import { signInWithEmailAndPassword, RecaptchaVerifier, signInWithPhoneNumber, updatePassword } from "firebase/auth";

function Login({ aoLogar, irParaRegisto }) {
  const [telefone, setTelefone] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  
  const [confirmacao, setConfirmacao] = useState(null);
  const [codigoSMS, setCodigoSMS] = useState('');
  const [passNova, setPassNova] = useState('');
  const [etapaRecuperacao, setEtapaRecuperacao] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setMessage('A validar...');
    try {
      // Limpa o número de espaços ou prefixos para o email fictício
      const telLimpo = telefone.replace('+351', '').trim();
      const emailFicticio = `${telLimpo}@vizinhomais.com`;
      await signInWithEmailAndPassword(auth, emailFicticio, password);
      setMessage('Entrada autorizada!');
      aoLogar(); 
    } catch (error) {
      console.error(error);
      setMessage('Dados incorretos. Se não lembra da pass, use a recuperação por SMS abaixo.');
    }
  };

  const recuperarViaSMS = async () => {
    if (!telefone) {
      setMessage('Introduza o seu telemóvel (ex: +351918772065)');
      return;
    }

    try {
      if (!window.recaptchaVerifier) {
        window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
          'size': 'invisible'
        });
      }
      
      const numeroParaEnvio = telefone.includes('+') ? telefone : `+351${telefone}`;
      const confirmationResult = await signInWithPhoneNumber(auth, numeroParaEnvio, window.recaptchaVerifier);
      
      setConfirmacao(confirmationResult);
      setEtapaRecuperacao(true);
      setMessage('Use o código de teste 123456 ou aguarde o SMS.');
    } catch (error) {
      setMessage('Erro ao iniciar recuperação: ' + error.message);
    }
  };

  const confirmarEDefinirPass = async () => {
    try {
      if (passNova.length < 6) {
        setMessage('A nova password deve ter pelo menos 6 caracteres.');
        return;
      }

      await confirmacao.confirm(codigoSMS);
      
      const user = auth.currentUser;
      if (user) {
        await updatePassword(user, passNova);
        setMessage('Sucesso! Password alterada. Tente fazer login agora.');
        setEtapaRecuperacao(false);
        setConfirmacao(null);
      }
    } catch (error) {
      setMessage('Código inválido. Use o código 123456 configurado no Firebase.');
    }
  };

  const containerStyle = { padding: '20px', textAlign: 'center', fontFamily: 'sans-serif', maxWidth: '400px', margin: 'auto', border: '1px solid #eee', borderRadius: '10px', marginTop: '50px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' };
  const inputStyle = { padding: '12px', borderRadius: '5px', border: '1px solid #ddd', fontSize: '16px', marginBottom: '15px', width: '100%', boxSizing: 'border-box' };
  const btnStyle = { padding: '15px', background: '#3498db', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold', fontSize: '16px', width: '100%' };

  return (
    <div style={containerStyle}>
      <div id="recaptcha-container"></div>
      
      <h2 style={{ color: '#2c3e50' }}>Login Cartão Cliente</h2>

      {!etapaRecuperacao ? (
        <>
          <form onSubmit={handleLogin}>
            <input type="tel" placeholder="Nº de Telemóvel" value={telefone} onChange={(e) => setTelefone(e.target.value)} style={inputStyle} required />
            <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} style={inputStyle} required />
            <button type="submit" style={btnStyle}>Entrar</button>
          </form>

          <button onClick={recuperarViaSMS} style={{ marginTop: '15px', background: 'none', border: 'none', color: '#7f8c8d', cursor: 'pointer', fontSize: '13px', textDecoration: 'underline' }}>
            Esqueci-me da password (Receber SMS)
          </button>
        </>
      ) : (
        <div>
          <p style={{ fontSize: '14px', marginBottom: '10px' }}>Introduza o código (Teste: 123456)</p>
          <input type="text" placeholder="Código de 6 dígitos" value={codigoSMS} onChange={(e) => setCodigoSMS(e.target.value)} style={inputStyle} />
          <input type="password" placeholder="Nova Password" value={passNova} onChange={(e) => setPassNova(e.target.value)} style={inputStyle} />
          <button onClick={confirmarEDefinirPass} style={{ ...btnStyle, background: '#2ecc71' }}>Alterar Password</button>
          <button onClick={() => setEtapaRecuperacao(false)} style={{ marginTop: '10px', background: 'none', border: 'none', color: '#e74c3c', cursor: 'pointer' }}>Cancelar</button>
        </div>
      )}

      <hr style={{ margin: '20px 0', border: '0', borderTop: '1px solid #eee' }} />
      <button onClick={irParaRegisto} style={{ background: '#2ecc71', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}>
        Criar Novo Cartão
      </button>

      {message && <p style={{ marginTop: '20px', color: message.includes('Sucesso') ? 'green' : 'red', fontWeight: 'bold' }}>{message}</p>}
    </div>
  );
}

export default Login;