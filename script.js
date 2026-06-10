
/**
 * Alteração da exibição do menu lateral.
 */
function alternarMenu() {
    // Se a largura da janela for menor ou igual a 768px (celular/tablet)
    if (window.innerWidth <= 768) {
        fecharMenuMobile(); // O botão age como um "fechar" do menu flutuante
    } else {
        // No computador, ele apenas adiciona/remove a classe 'recolhido' para encolher a barra
        const menu = document.getElementById('menu-lateral');
        menu.classList.toggle('recolhido');
    }
}

/**
 * Abertura do menu lateral no mobile e ativação do fundo desfocado (overlay do css)
 */
function abrirMenuMobile() {
    document.getElementById('menu-lateral').classList.add('aberto');
    document.getElementById('overlay').classList.add('ativo');
}

/**
 * Fecha o menu lateral no celular e desativa o fundo desfocado.
 */
function fecharMenuMobile() {
    document.getElementById('menu-lateral').classList.remove('aberto');
    document.getElementById('overlay').classList.remove('ativo');
}


// Variáveis globais que iniciam zeradas e guardam os valores somados.
let totalEntradas = 0;
let totalGastos = 0;

/**
 * Alterna entre as abas do sistema (Dashboard, Histórico, Planner).
 * @param {string} idTelaSelecionada - O ID da seção HTML que deve aparecer.
 * @param {HTMLElement} btnClicado - O botão do menu que foi clicado (fica marcado).
 */
function mudarTela(idTelaSelecionada, btnClicado) {
    // 1. Esconde todas as telas removendo a classe 'ativa'
    document.querySelectorAll('.tela').forEach(tela => tela.classList.remove('ativa'));

    // 2. Remove o visual de "selecionado" de todos os botões do menu
    document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('ativo'));
    
    // 3. Mostra a tela desejada e marca o botão correspondente
    document.getElementById(idTelaSelecionada).classList.add('ativa');
    btnClicado.classList.add('ativo');

    // Se estiver no celular, fecha o menu automaticamente após escolher a tela
    if (window.innerWidth <= 768) {
        fecharMenuMobile();
    }
}

 /**
 * Altera o atributo 'data-theme' da tag <body> entre 'light' e 'dark'. 
 * O CSS lê esse atributo e muda todas as variáveis de cor automaticamente.
 */
function alternarTema() {
    const corpo = document.body;
    const textoTema = document.querySelector('.texto-tema'); // O texto do botão
    
    // Se estiver claro, muda para escuro e altera o texto do botão
    if (corpo.getAttribute('data-theme') === 'light') {
        corpo.setAttribute('data-theme', 'dark');
        textoTema.innerHTML = 'Modo Claro';
    } else {
        // Se estiver escuro, volta para o claro
        corpo.setAttribute('data-theme', 'light');
        textoTema.innerHTML = 'Modo Escuro';
    }
}

/**
 * Captura o evento de envio ('submit') do formulário para evitar que a página recarregue.
 */
document.getElementById('form-lancamento').addEventListener('submit', function(event) {
    event.preventDefault(); // Impede o recarregamento padrão do formulário

    // Coleta os valores digitados pelo usuário
    const descricao = document.getElementById('descricao').value;
    const valor = parseFloat(document.getElementById('valor').value);
    const tipo = document.getElementById('tipo').value;

    // Verifica se é entrada ou gasto e soma na variável global correspondente
    if (tipo === 'Entrada') {
        totalEntradas += valor;
    } else {
        totalGastos += valor;
    }

    // Calcula o saldo atual
    const saldo = totalEntradas - totalGastos;

    // Atualiza os valores visíveis nos cards da tela inicial
    document.getElementById('resumo-entradas').innerText = `R$ ${totalEntradas.toFixed(2).replace('.', ',')}`;
    document.getElementById('resumo-gastos').innerText = `R$ ${totalGastos.toFixed(2).replace('.', ',')}`;
    document.getElementById('resumo-saldo').innerText = `R$ ${saldo.toFixed(2).replace('.', ',')}`;

    // Captura a lista do histórico
    const listaHistorico = document.getElementById('lista-historico');
    
    // Se existir a mensagem "Nenhum lançamento", ela é removida
    const itemVazio = document.querySelector('.item-vazio');
    if (itemVazio) itemVazio.remove();

    // Define a cor e o sinal (+ ou -) baseado no tipo selecionado
    const classeCor = tipo === 'Entrada' ? 'positivo' : 'negativo';
    const sinal = tipo === 'Entrada' ? '+' : '-';

    // Injeta o novo HTML com os dados na lista de histórico
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

    // Limpa os campos do formulário para o próximo uso
    this.reset();
}); 

let cartaoArrastado = null; // Guarda o cartão que está sendo segurado
let touchX, touchY; // Guarda as coordenadas do dedo na tela do celular

/**
 * Atualiza a cor lateral do cartão dependendo da coluna em que ele foi solto.
 * @param {HTMLElement} cartao - O cartão HTML manipulado.
 * @param {string} colunaId - O ID da coluna onde o cartão caiu.
 */
function atualizarCorCartao(cartao, colunaId) {
    cartao.classList.remove('card-sucesso', 'card-andamento');
    
    // Adiciona a classe visual correspondente
    if (colunaId === 'coluna-concluido') {
        cartao.classList.add('card-sucesso'); // Verde
    } else if (colunaId === 'coluna-andamento') {
        cartao.classList.add('card-andamento'); // Amarelo
    }
}

