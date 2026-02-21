import React, { useState } from 'react';
import { auth } from './firebase';
import { signInWithEmailAndPassword, RecaptchaVerifier, signInWithPhoneNumber, updatePassword } from "firebase/auth";

function Login({ aoLogar, irParaRegisto }) {
  const [telefone, setTelefone] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  
  // Estados para a recuperação por SMS
  const [confirmacao, setConfirmacao] = useState(null);
  const [codigoSMS, setCodigoSMS] = useState('');
  const [passNova, setPassNova] = useState('');
  const [etapaRecuperacao, setEtapaRecuperacao] = useState(false);

  // Função para Login Normal
  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const emailFicticio = `${telefone}@vizinhomais.com`;
      await signInWithEmailAndPassword(auth, emailFicticio, password);
      setMessage('Entrada autorizada!');
      aoLogar(); 
    } catch (error) {
      setMessage('Dados incorretos. Verifique o telemóvel e a password.');
    }
  };

  // Função para iniciar Recuperação por SMS
  const recuperarViaSMS = async () => {
    if (!telefone) {
      setMessage('Introduza o seu telemóvel primeiro.');
      return;
    }

    try {
      // Configura o ReCAPTCHA invisível
      const recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
        'size': 'invisible'
      });
      
      const numeroCompleto = `+351${telefone}`;
      const confirmationResult = await signInWithPhoneNumber(auth, numeroCompleto, recaptchaVerifier);
      
      setConfirmacao(confirmationResult);
      setEtapaRecuperacao(true);
      setMessage('Código de verificação enviado por SMS!');
    } catch (error) {
      setMessage('Erro ao enviar SMS: ' + error.message);
    }
  };

  // Função para confirmar código e gravar nova password
  const confirmarEDefinirPass = async () => {
    try {
      if (passNova.length < 6) {
        setMessage('A nova password deve ter pelo menos 6 caracteres.');
        return;
      }

      // Valida o código SMS recebido
      await confirmacao.confirm(codigoSMS);
      
      // Com o utilizador validado pela sessão de SMS, alteramos a password
      const user = auth.currentUser;
      if (user) {
        await updatePassword(user, passNova);
        setMessage('Password alterada com sucesso! Já pode fazer login.');
        setEtapaRecuperacao(false);
        setConfirmacao(null);
        setPassNova('');
        setCodigoSMS('');
      }
    } catch (error) {
      setMessage('Código inválido ou erro ao processar alteração.');
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
          <p style={{ fontSize: '14px', marginBottom: '10px' }}>Introduza o código de 6 dígitos enviado para <strong>+351{telefone}</strong></p>
          <input type="text" placeholder="Código SMS" value={codigoSMS} onChange={(e) => setCodigoSMS(e.target.value)} style={inputStyle} />
          <input type="password" placeholder="Defina a Nova Password" value={passNova} onChange={(e) => setPassNova(e.target.value)} style={inputStyle} />
          <button onClick={confirmarEDefinirPass} style={{ ...btnStyle, background: '#2ecc71' }}>Validar e Alterar Password</button>
          <button onClick={() => setEtapaRecuperacao(false)} style={{ marginTop: '10px', background: 'none', border: 'none', color: '#e74c3c', cursor: 'pointer' }}>Cancelar</button>
        </div>
      )}

      <hr style={{ margin: '20px 0', border: '0', borderTop: '1px solid #eee' }} />
      <button onClick={irParaRegisto} style={{ background: '#2ecc71', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}>
        Criar Novo Cartão
      </button>

      {message && <p style={{ marginTop: '20px', color: message.includes('sucesso') || message.includes('enviado') ? 'green' : 'red', fontWeight: 'bold' }}>{message}</p>}
    </div>
  );
}

export default Login;