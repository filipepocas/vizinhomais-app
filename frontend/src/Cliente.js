import React, { useState, useEffect } from 'react';
import { db } from './firebase';
import { doc, getDoc, collection, query, where, orderBy, getDocs } from "firebase/firestore";

function Cliente() {
const [id, setId] = useState(localStorage.getItem('clienteId') || '');
const [pontos, setPontos] = useState(null);
const [historico, setHistorico] = useState([]);
const [mensagem, setMensagem] = useState('');

const consultarDados = async () => {
if (!id) return alert("Insere o teu ID!");

};

useEffect(() => {
if (id) {
consultarDados();
}
}, []);

return (
<div style={{ textAlign: 'center', marginTop: '50px' }}>
<h1>Consultar Pontos</h1>
<input
type="text"
placeholder="O teu ID"
value={id}
onChange={(e) => setId(e.target.value)}
style={{ padding: '10px', marginBottom: '10px' }}
/>
<br />
<button onClick={consultarDados} style={{ padding: '10px 20px' }}>Ver Pontos</button>

);
}

export default Cliente;