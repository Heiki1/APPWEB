/* ==========================================================================
   1. CONTROLE DE MENU (DESKTOP E MOBILE)
   ========================================================================== */
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


/* ==========================================================================
   2. NAVEGAÇÃO E DADOS GLOBAIS
   ========================================================================== */
let totalEntradas = 0;
let totalGastos = 0;
let gastosFixos = 0;
let gastosVariaveis = 0;

function mudarTela(idTelaSelecionada, btnClicado) {
    document.querySelectorAll('.tela').forEach(tela => tela.classList.remove('ativa'));
    document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('ativo'));
    
    document.getElementById(idTelaSelecionada).classList.add('ativa');
    btnClicado.classList.add('ativo');

    if (window.innerWidth <= 768) {
        fecharMenuMobile();
    }
}


/* ==========================================================================
   3. TEMA CLARO E ESCURO
   ========================================================================== */
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


/* ==========================================================================
   4. ATUALIZAÇÃO DOS GRÁFICOS
   ========================================================================== */
function atualizarGraficos() {
    const donutChart = document.getElementById('grafico-despesas');
    const pctFixoEl = document.getElementById('pct-fixo');
    const pctVarEl = document.getElementById('pct-variavel');
    const textoDonut = document.getElementById('texto-donut');

    if (totalGastos > 0) {
        const pctFixo = Math.round((gastosFixos / totalGastos) * 100);
        const pctVariavel = 100 - pctFixo;

        pctFixoEl.innerText = `${pctFixo}%`;
        pctVarEl.innerText = `${pctVariavel}%`;
        textoDonut.innerText = `R$ ${totalGastos.toFixed(2).replace('.', ',')}`;

        donutChart.style.background = `conic-gradient(var(--cor-fixo) 0% ${pctFixo}%, var(--cor-alerta) ${pctFixo}% 100%)`;
    }

    const barEntradas = document.getElementById('bar-entradas');
    const barSaidas = document.getElementById('bar-saidas');
    const lblEntradas = document.getElementById('lbl-entradas');
    const lblSaidas = document.getElementById('lbl-saidas');

    lblEntradas.innerText = `R$ ${totalEntradas.toFixed(2).replace('.', ',')}`;
    lblSaidas.innerText = `R$ ${totalGastos.toFixed(2).replace('.', ',')}`;

    const maiorValor = Math.max(totalEntradas, totalGastos);

    if (maiorValor > 0) {
        const larguraEntradas = (totalEntradas / maiorValor) * 100;
        const larguraSaidas = (totalGastos / maiorValor) * 100;

        barEntradas.style.width = `${larguraEntradas}%`;
        barSaidas.style.width = `${larguraSaidas}%`;
    }
}


/* ==========================================================================
   5. LÓGICA DE LANÇAMENTO (FORMULÁRIO)
   ========================================================================== */
document.getElementById('form-lancamento').addEventListener('submit', function(event) {
    event.preventDefault(); 

    const descricao = document.getElementById('descricao').value; 
    const valor = parseFloat(document.getElementById('valor').value); 
    const tipo = document.getElementById('tipo').value; 

    if (tipo === 'Gasto Fixo') {
        gastosFixos += valor;
        totalGastos += valor;
    } else if (tipo === 'Gasto Variável') {
        gastosVariaveis += valor;
        totalGastos += valor;
    } else {
        totalEntradas += valor;
    }

    const saldo = totalEntradas - totalGastos;

    document.getElementById('resumo-entradas').innerText = `R$ ${totalEntradas.toFixed(2).replace('.', ',')}`;
    document.getElementById('resumo-gastos').innerText = `R$ ${totalGastos.toFixed(2).replace('.', ',')}`;
    document.getElementById('resumo-saldo').innerText = `R$ ${saldo.toFixed(2).replace('.', ',')}`;

    atualizarGraficos();

    const listaHistorico = document.getElementById('lista-historico');
    const itemVazio = document.querySelector('.item-vazio');
    if (itemVazio) {
        itemVazio.remove();
    }

    let classeCor = '';
    let sinal = '';
    
    if (tipo === 'Entrada') {
        classeCor = 'positivo';
        sinal = '+';
    } else {
        classeCor = 'negativo';
        sinal = '-';
    }

    // O atributo data-tipo="${tipo}" é crucial para o filtro funcionar
    listaHistorico.innerHTML += `
        <li class="item-resultado" data-tipo="${tipo}">
            <div class="info-resultado">
                <strong>${descricao}</strong><br>
                <small>${tipo}</small>
            </div>
            <div class="valor-resultado ${classeCor}">
                ${sinal} R$ ${valor.toFixed(2).replace('.', ',')}
            </div>
        </li>
    `;

    // Garante que o item recém adicionado respeite o filtro que já está ativo
    filtrarHistorico();

    this.reset();
});


