// script.js - gerencia agendamentos via localStorage e painel admin
(function(){
  // utilidades
  function qs(sel){ return document.querySelector(sel); }
  function qsa(sel){ return Array.from(document.querySelectorAll(sel)); }
  function nowYear(){ return new Date().getFullYear(); }

  // setar anos nos footers
  qsa('#year,#year2,#year3').forEach(el => { if(el) el.textContent = nowYear(); });

  // storage
  const KEY = 'linos_agendamentos_v1';
  function loadAll(){
    try { return JSON.parse(localStorage.getItem(KEY) || '[]'); }
    catch(e){ return []; }
  }
  function saveAll(list){ localStorage.setItem(KEY, JSON.stringify(list)); }

  // render lista pública
  function renderPublicList(){
    const container = qs('#agend-list');
    if(!container) return;
    const list = loadAll().filter(a => new Date(a.data + 'T' + a.hora) >= new Date());
    container.innerHTML = '';
    if(list.length === 0){ container.innerHTML = '<p class="small">Nenhum agendamento futuro.</p>'; return; }
    list.slice(0,8).forEach(a => {
      const div = document.createElement('div');
      div.className = 'card';
      div.innerHTML = `<strong>${a.nome}</strong><div class="small">${a.servico}</div><div class="small">${a.data} • ${a.hora}</div>`;
      container.appendChild(div);
    });
  }

  // formulário de agendamento
  const form = qs('#form-agenda');
  if(form){
    form.addEventListener('submit', function(e){
      e.preventDefault();
      const nome = qs('#nome').value.trim();
      const servico = qs('#servico').value;
      const data = qs('#data').value;
      const hora = qs('#hora').value;
      if(!nome || !data || !hora){ alert('Preencha todos os campos.'); return; }
      const list = loadAll();
      list.push({ id: Date.now(), nome, servico, data, hora, criado: new Date().toISOString() });
      saveAll(list);
      alert(`Obrigado, ${nome}! Agendamento para ${servico} em ${data} às ${hora} confirmado.`);
      form.reset();
      renderPublicList();
    });
  }

  // admin
  const loginForm = qs('#login-form');
  const panelArea = qs('#panel-area');
  const loginArea = qs('#login-area');
  const adminList = qs('#admin-list');
  const logoutBtn = qs('#logout');

  const ADMIN_USER = 'admin';
  const ADMIN_PASS = '1234';

  function renderAdminList(){
    if(!adminList) return;
    const list = loadAll().sort((a,b) => b.id - a.id);
    if(list.length === 0){ adminList.innerHTML = '<p class="small">Nenhum agendamento registrado.</p>'; return; }
    const table = document.createElement('table');
    table.className = 'table';
    const thead = document.createElement('thead');
    thead.innerHTML = '<tr><th>ID</th><th>Nome</th><th>Serviço</th><th>Data</th><th>Hora</th><th>Ações</th></tr>';
    table.appendChild(thead);
    const tbody = document.createElement('tbody');
    list.forEach(a => {
      const tr = document.createElement('tr');
      tr.innerHTML = `<td>${a.id}</td><td>${a.nome}</td><td>${a.servico}</td><td>${a.data}</td><td>${a.hora}</td>
        <td><a href="#" data-id="${a.id}" class="del">Excluir</a></td>`;
      tbody.appendChild(tr);
    });
    table.appendChild(tbody);
    adminList.innerHTML = '';
    adminList.appendChild(table);

    qsa('.del').forEach(btn => {
      btn.addEventListener('click', function(ev){
        ev.preventDefault();
        const id = Number(this.dataset.id);
        if(!confirm('Excluir agendamento?')) return;
        const newList = loadAll().filter(x => x.id !== id);
        saveAll(newList);
        renderAdminList();
        renderPublicList();
      });
    });
  }

  if(loginForm){
    loginForm.addEventListener('submit', function(e){
      e.preventDefault();
      const u = qs('#admin-user').value.trim();
      const p = qs('#admin-pass').value;
      if(u === ADMIN_USER && p === ADMIN_PASS){
        localStorage.setItem('linos_admin_logged', '1');
        showPanel();
      } else {
        alert('Usuário ou senha incorretos.');
      }
    });
  }

  function showPanel(){
    if(localStorage.getItem('linos_admin_logged') === '1'){
      if(loginArea) loginArea.style.display = 'none';
      if(panelArea) panelArea.style.display = 'block';
      renderAdminList();
    } else {
      if(loginArea) loginArea.style.display = 'block';
      if(panelArea) panelArea.style.display = 'none';
    }
  }

  if(logoutBtn){
    logoutBtn.addEventListener('click', function(){
      localStorage.removeItem('linos_admin_logged');
      showPanel();
    });
  }

  // inicialização
  renderPublicList();
  showPanel();

})();
