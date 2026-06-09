// ==================== TELA E LÓGICA ====================
let totalEntradas = 0;
let totalGastos = 0;

function mudarTela(idTelaSelecionada, btnClicado) {
    document.querySelectorAll('.tela').forEach(tela => tela.classList.remove('ativa'));
    document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('ativo'));
    
    document.getElementById(idTelaSelecionada).classList.add('ativa');
    btnClicado.classList.add('ativo');
}

// ==================== MODO ESCURO ====================
function alternarTema() {
    const corpo = document.body;
    const btnTema = document.querySelector('.btn-tema');
    
    if (corpo.getAttribute('data-theme') === 'light') {
        corpo.setAttribute('data-theme', 'dark');
        btnTema.innerHTML = '☀️ Modo Claro';
    } else {
        corpo.setAttribute('data-theme', 'light');
        btnTema.innerHTML = '🌙 Modo Escuro';
    }
}

// ==================== ADICIONAR Lançamento ====================
document.getElementById('form-lancamento').addEventListener('submit', function(event) {
    event.preventDefault();

    const descricao = document.getElementById('descricao').value;
    const valor = parseFloat(document.getElementById('valor').value);
    const tipo = document.getElementById('tipo').value;

    if (tipo === 'Entrada') {
        totalEntradas += valor;
    } else {
        totalGastos += valor;
    }

    const saldo = totalEntradas - totalGastos;

    document.getElementById('resumo-entradas').innerText = `R$ ${totalEntradas.toFixed(2).replace('.', ',')}`;
    document.getElementById('resumo-gastos').innerText = `R$ ${totalGastos.toFixed(2).replace('.', ',')}`;
    document.getElementById('resumo-saldo').innerText = `R$ ${saldo.toFixed(2).replace('.', ',')}`;

    const listaHistorico = document.getElementById('lista-historico');
    const itemVazio = document.querySelector('.item-vazio');
    if (itemVazio) itemVazio.remove();

    const classeCor = tipo === 'Entrada' ? 'positivo' : 'negativo';
    const sinal = tipo === 'Entrada' ? '+' : '-';

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

    this.reset();
});

// ==================== KANBAN (DRAG AND DROP) ====================
let cartaoArrastado = null;

// Ativa o Drag and Drop em um cartão específico
function aplicarEventosDragAndDrop(cartao) {
    cartao.addEventListener('dragstart', function() {
        cartaoArrastado = cartao;
        setTimeout(() => cartao.classList.add('arrastando'), 0);
    });

    cartao.addEventListener('dragend', function() {
        cartao.classList.remove('arrastando');
        cartaoArrastado = null;
    });
}

// Aplica aos cartões iniciais da tela
document.querySelectorAll('.kanban-card').forEach(aplicarEventosDragAndDrop);

// Configura as colunas para receberem os cartões
document.querySelectorAll('.kanban-zona-soltar').forEach(zona => {
    zona.addEventListener('dragover', function(e) {
        e.preventDefault(); // Necessário para permitir o drop
        this.classList.add('drag-ativo');
    });

    zona.addEventListener('dragleave', function() {
        this.classList.remove('drag-ativo');
    });

    zona.addEventListener('drop', function() {
        this.classList.remove('drag-ativo');
        if (cartaoArrastado) {
            this.appendChild(cartaoArrastado); // Move o card do HTML para a nova coluna
            
            // Muda cor lateral se foi para "Concluído"
            if (this.id === 'coluna-concluido') {
                cartaoArrastado.classList.add('card-sucesso');
            } else {
                cartaoArrastado.classList.remove('card-sucesso');
            }
        }
    });
});

// Criar novo cartão
function adicionarMeta() {
    const nomeMeta = prompt("Qual é a sua nova meta financeira?");
    if (nomeMeta) {
        const novoCartao = document.createElement('div');
        novoCartao.className = 'kanban-card';
        novoCartao.setAttribute('draggable', 'true');
        novoCartao.innerHTML = `
            <strong>${nomeMeta}</strong>
            <p>Nova meta adicionada.</p>
        `;
        
        // Aplica lógica de arrastar ao novo card
        aplicarEventosDragAndDrop(novoCartao);
        document.getElementById('coluna-fazer').appendChild(novoCartao);
    }
}