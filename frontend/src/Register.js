import React, { useState } from 'react';

function Register() {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');

  const handleRegister = (e) => {
    e.preventDefault();
    console.log('Dados de registo:', { phoneNumber, password });
    // A lógica do SMS (Ponto 2) virá aqui mais tarde
    alert('Funcionalidade de SMS ainda não implementada!');
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2>Registo de Novo Cliente</h2>
      <form onSubmit={handleRegister}>
        <div style={{ marginBottom: '10px' }}>
          <label>Número de Telefone:</label><br />
          <input
            type="tel"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            placeholder="912345678"
            required
          />
        </div>
        <div style={{ marginBottom: '10px' }}>
          <label>Password:</label><br />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit">Enviar Código SMS</button>
      </form>
    </div>
  );
}

export default Register;