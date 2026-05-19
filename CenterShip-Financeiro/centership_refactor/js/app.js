const financeApp = {
  money(value) {
    return Number(value || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  },
  date(value) {
    if (!value) return '';
    const [year, month, day] = value.split('-');
    if (!year || !month || !day) return value;
    return `${day}/${month}/${year}`;
  },
  toast(message) {
    const node = document.createElement('div');
    node.textContent = message;
    node.style.cssText = 'position:fixed;right:18px;bottom:18px;z-index:50;background:oklch(10% 0.004 250);color:white;padding:12px 14px;border-radius:8px;border:1px solid oklch(100% 0 0 / .12);box-shadow:0 18px 45px oklch(10% 0.004 250 / .18);font-weight:700';
    document.body.appendChild(node);
    setTimeout(() => node.remove(), 2600);
  },
  text(value) {
    return String(value || '').replace(/[&<>"]/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[char]));
  },
  setReceiptValue(key, value) {
    document.querySelectorAll(`[data-receipt="${key}"]`).forEach((node) => {
      node.textContent = value;
    });
  },
  updateReceipt(form) {
    if (!form) return;

    const data = Object.fromEntries(new FormData(form).entries());
    const days = Number(data.days || 0);
    const rate = Number(data.rate || 0);
    const bonus = Number(data.bonus || 0);
    const discount = Number(data.discount || 0);
    const gross = days * rate;
    const adjustments = bonus - discount;
    const total = gross + adjustments;

    const values = {
      receiptNumber: data.receiptNumber,
      issueDate: this.date(data.issueDate),
      providerName: data.providerName,
      providerCpf: data.providerCpf,
      providerCnpj: data.providerCnpj,
      period: data.period,
      service: data.service,
      days: String(days),
      rate: this.money(rate),
      paymentMethod: data.paymentMethod,
      paymentKey: data.paymentKey,
      paymentDate: this.date(data.paymentDate),
      companyName: data.companyName,
      companyCnpj: data.companyCnpj,
      companyLocation: data.companyLocation,
      companyEmail: data.companyEmail,
      gross: this.money(gross),
      adjustments: this.money(adjustments),
      total: this.money(total)
    };

    Object.entries(values).forEach(([key, value]) => this.setReceiptValue(key, value || ''));
  }
};

document.addEventListener('click', (event) => {
  const menuButton = event.target.closest('[data-mobile-menu]');
  if (menuButton) {
    document.querySelector('.sidebar')?.classList.toggle('open');
  }

  const action = event.target.closest('[data-action]');
  if (!action) return;
  const type = action.dataset.action;

  if (type === 'toast') financeApp.toast(action.dataset.message || 'Ação registrada.');
  if (type === 'print') window.print();
  if (type === 'copy') {
    const text = action.dataset.copy || document.querySelector(action.dataset.target)?.innerText || '';
    navigator.clipboard?.writeText(text);
    financeApp.toast('Conteúdo copiado para a área de transferência.');
  }
  if (type === 'toggle-modal') {
    const modal = document.querySelector(action.dataset.target);
    if (!modal) return;
    if (typeof modal.showModal === 'function') {
      modal.open ? modal.close() : modal.showModal();
    } else {
      modal.toggleAttribute('open');
    }
  }
  if (type === 'tab') {
    const group = action.closest('[data-tabs]');
    group.querySelectorAll('[data-action="tab"]').forEach((btn) => btn.classList.remove('primary'));
    action.classList.add('primary');
    group.querySelectorAll('[data-panel]').forEach((panel) => {
      panel.hidden = panel.dataset.panel !== action.dataset.tab;
    });
  }
  if (type === 'update-receipt') {
    financeApp.updateReceipt(action.closest('form'));
    financeApp.toast('Prévia do recibo atualizada.');
  }
});

document.addEventListener('input', (event) => {
  const weeklyForm = event.target.closest('[data-weekly-calc]');
  if (weeklyForm) {
    const days = Number(weeklyForm.querySelector('[name="days"]').value || 0);
    const rate = Number(weeklyForm.querySelector('[name="rate"]').value || 0);
    const bonus = Number(weeklyForm.querySelector('[name="bonus"]').value || 0);
    const discount = Number(weeklyForm.querySelector('[name="discount"]').value || 0);
    const gross = days * rate;
    const net = gross + bonus - discount;
    weeklyForm.querySelector('[data-gross]').textContent = financeApp.money(gross);
    weeklyForm.querySelector('[data-net]').textContent = financeApp.money(net);
  }

  const receiptForm = event.target.closest('[data-receipt-form]');
  if (receiptForm) {
    financeApp.updateReceipt(receiptForm);
  }
});

document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('[data-receipt-form]').forEach((form) => financeApp.updateReceipt(form));
});

async function requireAuthForPrivatePages() {
  const current = location.pathname.split('/').pop() || 'index.html';
  const base = current.replace('.html', '');
  const publicPages = ['login', 'landing', 'index', ''];
  if (publicPages.includes(base)) return;
  if (!window.CenterShipDB) return;
  const session = await window.CenterShipDB.getSession();
  if (!session) {
    location.href = location.pathname.includes('/pages/') ? '../../login.html' : 'login.html';
    return;
  }
  
  // Apply Roles
  const role = session.user?.user_metadata?.role || session.user?.user_metadata?.profile || 'colaborador';
  if (role !== 'admin') {
    document.querySelectorAll('[data-role-admin]').forEach(el => el.remove());
  }

  // Set active link in sidebar based on current pathname
  document.querySelectorAll('.sidebar .nav-link').forEach(link => {
    if (location.pathname.includes(link.getAttribute('href').replace('../../', ''))) {
      link.classList.add('active');
    }
  });
}

async function handleLoginForms() {
  const loginForm = document.querySelector('[data-login-form]');
  if (loginForm) {
    loginForm.addEventListener('submit', async (event) => {
      event.preventDefault();
      const data = Object.fromEntries(new FormData(loginForm).entries());
      const button = loginForm.querySelector('button[type="submit"]');
      try {
        if (button) button.disabled = true;
        await window.CenterShipDB.signIn(data.email, data.password);
        financeApp.toast('Login realizado com sucesso.');
        setTimeout(() => location.href = (window.CENTERSHIP_CONFIG?.REDIRECT_AFTER_LOGIN || 'dashboard.html'), 500);
      } catch (error) {
        financeApp.toast(error.message || 'Não foi possível entrar. Verifique e-mail e senha.');
      } finally {
        if (button) button.disabled = false;
      }
    });
  }

  const signupForm = document.querySelector('[data-signup-form]');
  if (signupForm) {
    signupForm.addEventListener('submit', async (event) => {
      event.preventDefault();
      const data = Object.fromEntries(new FormData(signupForm).entries());
      try {
        await window.CenterShipDB.signUp(data.email, data.password, { name: data.name, profile: data.profile });
        financeApp.toast('Usuário cadastrado. Se a confirmação de e-mail estiver desativada, ele já poderá acessar.');
        signupForm.reset();
      } catch (error) {
        financeApp.toast(error.message || 'Erro ao cadastrar usuário.');
      }
    });
  }
}

function cadastroCard(row) {
  const isColaborador = row.tipo === 'colaborador_mei';
  const tipoLabel = isColaborador
    ? (row.regime_contrato === 'clt' ? 'Colaborador CLT' : 'Colaborador MEI')
    : row.tipo === 'fornecedor' ? 'Fornecedor' : 'Cliente';
  const statusClass = row.status === 'pendente' ? 'analysis' : row.status === 'inativo' ? 'overdue' : 'paid';

  let fields = [row.documento, row.email, row.telefone].filter(Boolean);

  if (isColaborador) {
    if (row.regime_contrato === 'mei') {
      if (row.cnpj_mei) fields.push(`CNPJ MEI: ${row.cnpj_mei}`);
      if (row.pix) fields.push(`PIX: ${row.pix}`);
      if (row.diaria_padrao) fields.push(`Diária padrão: ${financeApp.money(row.diaria_padrao)}`);
    } else if (row.regime_contrato === 'clt') {
      if (row.cargo) fields.push(`Cargo: ${row.cargo}`);
      if (row.salario_base) fields.push(`Salário base: ${financeApp.money(row.salario_base)}`);
    }
  }

  if (row.observacoes) fields.push(row.observacoes);

  const regimeBadge = isColaborador && row.regime_contrato
    ? `<span style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.5px;padding:2px 8px;border-radius:20px;background:${row.regime_contrato === 'clt' ? 'oklch(92% 0.04 220)' : 'oklch(94% 0.06 78)'};color:${row.regime_contrato === 'clt' ? 'oklch(35% 0.12 220)' : 'oklch(42% 0.12 60)'}">${row.regime_contrato.toUpperCase()}</span>`
    : '';

  return `<article class="panel" data-cadastro-card data-search-text="${financeApp.text([tipoLabel, row.nome, ...fields, row.status].join(' ')).toLowerCase()}">
    <div style="display:flex;align-items:center;gap:8px;margin-bottom:4px">
      <h2 style="margin:0">${financeApp.text(tipoLabel)}</h2>
      ${regimeBadge}
    </div>
    <p><b>${financeApp.text(row.nome || 'Sem nome')}</b>${fields.length ? `<br>${fields.map((field) => financeApp.text(field)).join('<br>')}` : ''}</p>
    <span class="status ${statusClass}">${financeApp.text(row.status || 'ativo')}</span>
  </article>`;
}

async function loadCadastros() {
  const grid = document.querySelector('[data-cadastros-grid]');
  if (!grid || !window.CenterShipDB) return;
  try {
    const tipo = grid.dataset.cadastrosTipo;
    const rows = await window.CenterShipDB.listCadastros();
    const filteredRows = tipo ? rows.filter((row) => row.tipo === tipo) : rows;
    if (filteredRows.length) {
      grid.innerHTML = filteredRows.map(cadastroCard).join('');
    } else if (!grid.querySelector('[data-empty-state]')) {
      grid.innerHTML = '<article class="panel" data-empty-state><h2>Nenhum cadastro encontrado</h2><p>Use o botão de cadastro para criar o primeiro registro.</p></article>';
    }
  } catch (error) {
    financeApp.toast('Não foi possível carregar cadastros. Verifique o Supabase.');
  }
}

function handleCadastroSearch() {
  document.querySelectorAll('[data-search-cadastros]').forEach((input) => {
    input.addEventListener('input', () => {
      const term = input.value.trim().toLowerCase();
      document.querySelectorAll('[data-cadastro-card]').forEach((card) => {
        card.hidden = term && !card.dataset.searchText.includes(term);
      });
    });
  });
}

async function loadReceiptProviders() {
  const select = document.querySelector('[data-provider-select]');
  if (!select || !window.CenterShipDB) return;
  try {
    const rows = await window.CenterShipDB.listCadastros();
    const providers = rows.filter((row) => row.tipo === 'colaborador_mei');
    providers.forEach((provider) => {
      const option = document.createElement('option');
      option.value = provider.id;
      option.textContent = provider.nome || 'Colaborador sem nome';
      option.dataset.provider = JSON.stringify(provider);
      select.appendChild(option);
    });
  } catch (error) {
    financeApp.toast('Não foi possível carregar colaboradores no recibo.');
  }
}

function splitDocumento(documento) {
  const value = String(documento || '');
  if (value.replace(/\D/g, '').length > 11) return { providerCpf: '', providerCnpj: value };
  return { providerCpf: value, providerCnpj: '' };
}

function handleReceiptProviderSelect() {
  document.querySelectorAll('[data-provider-select]').forEach((select) => {
    select.addEventListener('change', () => {
      const form = select.closest('[data-receipt-form]');
      const provider = select.selectedOptions[0]?.dataset.provider ? JSON.parse(select.selectedOptions[0].dataset.provider) : null;
      if (!form || !provider) return;
      const documento = splitDocumento(provider.documento);
      const values = {
        providerName: provider.nome,
        providerCpf: documento.providerCpf,
        providerCnpj: documento.providerCnpj,
        paymentKey: provider.pix,
        rate: provider.diaria_padrao || ''
      };
      Object.entries(values).forEach(([name, value]) => {
        const field = form.elements[name];
        if (field && value !== undefined && value !== null) field.value = value;
      });
      financeApp.updateReceipt(form);
    });
  });
}

function handleCadastroForms() {
  document.querySelectorAll('[data-open-cadastro]').forEach((button) => {
    button.addEventListener('click', () => {
      const modal = document.querySelector('#cadastro-modal');
      const tipo = button.dataset.openCadastro;
      if (modal?.showModal) modal.showModal(); else modal?.setAttribute('open', '');
      const field = modal?.querySelector('[name="tipo"]');
      if (field) field.value = tipo;
    });
  });

  document.querySelectorAll('[data-close-modal]').forEach((button) => {
    button.addEventListener('click', () => button.closest('dialog')?.close());
  });

  const form = document.querySelector('[data-cadastro-form]');
  if (!form) return;
  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const data = Object.fromEntries(new FormData(form).entries());
    const payload = {
      tipo: data.tipo,
      nome: data.nome,
      documento: data.documento,
      email: data.email,
      telefone: data.telefone,
      regime_contrato: data.regime_contrato || null,
      cnpj_mei: data.cnpj_mei || null,
      pix: data.pix || null,
      diaria_padrao: data.diaria_padrao ? Number(data.diaria_padrao) : null,
      cargo: data.cargo || null,
      salario_base: data.salario_base ? Number(data.salario_base) : null,
      observacoes: data.observacoes,
      status: data.status || 'ativo'
    };
    try {
      await window.CenterShipDB.createCadastro(payload);
      financeApp.toast('Cadastro salvo com sucesso.');
      form.reset();
      form.closest('dialog')?.close();
      await loadCadastros();
    } catch (error) {
      financeApp.toast(error.message || 'Erro ao salvar cadastro.');
    }
  });
}

