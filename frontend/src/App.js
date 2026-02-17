const movimentarCashback = async (tipo) => {
    // 1. Validação do PIN e campos obrigatórios
    if (pin !== "1234") { alert("PIN incorreto!"); return; }
    if (!clientId || !valorFatura || !lojaData) { alert("Dados incompletos!"); return; }
    
    // 2. Validação numérica
    const valorBase = Number(valorFatura);
    if (isNaN(valorBase) || valorBase <= 0) { alert("Valor inválido!"); return; }

    setCarregando(true);
    
    try {
      const perc = lojaData.percentagem || 0;
      let valorMovimentado = 0;
      
      if (tipo === 'desconto') {
        const saldoRef = doc(db, "clientes", clientId, "saldos_por_loja", nifLogado);
        const saldoSnap = await getDoc(saldoRef);
        const saldoAtual = saldoSnap.exists() ? saldoSnap.data().saldoDisponivel : 0;
        
        if (saldoAtual < valorBase) {
          alert("Saldo insuficiente! O cliente só tem " + saldoAtual.toFixed(2) + "€");
          setCarregando(false);
          return;
        }
        valorMovimentado = -valorBase;
      } else {
        valorMovimentado = tipo === 'emissao' ? (valorBase * perc) : -(valorBase * perc);
      }

      // 3. Atualizar saldo e registar histórico
      const saldoRef = doc(db, "clientes", clientId, "saldos_por_loja", nifLogado);
      await setDoc(saldoRef, { 
        saldoDisponivel: increment(valorMovimentado), 
        nomeLoja: lojaData.nome 
      }, { merge: true });

      await addDoc(collection(db, "historico"), {
        clienteId: clientId, lojaId: nifLogado, nomeLoja: lojaData.nome, fatura: numFatura,
        valorVenda: tipo === 'desconto' ? 0 : valorBase, 
        valorCashback: valorMovimentado, data: serverTimestamp(), tipo: tipo
      });

      alert("Operação de " + tipo + " concluída!");
      setClientId(''); setValorFatura(''); setNumFatura('');
      
      // Atualizar lista local
      const q = query(collection(db, "historico"), where("lojaId", "==", nifLogado), orderBy("data", "desc"), limit(5));
      const snap = await getDocs(q);
      const lista = [];
      snap.forEach((doc) => lista.push(doc.data()));
      setHistorico(lista);

    } catch (e) { alert("Erro: " + e.message); }
    finally { setCarregando(false); }
  };