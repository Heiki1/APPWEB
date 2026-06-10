function alternarMenu() {
    if (window.innerWidth <= 768) {
        fecharMenuMobile();
    } else {
        const menu = document.getElementById('menu-lateral');
        menu.classList.toggle('recolhido');
    }
}

function abrirMenuMobile() {
    document.getElementById('menu-lateral').classList.add('aberto');
    document.getElementById('overlay').classList.add('ativo');
}

function fecharMenuMobile() {
    document.getElementById('menu-lateral').classList.remove('aberto');
    document.getElementById('overlay').classList.remove('ativo');
}

let totalEntradas = 0;
let totalGastos = 0;

function mudarTela(idTelaSelecionada, btnClicado) {
    document.querySelectorAll('.tela').forEach(tela => tela.classList.remove('ativa'));
    document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('ativo'));
    
    document.getElementById(idTelaSelecionada).classList.add('ativa');
    btnClicado.classList.add('ativo');

    if (window.innerWidth <= 768) {
        fecharMenuMobile();
    }
}

function alternarTema() {
    const corpo = document.body;
    const textoTema = document.querySelector('.texto-tema');
    
    if (corpo.getAttribute('data-theme') === 'light') {
        corpo.setAttribute('data-theme', 'dark');
        textoTema.innerHTML = 'Modo Claro';
    } else {
        corpo.setAttribute('data-theme', 'light');
        textoTema.innerHTML = 'Modo Escuro';
    }
}

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

// ==================== KANBAN (DRAG AND DROP COM SUPORTE MOBILE) ====================
let cartaoArrastado = null;
let touchX, touchY;

// Função inteligente que muda a cor do cartão com base no ID da coluna em que ele caiu
function atualizarCorCartao(cartao, colunaId) {
    cartao.classList.remove('card-sucesso', 'card-andamento');
    
    if (colunaId === 'coluna-concluido') {
        cartao.classList.add('card-sucesso');
    } else if (colunaId === 'coluna-andamento') {
        cartao.classList.add('card-andamento');
    }
}

function aplicarEventosDragAndDrop(cartao) {
    // ---- EVENTOS PARA COMPUTADOR (MOUSE) ----
    cartao.addEventListener('dragstart', function() {
        cartaoArrastado = cartao;
        setTimeout(() => cartao.classList.add('arrastando'), 0);
    });

    cartao.addEventListener('dragend', function() {
        cartao.classList.remove('arrastando');
        cartaoArrastado = null;
    });

    // ---- EVENTOS PARA CELULAR (TOQUE NA TELA) ----
    cartao.addEventListener('touchstart', function(e) {
        // Se a pessoa clicou no botão "X" de excluir, o cartão não deve ser arrastado
        if (e.target.classList.contains('btn-excluir')) return; 
        
        cartaoArrastado = cartao;
        setTimeout(() => cartao.classList.add('arrastando'), 0);
    }, { passive: false });

    cartao.addEventListener('touchmove', function(e) {
        if (!cartaoArrastado) return;
        e.preventDefault(); // Previne a tela de rolar para cima e para baixo enquanto arrasta
        touchX = e.touches[0].clientX;
        touchY = e.touches[0].clientY;
    }, { passive: false });

    cartao.addEventListener('touchend', function(e) {
        if (!cartaoArrastado) return;
        cartao.classList.remove('arrastando');

        // Se o dedo se moveu na tela, calcula onde ele soltou
        if (touchX && touchY) {
            let elementoAbaixo = document.elementFromPoint(touchX, touchY);
            let zonaSoltar = elementoAbaixo ? elementoAbaixo.closest('.kanban-zona-soltar') : null;

            if (zonaSoltar) {
                zonaSoltar.appendChild(cartaoArrastado);
                atualizarCorCartao(cartaoArrastado, zonaSoltar.id);
            }
        }

        cartaoArrastado = null;
        touchX = null;
        touchY = null;
    });
}

document.querySelectorAll('.kanban-card').forEach(aplicarEventosDragAndDrop);

// Configuração das Zonas para o Computador (Mouse Drop)
document.querySelectorAll('.kanban-zona-soltar').forEach(zona => {
    zona.addEventListener('dragover', function(e) {
        e.preventDefault(); 
        this.classList.add('drag-ativo');
    });

    zona.addEventListener('dragleave', function() {
        this.classList.remove('drag-ativo');
    });

    zona.addEventListener('drop', function() {
        this.classList.remove('drag-ativo');
        if (cartaoArrastado) {
            this.appendChild(cartaoArrastado); 
            atualizarCorCartao(cartaoArrastado, this.id);
        }
    });
});

function excluirMeta(botao) {
    if (confirm("Tem certeza que deseja excluir esta meta?")) {
        botao.closest('.kanban-card').remove();
    }
}

function adicionarMeta() {
    const nomeMeta = prompt("Qual é a sua nova meta financeira?");
    if (nomeMeta && nomeMeta.trim() !== "") {
        const novoCartao = document.createElement('div');
        novoCartao.className = 'kanban-card';
        novoCartao.setAttribute('draggable', 'true');
        
        novoCartao.innerHTML = `
            <button class="btn-excluir" onclick="excluirMeta(this)" title="Excluir Meta">×</button>
            <strong>${nomeMeta}</strong>
            <p>Nova meta adicionada.</p>
        `;
        
        aplicarEventosDragAndDrop(novoCartao);
        document.getElementById('coluna-fazer').appendChild(novoCartao);
    }
}