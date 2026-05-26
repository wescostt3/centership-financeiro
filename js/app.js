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
  },

  updateProposalPreview(form) {
    if (!form) return;
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());
    
    const items = [];
    const rows = form.querySelectorAll('.dynamic-item-row');
    let total = 0;
    
    rows.forEach(row => {
      const idx = row.dataset.itemIndex;
      const desc = form.elements[`item_desc_${idx}`]?.value || '';
      const qty = Number(form.elements[`item_qty_${idx}`]?.value || 0);
      const price = Number(form.elements[`item_price_${idx}`]?.value || 0);
      const subtotal = qty * price;
      total += subtotal;
      
      if (desc) {
        items.push({ desc, qty, price, subtotal });
      }
    });

    const tbody = document.querySelector('[data-prop-items-tbody]');
    if (tbody) {
      if (items.length === 0) {
        tbody.innerHTML = `<tr><td colspan="4" style="text-align:center; color:#888">Nenhum item adicionado</td></tr>`;
      } else {
        tbody.innerHTML = items.map(item => `
          <tr>
            <td>${this.text(item.desc)}</td>
            <td style="text-align:center">${item.qty}</td>
            <td style="text-align:right">${this.money(item.price)}</td>
            <td style="text-align:right">${this.money(item.subtotal)}</td>
          </tr>
        `).join('');
      }
    }

    const values = {
      proposalNumber: data.proposalNumber || '',
      currentDate: new Date().toLocaleDateString('pt-BR'),
      validityDate: this.date(data.validityDate) || '',
      serviceDesc: data.serviceDesc || '',
      paymentTerms: data.paymentTerms || '',
      executionTime: data.executionTime || '',
      observations: data.observations || '',
      totalValue: this.money(total)
    };

    Object.entries(values).forEach(([key, value]) => {
      document.querySelectorAll(`[data-prop="${key}"]`).forEach((node) => {
        node.textContent = value;
      });
    });

    return { total, items };
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

  const proposalForm = event.target.closest('[data-proposal-form]');
  if (proposalForm) {
    financeApp.updateProposalPreview(proposalForm);
  }
});

document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('[data-receipt-form]').forEach((form) => financeApp.updateReceipt(form));
  document.querySelectorAll('[data-proposal-form]').forEach((form) => financeApp.updateProposalPreview(form));
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
  
  // Propostas Comerciais
  await loadProposalClients();
  handleProposalClientSelect();
  handlePropostasFilters();
  await loadPropostas();
  document.querySelectorAll('[data-proposal-form]').forEach((form) => financeApp.updateProposalPreview(form));
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

document.addEventListener('click', async (event) => {
  const action = event.target.closest('[data-action="save-proposal"]');
  if (!action) return;
  const form = action.closest('form');
  if (!form || !window.CenterShipDB) return;
  
  const data = Object.fromEntries(new FormData(form).entries());
  const { total, items } = financeApp.updateProposalPreview(form);
  
  if (!data.clientId) {
    financeApp.toast('Selecione um cliente para salvar a proposta.');
    return;
  }

  try {
    await window.CenterShipDB.createProposta({
      numero_proposta: data.proposalNumber,
      cliente_id: data.clientId,
      servico_descricao: data.serviceDesc,
      valor: total,
      data_validade: data.validityDate || null,
      forma_pagamento: data.paymentTerms,
      itens: JSON.stringify(items),
      observacoes: data.observations,
      status: 'pendente'
    });
    financeApp.toast('Proposta comercial salva com sucesso! Redirecionando...');
    setTimeout(() => {
      location.href = 'propostas.html';
    }, 1500);
  } catch (error) {
    financeApp.toast(error.message || 'Erro ao salvar proposta comercial.');
  }
});

// --- PROPOSTAS COMERCIAIS LOGIC ---

async function loadProposalClients() {
  const select = document.querySelector('[data-client-select]');
  if (!select || !window.CenterShipDB) return;
  try {
    const rows = await window.CenterShipDB.listCadastros();
    const clients = rows.filter((row) => row.tipo === 'cliente');
    clients.forEach((client) => {
      const option = document.createElement('option');
      option.value = client.id;
      option.textContent = client.nome || 'Cliente sem nome';
      option.dataset.client = JSON.stringify(client);
      select.appendChild(option);
    });
  } catch (error) {
    financeApp.toast('Não foi possível carregar clientes.');
  }
}

function handleProposalClientSelect() {
  document.querySelectorAll('[data-client-select]').forEach((select) => {
    select.addEventListener('change', () => {
      const client = select.selectedOptions[0]?.dataset.client ? JSON.parse(select.selectedOptions[0].dataset.client) : null;
      if (!client) {
        document.querySelectorAll('[data-prop="clientName"]').forEach(n => n.textContent = '-');
        document.querySelectorAll('[data-prop="clientDoc"]').forEach(n => n.textContent = '-');
        document.querySelectorAll('[data-prop="clientEmail"]').forEach(n => n.textContent = '-');
        document.querySelectorAll('[data-prop="clientPhone"]').forEach(n => n.textContent = '-');
        return;
      }
      document.querySelectorAll('[data-prop="clientName"]').forEach(n => n.textContent = client.nome || '-');
      document.querySelectorAll('[data-prop="clientDoc"]').forEach(n => n.textContent = client.documento || '-');
      document.querySelectorAll('[data-prop="clientEmail"]').forEach(n => n.textContent = client.email || '-');
      document.querySelectorAll('[data-prop="clientPhone"]').forEach(n => n.textContent = client.telefone || '-');
    });
  });
}

