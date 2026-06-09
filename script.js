// Variáveis de Estado (Iniciam Zeradas)
let totalEntradas = 0;
let totalGastos = 0;

// Função para Mudar de Tela via Menu
function mudarTela(idTelaSelecionada, btnClicado) {
    // Esconde todas as telas
    document.querySelectorAll('.tela').forEach(tela => tela.classList.remove('ativa'));
    // Remove classe ativo dos botões
    document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('ativo'));
    
    // Mostra a tela certa e marca o botão
    document.getElementById(idTelaSelecionada).classList.add('ativa');
    btnClicado.classList.add('ativo');
}

// Lógica de Adição de Lançamentos
document.getElementById('form-lancamento').addEventListener('submit', function(event) {
    event.preventDefault(); // Evita que a página recarregue

    // Pega os valores digitados
    const descricao = document.getElementById('descricao').value;
    const valor = parseFloat(document.getElementById('valor').value);
    const tipo = document.getElementById('tipo').value;

    // Atualiza os Totais
    if (tipo === 'Entrada') {
        totalEntradas += valor;
    } else {
        totalGastos += valor;
    }

    // Calcula o Saldo
    const saldo = totalEntradas - totalGastos;

    // Atualiza na Tela (Dashboard)
    document.getElementById('resumo-entradas').innerText = `R$ ${totalEntradas.toFixed(2).replace('.', ',')}`;
    document.getElementById('resumo-gastos').innerText = `R$ ${totalGastos.toFixed(2).replace('.', ',')}`;
    document.getElementById('resumo-saldo').innerText = `R$ ${saldo.toFixed(2).replace('.', ',')}`;

    // Adiciona o item no Histórico
    const listaHistorico = document.getElementById('lista-historico');
    // Remove a mensagem de "vazio" se for o primeiro item
    const itemVazio = document.querySelector('.item-vazio');
    if (itemVazio) itemVazio.remove();

    // Cria a classe de cor dependendo do tipo
    const classeCor = tipo === 'Entrada' ? 'positivo' : 'negativo';
    const sinal = tipo === 'Entrada' ? '+' : '-';

    // Insere no HTML do histórico
    listaHistorico.innerHTML += `
        <li class="item-resultado">
            <div class="info-resultado">
                <strong>${descricao}</strong><br>
                <small>${tipo}</small>
            </div>
            <div class="valor-resultado ${classeCor}">
                ${sinal} R$ ${valor.toFixed(2).replace('.', ',')}
            </div>
        </li>
    `;

    // Limpa o formulário
    this.reset();
});

// Lógica Simples para adicionar Meta no Planner
function adicionarMeta() {
    const nomeMeta = prompt("Qual é a sua nova meta financeira?");
    if (nomeMeta) {
        document.getElementById('coluna-fazer').innerHTML += `
            <div class="kanban-card">
                <strong>${nomeMeta}</strong>
                <p>Nova meta adicionada.</p>
            </div>
        `;
    }
}