/* ==========================================================================
   6. LÓGICA DO KANBAN (DRAG & DROP E TOQUE PARA MOBILE)
   ========================================================================== */
let cartaoArrastado = null; 
let touchX, touchY; 

function atualizarCorCartao(cartao, colunaId) {
    cartao.classList.remove('card-sucesso', 'card-andamento');
    
    if (colunaId === 'coluna-concluido') {
        cartao.classList.add('card-sucesso'); 
    } else if (colunaId === 'coluna-andamento') {
        cartao.classList.add('card-andamento'); 
    }
}

function aplicarEventosDragAndDrop(cartao) {
    cartao.addEventListener('dragstart', function() {
        cartaoArrastado = cartao;
        setTimeout(() => cartao.classList.add('arrastando'), 0); 
    });

    cartao.addEventListener('dragend', function() {
        cartao.classList.remove('arrastando');
        cartaoArrastado = null;
    });

    cartao.addEventListener('touchstart', function(e) {
        if (e.target.classList.contains('btn-excluir')) { return; }
        
        cartaoArrastado = cartao;
        setTimeout(() => cartao.classList.add('arrastando'), 0);
    }, { passive: false }); 

    cartao.addEventListener('touchmove', function(e) {
        if (!cartaoArrastado) { return; }
        e.preventDefault(); 
        
        touchX = e.touches[0].clientX;
        touchY = e.touches[0].clientY;
    }, { passive: false });

    cartao.addEventListener('touchend', function(e) {
        if (!cartaoArrastado) { return; }
        cartao.classList.remove('arrastando');

        if (touchX && touchY) {
            let elementoAbaixo = document.elementFromPoint(touchX, touchY);
            let zonaSoltar = elementoAbaixo ? elementoAbaixo.closest('.kanban-zona-soltar') : null;

            if (zonaSoltar) {
                zonaSoltar.appendChild(cartaoArrastado);
                atualizarCorCartao(cartaoArrastado, zonaSoltar.id);
            }
        }
        cartaoArrastado = null; touchX = null; touchY = null;
    });
}

document.querySelectorAll('.kanban-card').forEach(aplicarEventosDragAndDrop);

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


/* ==========================================================================
   7. LÓGICA DO MODAL DE NOVA META
   ========================================================================== */
function abrirModalMeta() {
    document.getElementById('modal-meta').classList.add('ativo');
}

function fecharModalMeta() {
    document.getElementById('modal-meta').classList.remove('ativo');
    document.getElementById('form-meta').reset(); 
}

document.getElementById('form-meta').addEventListener('submit', function(event) {
    event.preventDefault(); 
    
    const nomeMeta = document.getElementById('nome-meta').value;
    const valorMeta = parseFloat(document.getElementById('valor-meta').value);
    const prazoMeta = document.getElementById('prazo-meta').value;
    
    const novoCartao = document.createElement('div');
    novoCartao.className = 'kanban-card'; 
    novoCartao.setAttribute('draggable', 'true'); 
    
    novoCartao.innerHTML = `
        <button class="btn-excluir" onclick="excluirMeta(this)" title="Excluir Meta">×</button>
        <strong>${nomeMeta}</strong>
        <p>Meta: R$ ${valorMeta.toFixed(2).replace('.', ',')}</p>
        <p style="font-size: 12px; color: var(--texto-secundario); margin-top: 5px;">Prazo: ${prazoMeta}</p>
    `;
    
    aplicarEventosDragAndDrop(novoCartao);
    document.getElementById('coluna-fazer').appendChild(novoCartao);
    
    fecharModalMeta();
});


/* ==========================================================================
   8. LÓGICA DE FILTRO DO HISTÓRICO (NOVO)
   ========================================================================== */
/**
 * Oculta ou exibe os lançamentos baseando-se no tipo selecionado no <select>
 */
function filtrarHistorico() {
    const filtroSelecionado = document.getElementById('filtro-tipo').value;
    const itensHistorico = document.querySelectorAll('#lista-historico .item-resultado');

    // Estrutura de repetição para checar cada item individualmente
    itensHistorico.forEach(item => {
        const tipoDoItem = item.getAttribute('data-tipo');
        
        // Estrutura condicional exigida
        if (filtroSelecionado === 'Todos' || filtroSelecionado === tipoDoItem) {
            item.style.display = 'flex'; // Exibe o item normalmente
        } else {
            item.style.display = 'none'; // Esconde o item se não corresponder
        }
    });
}