async function loadPropostas() {
  const tbody = document.querySelector('[data-propostas-tbody]');
  if (!tbody || !window.CenterShipDB) return;
  try {
    const propostas = await window.CenterShipDB.listPropostas();
    const cadastros = await window.CenterShipDB.listCadastros();
    
    const clientFilter = document.querySelector('[data-filter-cliente]');
    if (clientFilter && clientFilter.options.length <= 1) {
      const clients = cadastros.filter(c => c.tipo === 'cliente');
      clients.forEach(c => {
        const option = document.createElement('option');
        option.value = c.id;
        option.textContent = c.nome;
        clientFilter.appendChild(option);
      });
    }
    renderPropostasTable(propostas, cadastros);
  } catch (error) {
    financeApp.toast('Erro ao carregar propostas.');
  }
}

function renderPropostasTable(propostas, cadastros) {
  const tbody = document.querySelector('[data-propostas-tbody]');
  if (!tbody) return;

  const searchTerm = document.querySelector('[data-search-propostas]')?.value.trim().toLowerCase() || '';
  const statusFilter = document.querySelector('[data-filter-status]')?.value || '';
  const clientFilter = document.querySelector('[data-filter-cliente]')?.value || '';

  const filtered = propostas.filter(prop => {
    const client = cadastros.find(c => c.id === prop.cliente_id);
    const clientName = client ? client.nome.toLowerCase() : '';
    const matchSearch = !searchTerm || 
      prop.numero_proposta?.toLowerCase().includes(searchTerm) || 
      clientName.includes(searchTerm) || 
      prop.servico_descricao?.toLowerCase().includes(searchTerm);
    const matchStatus = !statusFilter || prop.status === statusFilter;
    const matchClient = !clientFilter || prop.cliente_id === clientFilter;
    return matchSearch && matchStatus && matchClient;
  });

  if (filtered.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; color:var(--muted); padding:32px;">Nenhuma proposta comercial encontrada.</td></tr>`;
    return;
  }

  tbody.innerHTML = filtered.map(prop => {
    const client = cadastros.find(c => c.id === prop.cliente_id);
    const clientName = client ? client.nome : 'Cliente removido';
    const statusClass = prop.status === 'aprovada' ? 'paid' : prop.status === 'pendente' ? 'pending' : prop.status === 'rejeitada' ? 'overdue' : 'neutral';
    
    return `
      <tr data-prop-id="${prop.id}">
        <td><strong>${financeApp.text(prop.numero_proposta)}</strong></td>
        <td>${financeApp.text(clientName)}</td>
        <td><span style="font-size:12px; color:var(--muted)">${financeApp.text(prop.servico_descricao)}</span></td>
        <td class="money" style="font-weight:700">${financeApp.money(prop.valor)}</td>
        <td><span style="color:var(--muted); font-size:12.5px">${financeApp.date(prop.data_validade)}</span></td>
        <td><span class="status ${statusClass}">${financeApp.text(prop.status)}</span></td>
        <td>
          <div style="display:flex; gap:8px">
            <select onchange="updatePropStatus('${prop.id}', this.value)" style="min-height:30px; font-size:11px; padding:2px 8px; border-radius:6px; background:rgba(255,255,255,0.06); color:var(--fg); border:1px solid var(--glass-border)">
              <option value="pendente" ${prop.status === 'pendente' ? 'selected' : ''}>Pendente</option>
              <option value="aprovada" ${prop.status === 'aprovada' ? 'selected' : ''}>Aprovada</option>
              <option value="rejeitada" ${prop.status === 'rejeitada' ? 'selected' : ''}>Rejeitada</option>
              <option value="cancelada" ${prop.status === 'cancelada' ? 'selected' : ''}>Cancelada</option>
            </select>
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

async function updatePropStatus(id, newStatus) {
  try {
    await window.CenterShipDB.updatePropostaStatus(id, newStatus);
    financeApp.toast(`Status da proposta comercial atualizado para ${newStatus}.`);
    await loadPropostas();
  } catch (error) {
    financeApp.toast('Erro ao atualizar status da proposta.');
  }
}
window.updatePropStatus = updatePropStatus;

function handlePropostasFilters() {
  const search = document.querySelector('[data-search-propostas]');
  const status = document.querySelector('[data-filter-status]');
  const client = document.querySelector('[data-filter-cliente]');

  const triggerReload = async () => {
    if (!window.CenterShipDB) return;
    const propostas = await window.CenterShipDB.listPropostas();
    const cadastros = await window.CenterShipDB.listCadastros();
    renderPropostasTable(propostas, cadastros);
  };

  search?.addEventListener('input', triggerReload);
  status?.addEventListener('change', triggerReload);
  client?.addEventListener('change', triggerReload);
}

window.updatePreviewUI = function() {
  const form = document.querySelector('[data-proposal-form]');
  if (form) {
    financeApp.updateProposalPreview(form);
  }
};
