document.addEventListener('DOMContentLoaded', () => {
    const lista = document.getElementById('recado-lista');
    const btnAbrirModal = document.getElementById('btn-abrir-modal');
    const modalOverlay = document.getElementById('modal-overlay');
    const btnFecharModal = document.getElementById('btn-fechar-modal');
    const btnCancelarModal = document.getElementById('btn-cancelar-modal');
    const addForm = document.getElementById('add-form');
    const addNome = document.getElementById('add-nome');
    const addMensagem = document.getElementById('add-mensagem');

    const PASTEIS = [
        { bg: 'bg-amber-200', text: 'text-amber-950' },
        { bg: 'bg-rose-200', text: 'text-rose-950' },
        { bg: 'bg-emerald-200', text: 'text-emerald-950' },
        { bg: 'bg-sky-200', text: 'text-sky-950' },
        { bg: 'bg-violet-200', text: 'text-violet-950' },
        { bg: 'bg-orange-200', text: 'text-orange-950' },
    ];

    function corDoRecado(id) {
        return PASTEIS[id % PASTEIS.length];
    }

    function abrirModal() {
        modalOverlay.classList.remove('hidden');
        addNome.focus();
    }

    function fecharModal() {
        modalOverlay.classList.add('hidden');
        addForm.reset();
    }

    btnAbrirModal.addEventListener('click', abrirModal);
    btnFecharModal.addEventListener('click', fecharModal);
    btnCancelarModal.addEventListener('click', fecharModal);

    modalOverlay.addEventListener('click', (event) => {
        if (event.target === modalOverlay) fecharModal();
    });

    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && !modalOverlay.classList.contains('hidden')) {
            fecharModal();
        }
    });

    addForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        try {
            const resposta = await fetch('/api/recados', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ nome: addNome.value, mensagem: addMensagem.value }),
            });
            if (!resposta.ok) {
                throw new Error('falha ao enviar recado');
            }
            fecharModal();
            await carregarRecados();
        } catch (err) {
            console.error(err);
            alert('Não foi possível enviar o recado.');
        }
    });

    function criarRecadoItem(recado) {
        const cor = corDoRecado(recado.id);
        const li = document.createElement('li');
        li.className = `group relative aspect-square rounded-lg ${cor.bg} ${cor.text} p-4 shadow-md hover:shadow-xl hover:-translate-y-0.5 transition-all flex flex-col`;
        li.dataset.id = recado.id;
        const data = new Date(recado.criado_em).toLocaleString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
        });

        li.innerHTML = `
            <button type="button" class="btn-excluir absolute top-2 right-2 w-7 h-7 flex items-center justify-center rounded-md opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 hover:bg-black/10 transition" title="Excluir">
                <i data-lucide="x" class="w-4 h-4"></i>
            </button>
            <div class="view-mode flex-1 flex flex-col min-h-0 cursor-text">
                <span class="font-semibold text-sm truncate pr-6 recado-nome"></span>
                <span class="text-[11px] opacity-60 mb-1.5 recado-data"></span>
                <p class="text-sm leading-snug whitespace-pre-wrap break-words overflow-y-auto flex-1 note-scroll recado-mensagem"></p>
            </div>
            <div class="edit-mode hidden flex-1 flex-col min-h-0 gap-1">
                <input type="text" class="edit-nome bg-transparent font-semibold text-sm outline-none pr-6 border-b border-current/20 focus:border-current/50" maxlength="80">
                <textarea class="edit-mensagem bg-transparent text-sm leading-snug outline-none resize-none flex-1 note-scroll" maxlength="500"></textarea>
            </div>
        `;
        li.querySelector('.recado-nome').textContent = recado.nome;
        li.querySelector('.recado-mensagem').textContent = recado.mensagem;
        li.querySelector('.recado-data').textContent = data;
        li.querySelector('.edit-nome').value = recado.nome;
        li.querySelector('.edit-mensagem').value = recado.mensagem;
        return li;
    }

    function renderRecados(recados) {
        lista.innerHTML = '';
        if (recados.length === 0) {
            lista.innerHTML = `
                <li class="col-span-full flex flex-col items-center justify-center gap-2 py-16 text-neutral-500">
                    <i data-lucide="sticky-note" class="w-8 h-8"></i>
                    <p class="text-sm">Nenhum recado ainda. Adicione o primeiro!</p>
                </li>
            `;
        } else {
            recados.forEach((recado) => {
                lista.appendChild(criarRecadoItem(recado));
            });
        }
        if (window.lucide) {
            window.lucide.createIcons();
        }
    }

    async function carregarRecados() {
        try {
            const resposta = await fetch('/api/recados');
            const recados = await resposta.json();
            renderRecados(recados);
        } catch (err) {
            console.error('erro ao carregar recados', err);
        }
    }

    function entrarModoEdicao(li) {
        li.querySelector('.view-mode').classList.add('hidden');
        const editMode = li.querySelector('.edit-mode');
        editMode.classList.remove('hidden');
        editMode.classList.add('flex');
        li.querySelector('.edit-mensagem').focus();
    }

    function sairModoEdicao(li) {
        const editMode = li.querySelector('.edit-mode');
        editMode.classList.add('hidden');
        editMode.classList.remove('flex');
        li.querySelector('.view-mode').classList.remove('hidden');
    }

    async function salvarEdicao(li) {
        if (!document.body.contains(li)) return;

        const id = li.dataset.id;
        const nomeOriginal = li.querySelector('.recado-nome').textContent;
        const mensagemOriginal = li.querySelector('.recado-mensagem').textContent;
        const nome = li.querySelector('.edit-nome').value.trim();
        const mensagem = li.querySelector('.edit-mensagem').value.trim();

        if (!nome || !mensagem) {
            li.querySelector('.edit-nome').value = nomeOriginal;
            li.querySelector('.edit-mensagem').value = mensagemOriginal;
            sairModoEdicao(li);
            return;
        }
        if (nome === nomeOriginal && mensagem === mensagemOriginal) {
            sairModoEdicao(li);
            return;
        }

        try {
            const resposta = await fetch(`/api/recados/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ nome, mensagem }),
            });
            if (!resposta.ok) {
                throw new Error('falha ao editar recado');
            }
            await carregarRecados();
        } catch (err) {
            console.error(err);
            alert('Não foi possível salvar a edição.');
            sairModoEdicao(li);
        }
    }

    async function excluirRecado(li) {
        if (!confirm('Excluir este recado?')) return;
        const id = li.dataset.id;
        try {
            const resposta = await fetch(`/api/recados/${id}`, { method: 'DELETE' });
            if (!resposta.ok) {
                throw new Error('falha ao excluir recado');
            }
            await carregarRecados();
        } catch (err) {
            console.error(err);
            alert('Não foi possível excluir o recado.');
        }
    }

    lista.addEventListener('click', (event) => {
        const li = event.target.closest('li[data-id]');
        if (!li) return;

        if (event.target.closest('.btn-excluir')) {
            excluirRecado(li);
            return;
        }

        if (event.target.closest('.view-mode')) {
            entrarModoEdicao(li);
        }
    });

    lista.addEventListener('focusout', (event) => {
        const li = event.target.closest('li[data-id]');
        if (!li) return;
        if (li.querySelector('.edit-mode').classList.contains('hidden')) return;
        setTimeout(() => {
            if (!li.contains(document.activeElement)) {
                salvarEdicao(li);
            }
        }, 0);
    });

    lista.addEventListener('keydown', (event) => {
        if (event.key !== 'Escape') return;
        const li = event.target.closest('li[data-id]');
        if (!li || li.querySelector('.edit-mode').classList.contains('hidden')) return;
        li.querySelector('.edit-nome').value = li.querySelector('.recado-nome').textContent;
        li.querySelector('.edit-mensagem').value = li.querySelector('.recado-mensagem').textContent;
        sairModoEdicao(li);
        event.target.blur();
    });

    if (window.lucide) {
        window.lucide.createIcons();
    }
    carregarRecados();
});