/**
 * Aplica os eventos de mouse (computador) e toque (celular) em um cartão específico.
 * @param {HTMLElement} cartao - O elemento do cartão que receberá as interações.
 */
function aplicarEventosDragAndDrop(cartao) {
    
    // ---- EVENTOS PARA COMPUTADOR (MOUSE) ----
    
    // Disparado no momento exato em que o mouse clica e começa a puxar
    cartao.addEventListener('dragstart', function() {
        cartaoArrastado = cartao;
        setTimeout(() => cartao.classList.add('arrastando'), 0); // Deixa o card meio transparente
    });

    // Disparado quando o mouse solta o clique
    cartao.addEventListener('dragend', function() {
        cartao.classList.remove('arrastando');
        cartaoArrastado = null;
    });

    // ---- EVENTOS PARA CELULAR (TOQUE NA TELA) ----
    
    // Quando o dedo toca o cartão
    cartao.addEventListener('touchstart', function(e) {
        // Se a pessoa clicou no botão "X" de excluir, ignoramos a função de arrastar
        if (e.target.classList.contains('btn-excluir')) return; 
        
        cartaoArrastado = cartao;
        setTimeout(() => cartao.classList.add('arrastando'), 0);
    }, { passive: false });

    // Enquanto o dedo desliza pela tela
    cartao.addEventListener('touchmove', function(e) {
        if (!cartaoArrastado) return;
        e.preventDefault(); // Impede a tela inteira de rolar para baixo enquanto o card está sendo puxado
        
        // Salva as coordenadas X e Y atuais do dedo
        touchX = e.touches[0].clientX;
        touchY = e.touches[0].clientY;
    }, { passive: false });

    // Quando o dedo sai da tela
    cartao.addEventListener('touchend', function(e) {
        if (!cartaoArrastado) return;
        cartao.classList.remove('arrastando');

        // Se o dedo registrou movimento
        if (touchX && touchY) {
            // Verifica qual elemento HTML estava exatamente embaixo do dedo ao soltar
            let elementoAbaixo = document.elementFromPoint(touchX, touchY);
            // Procura a zona de soltar (coluna) mais próxima desse ponto
            let zonaSoltar = elementoAbaixo ? elementoAbaixo.closest('.kanban-zona-soltar') : null;

            // Se soltou em cima de uma coluna válida, move o cartão para lá e muda a cor do cartão
            if (zonaSoltar) {
                zonaSoltar.appendChild(cartaoArrastado);
                atualizarCorCartao(cartaoArrastado, zonaSoltar.id);
            }
        }

        // Limpa os registros de movimento
        cartaoArrastado = null;
        touchX = null;
        touchY = null;
    });
}

// Ao abrir a página, aplica essa função de "arrasto" a todos os cartões que já existem no HTML
document.querySelectorAll('.kanban-card').forEach(aplicarEventosDragAndDrop);

/**
 * Configuração das colunas (Zonas de soltar) para o Computador (Eventos Drag over/leave/drop).
 */
document.querySelectorAll('.kanban-zona-soltar').forEach(zona => {
    
    // Quando um cartão passa por cima da coluna
    zona.addEventListener('dragover', function(e) {
        e.preventDefault(); // Necessário para autorizar o cartão a ser solto aqui
        this.classList.add('drag-ativo'); // Adiciona a borda
    });

    // Quando o cartão sai de cima da coluna sem ser solto
    zona.addEventListener('dragleave', function() {
        this.classList.remove('drag-ativo'); // Remove a borda
    });

    // Quando o cartão é solto (mouse liberado) dentro da coluna
    zona.addEventListener('drop', function() {
        this.classList.remove('drag-ativo');
        
        if (cartaoArrastado) {
            this.appendChild(cartaoArrastado); // Transfere o HTML do card para esta coluna
            atualizarCorCartao(cartaoArrastado, this.id); // Aplica a cor correspondente à coluna onde o cartão foi solto
        }
    });
});

/**
 * Exclui a meta (cartão) selecionada no Kanban.
 * @param {HTMLElement} botao - O botão (x) que foi clicado.
 */
function excluirMeta(botao) {
    // Dispara um alerta nativo do navegador para confirmação
    if (confirm("Tem certeza que deseja excluir esta meta?")) {
        // Encontra o "pai" mais próximo que seja o cartão inteiro e o remove da tela
        botao.closest('.kanban-card').remove();
    }
}

/**
 * Adiciona uma nova meta ao Kanban interagindo com o usuário.
 */
function adicionarMeta() {
    // Abre uma caixa de texto solicitando o nome da meta
    const nomeMeta = prompt("Qual é a sua nova meta financeira?");
    
    // Verifica se a pessoa digitou algo válido (não cancelou ou deixou vazio)
    if (nomeMeta && nomeMeta.trim() !== "") {
        
        // Cria um novo elemento de "div" na memória do navegador
        const novoCartao = document.createElement('div');
        novoCartao.className = 'kanban-card'; // Adiciona a classe padrão
        novoCartao.setAttribute('draggable', 'true'); // Permite ser arrastado no computador
        
        // Injeta o HTML interno (botão de excluir e título)
        novoCartao.innerHTML = `
            <button class="btn-excluir" onclick="excluirMeta(this)" title="Excluir Meta">×</button>
            <strong>${nomeMeta}</strong>
            <p>Nova meta adicionada.</p>
        `;
        
        // Passa o novo cartão pela função para habilitar o Drag & Drop nele
        aplicarEventosDragAndDrop(novoCartao);
        
        // Joga o cartão finalizado na coluna "A Fazer"
        document.getElementById('coluna-fazer').appendChild(novoCartao);
    }
}