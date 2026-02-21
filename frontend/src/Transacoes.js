import { db } from './firebase';
import { collection, addDoc, query, where, getDocs, doc, getDoc } from "firebase/firestore";

/** * Função para registar uma nova compra e gerar cashback
 * Obedece à regra de 2 dias de carência do check-list
 */
export const registarCompra = async (dados) => {
  const { clienteId, comercianteId, valorCompra, percentagem, fatura } = dados;
  
  const valorCashback = (valorCompra * (percentagem / 100)).toFixed(2);
  const dataAtual = new Date();
  
  // Regra do Check-list: Disponível após 2 dias
  const dataDisponivel = new Date();
  dataDisponivel.setDate(dataAtual.getDate() + 2);

  try {
    const docRef = await addDoc(collection(db, "movimentos"), {
      clienteId,
      comercianteId,
      tipo: 'credito', // Ganhou saldo
      valorCompra: parseFloat(valorCompra),
      valorCashback: parseFloat(valorCashback),
      fatura: fatura || 'N/A',
      dataMovimento: dataAtual.toISOString(),
      dataDisponivel: dataDisponivel.toISOString(),
      estado: 'pendente', // Fica pendente até passarem os 2 dias
      lojaNome: dados.lojaNome
    });
    return { sucesso: true, id: docRef.id, valor: valorCashback };
  } catch (error) {
    console.error("Erro ao registar compra:", error);
    return { sucesso: false, erro: error.message };
  }
};

/**
 * Função para consultar saldo por loja (Check-list: saldo só pode ser usado onde foi obtido)
 */
export const consultarSaldoPorLoja = async (clienteId, comercianteId) => {
  try {
    const q = query(
      collection(db, "movimentos"),
      where("clienteId", "==", clienteId),
      where("comercianteId", "==", comercianteId)
    );
    
    const querySnapshot = await getDocs(q);
    let saldoTotal = 0;
    let saldoDisponivel = 0;
    const dataHoje = new Date();

    querySnapshot.forEach((doc) => {
      const mov = doc.data();
      const dataDisp = new Date(mov.dataDisponivel);

      if (mov.tipo === 'credito') {
        saldoTotal += mov.valorCashback;
        if (dataHoje >= dataDisp) {
          saldoDisponivel += mov.valorCashback;
        }
      } else if (mov.tipo === 'debito') {
        saldoTotal -= mov.valorCashback;
        saldoDisponivel -= mov.valorCashback;
      }
    });

    return { 
        total: saldoTotal.toFixed(2), 
        disponivel: saldoDisponivel.toFixed(2) 
    };
  } catch (error) {
    return { total: 0, disponivel: 0 };
  }
};