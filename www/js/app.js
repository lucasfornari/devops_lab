document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('recado-form');
    const nomeInput = document.getElementById('recado-nome');
    const mensagemInput = document.getElementById('recado-mensagem');
    const lista = document.getElementById('recado-lista');

    function iniciais(nome) {
        return nome
            .trim()
            .split(/\s+/)
            .slice(0, 2)
            .map((parte) => parte[0].toUpperCase())
            .join('');
    }

    function criarRecadoItem(recado) {
        const li = document.createElement('li');
        li.className = 'rounded-xl border border-slate-800 bg-slate-800/40 p-4';
        li.dataset.id = recado.id;
        const data = new Date(recado.criado_em).toLocaleString('pt-BR');

        li.innerHTML = `
            <div class="view-mode flex items-start justify-between gap-3">
                <div class="flex items-start gap-3 min-w-0">
                    <div class="flex-shrink-0 w-9 h-9 rounded-full bg-primary-500/15 text-primary-400 flex items-center justify-center text-sm font-semibold recado-iniciais"></div>
                    <div class="min-w-0">
                        <div class="flex items-baseline gap-2 flex-wrap">
                            <span class="font-medium text-slate-100 recado-nome"></span>
                            <span class="text-xs text-slate-500 recado-data"></span>
                        </div>
                        <p class="text-sm text-slate-300 mt-0.5 break-words recado-mensagem"></p>
                    </div>
                </div>
                <div class="flex items-center gap-1 flex-shrink-0">
                    <button type="button" class="btn-editar w-9 h-9 flex items-center justify-center rounded-lg text-slate-400 hover:text-primary-400 hover:bg-slate-700/60 active:bg-slate-700 transition" title="Editar">
                        <i data-lucide="pencil" class="w-4 h-4"></i>
                    </button>
                    <button type="button" class="btn-excluir w-9 h-9 flex items-center justify-center rounded-lg text-slate-400 hover:text-red-400 hover:bg-slate-700/60 active:bg-slate-700 transition" title="Excluir">
                        <i data-lucide="trash-2" class="w-4 h-4"></i>
                    </button>
                </div>
            </div>
            <form class="edit-mode hidden mt-3 space-y-2">
                <input type="text" class="edit-nome w-full rounded-lg bg-slate-800 border border-slate-700 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition" maxlength="80" required>
                <textarea class="edit-mensagem w-full rounded-lg bg-slate-800 border border-slate-700 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition resize-none" maxlength="500" rows="2" required></textarea>
                <div class="flex flex-wrap gap-2">
                    <button type="submit" class="inline-flex items-center gap-1.5 rounded-lg bg-primary-600 hover:bg-primary-700 text-white text-xs font-medium px-3 py-2 transition">
                        <i data-lucide="check" class="w-3.5 h-3.5"></i> Salvar
                    </button>
                    <button type="button" class="btn-cancelar inline-flex items-center gap-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs font-medium px-3 py-2 transition">
                        <i data-lucide="x" class="w-3.5 h-3.5"></i> Cancelar
                    </button>
                </div>
            </form>
        `;
        li.querySelector('.recado-iniciais').textContent = iniciais(recado.nome);
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
                <li class="flex flex-col items-center justify-center gap-2 py-10 text-slate-500">
                    <i data-lucide="inbox" class="w-8 h-8"></i>
                    <p class="text-sm">Nenhum recado ainda. Seja o primeiro!</p>
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

    form.addEventListener('submit', async (event) => {
        event.preventDefault();
        try {
            const resposta = await fetch('/api/recados', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    nome: nomeInput.value,
                    mensagem: mensagemInput.value,
                }),
            });
            if (!resposta.ok) {
                throw new Error('falha ao enviar recado');
            }
            form.reset();
            await carregarRecados();
        } catch (err) {
            console.error(err);
            alert('Não foi possível enviar o recado.');
        }
    });

    lista.addEventListener('click', async (event) => {
        const li = event.target.closest('li[data-id]');
        if (!li) return;
        const id = li.dataset.id;

        if (event.target.closest('.btn-editar')) {
            li.querySelector('.view-mode').classList.add('hidden');
            li.querySelector('.edit-mode').classList.remove('hidden');
            return;
        }

        if (event.target.closest('.btn-cancelar')) {
            li.querySelector('.edit-mode').classList.add('hidden');
            li.querySelector('.view-mode').classList.remove('hidden');
            return;
        }

        if (event.target.closest('.btn-excluir')) {
            if (!confirm('Excluir este recado?')) return;
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
    });

    lista.addEventListener('submit', async (event) => {
        const li = event.target.closest('li[data-id]');
        if (!li) return;
        event.preventDefault();
        const id = li.dataset.id;
        const nome = li.querySelector('.edit-nome').value;
        const mensagem = li.querySelector('.edit-mensagem').value;
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
        }
    });

    if (window.lucide) {
        window.lucide.createIcons();
    }
    carregarRecados();
});