function handleLogout() {
  document.querySelectorAll('[data-logout]').forEach((button) => {
    button.addEventListener('click', async () => {
      await window.CenterShipDB?.signOut();
      location.href = location.pathname.includes('/pages/') ? '../../login.html' : 'login.html';
    });
  });
}

document.addEventListener('DOMContentLoaded', async () => {
  await requireAuthForPrivatePages();
  handleLoginForms();
  handleCadastroForms();
  handleCadastroSearch();
  handleReceiptProviderSelect();
  handleLogout();
  await loadCadastros();
  await loadReceiptProviders();
});

document.addEventListener('click', async (event) => {
  const action = event.target.closest('[data-action="save-receipt"]');
  if (!action) return;
  const form = action.closest('form');
  if (!form || !window.CenterShipDB) return;
  const data = Object.fromEntries(new FormData(form).entries());
  const days = Number(data.days || 0);
  const rate = Number(data.rate || 0);
  const bonus = Number(data.bonus || 0);
  const discount = Number(data.discount || 0);
  try {
    await window.CenterShipDB.createRecibo({
      numero: data.receiptNumber,
      prestador_nome: data.providerName,
      prestador_documento: `${data.providerCpf || ''} ${data.providerCnpj || ''}`.trim(),
      periodo: data.period,
      servico: data.service,
      diarias: days,
      valor_diaria: rate,
      adicional: bonus,
      desconto: discount,
      total: (days * rate) + bonus - discount,
      forma_pagamento: data.paymentMethod,
      chave_pix: data.paymentKey,
      data_pagamento: data.paymentDate || null
    });
    financeApp.toast('Recibo salvo com sucesso. Agora você pode imprimir.');
  } catch (error) {
    financeApp.toast(error.message || 'Erro ao salvar recibo.');
  }
});
