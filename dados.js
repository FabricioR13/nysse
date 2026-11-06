/* =========================================================
   Nysse Cabeleireiros — dados e regras da agenda
   Modo demonstração: tudo fica salvo no navegador (localStorage).
   Para colocar no ar de verdade, troque as funções carregar/salvar
   pelo Firebase (mesma base dos outros catálogos da TF Solutions).
   ========================================================= */

const NYSSE_CHAVE = 'nysse_demo_v1';

const NYSSE_PADRAO = {
  config: {
    nome: 'Nysse Cabeleireiros',
    whatsapp: '5551995309713',            // WhatsApp que recebe os pedidos
    endereco: 'Rua Santa Clara, 282 – Gravataí/RS',
    mapa: 'https://maps.google.com/?q=Rua+Santa+Clara,+282,+Gravata%C3%AD+RS',
    instagram: 'https://instagram.com/nyssecabeleireiros',
    pix: '(51) 99530-9713',
    pixNome: 'Nysse Cabeleireiros',
    diasAFrente: 21,                        // quantos dias aparecem na agenda
    intervalo: 30,                          // de quantos em quantos minutos começa um horário
    almoco: ['12:00', '13:00'],
    // 0=domingo ... 6=sábado  (null = fechado)
    horarios: {
      0: null,
      1: null,
      2: ['09:00', '19:00'],
      3: ['09:00', '19:00'],
      4: ['09:00', '19:00'],
      5: ['09:00', '19:00'],
      6: ['08:00', '17:00']
    },
    senha: '1234'
  },

  // agenda: 'cabelo' = cadeira da Nysse | 'unhas' = manicure (agenda separada)
  servicos: [
    { id: 'mechas', nome: 'Mechas', icone: '✨', dur: 120, preco: 'a partir de R$ 350', sinal: 50, agenda: 'cabelo',
      desc: 'Loiros, luzes e iluminados feitos com técnica e cuidado com o fio.',
      fotos: ['mechas-3', 'mechas-1', 'mechas-2', 'mechas-4', 'loiro-1', 'loiro-3'] },
    { id: 'coloracao', nome: 'Coloração', icone: '🎨', dur: 120, preco: 'a partir de R$ 150', sinal: 30, agenda: 'cabelo',
      desc: 'Pintura, retoque de raiz e cobertura de brancos.',
      fotos: ['coloracao-1', 'coloracao-2', 'coloracao-3'] },
    { id: 'corte', nome: 'Corte', icone: '✂️', dur: 30, preco: 'a partir de R$ 60', sinal: 20, agenda: 'cabelo',
      desc: 'Corte feminino e masculino, com finalização.',
      fotos: ['corte-1', 'corte-2', 'escova-1'] },
    { id: 'alisamento', nome: 'Alisamento', icone: '🌿', dur: 120, preco: 'a partir de R$ 250', sinal: 50, agenda: 'cabelo',
      desc: 'Progressiva e alinhamento para fios lisos e com brilho.',
      fotos: ['alisamento-1', 'escova-1'] },
    { id: 'terapia', nome: 'Terapia capilar', icone: '💆‍♀️', dur: 120, preco: 'a partir de R$ 120', sinal: 30, agenda: 'cabelo',
      desc: 'Avaliação do couro cabeludo e tratamento ideal para você.',
      fotos: ['terapia-1', 'avaliacao'] },
    { id: 'unhas', nome: 'Unhas', icone: '💅', dur: 60, preco: 'a partir de R$ 35', sinal: 15, agenda: 'unhas',
      desc: 'Manicure e pedicure. Escolha mão, pé ou os dois.',
      opcoes: [
        { nome: 'Mão', preco: 'R$ 35' },
        { nome: 'Pé', preco: 'R$ 40' },
        { nome: 'Pé e mão', preco: 'R$ 70' }
      ],
      fotos: [] }
  ],

  produtos: [
    { id: 'p1', nome: 'Shampoo Reconstrução', detalhe: '300 ml · uso profissional', preco: 89.9, ativo: true, cor: '#C9A45C' },
    { id: 'p2', nome: 'Condicionador Reconstrução', detalhe: '300 ml · uso profissional', preco: 89.9, ativo: true, cor: '#B8914A' },
    { id: 'p3', nome: 'Máscara Hidratação Intensa', detalhe: '250 g', preco: 119.9, ativo: true, cor: '#8C6B3A' },
    { id: 'p4', nome: 'Shampoo Matizador (loiros)', detalhe: '300 ml · tira o amarelado', preco: 94.9, ativo: true, cor: '#7B6A9E' },
    { id: 'p5', nome: 'Óleo Finalizador', detalhe: '60 ml · brilho e proteção', preco: 69.9, ativo: true, cor: '#D9B77A' },
    { id: 'p6', nome: 'Kit Pós-Química', detalhe: 'shampoo + condicionador + máscara', preco: 259.9, ativo: true, cor: '#1E1A16' }
  ],

  agendamentos: [],
  bloqueios: []   // { id, data:'2026-11-10', inicio:'13:00'|null, fim:'15:00'|null, agenda:'cabelo'|'unhas'|'todas', motivo }
};

/* ---------- carregar / salvar ---------- */
function nysseCarregar() {
  let d = null;
  try { d = JSON.parse(localStorage.getItem(NYSSE_CHAVE)); } catch (e) {}
  if (!d) { d = JSON.parse(JSON.stringify(NYSSE_PADRAO)); nysseExemplos(d); nysseSalvar(d); }
  return d;
}
function nysseSalvar(d) {
  try { localStorage.setItem(NYSSE_CHAVE, JSON.stringify(d)); } catch (e) {}
}
function nysseRestaurar() {
  try { localStorage.removeItem(NYSSE_CHAVE); } catch (e) {}
  return nysseCarregar();
}

/* ---------- datas e horas ---------- */
const DIAS_SEMANA = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
const DIAS_CURTO = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
const MESES = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];

function paraMin(h) { const [a, b] = h.split(':').map(Number); return a * 60 + b; }
function paraHora(m) { return String(Math.floor(m / 60)).padStart(2, '0') + ':' + String(m % 60).padStart(2, '0'); }
function dataISO(dt) { return dt.getFullYear() + '-' + String(dt.getMonth() + 1).padStart(2, '0') + '-' + String(dt.getDate()).padStart(2, '0'); }
function deISO(s) { const [a, m, d] = s.split('-').map(Number); return new Date(a, m - 1, d); }
function dataBonita(s) { const d = deISO(s); return DIAS_SEMANA[d.getDay()] + ', ' + String(d.getDate()).padStart(2, '0') + '/' + String(d.getMonth() + 1).padStart(2, '0'); }
function duracaoTexto(min) { return min < 60 ? min + ' min' : (min % 60 ? Math.floor(min / 60) + 'h' + (min % 60) : (min / 60) + 'h'); }
function dinheiro(v) { return 'R$ ' + Number(v).toFixed(2).replace('.', ','); }

/* ---------- regras da agenda ---------- */
function nysseOcupacoes(d, data, agenda, ignorarId) {
  const lista = [];
  d.agendamentos.forEach(a => {
    if (a.data !== data || a.agenda !== agenda || a.status === 'cancelado' || a.id === ignorarId) return;
    lista.push([paraMin(a.hora), paraMin(a.hora) + a.dur]);
  });
  d.bloqueios.forEach(b => {
    if (b.data !== data || (b.agenda !== 'todas' && b.agenda !== agenda)) return;
    if (!b.inicio) lista.push([0, 24 * 60]);
    else lista.push([paraMin(b.inicio), paraMin(b.fim)]);
  });
  return lista;
}

/* Devolve os horários do dia: [{hora, livre}] — "livre=false" aparece como Reservado */
function nysseHorariosDoDia(d, data, servico) {
  const dt = deISO(data);
  const exp = d.config.horarios[dt.getDay()];
  if (!exp) return null; // fechado
  const abre = paraMin(exp[0]), fecha = paraMin(exp[1]);
  const alm = d.config.almoco ? [paraMin(d.config.almoco[0]), paraMin(d.config.almoco[1])] : null;
  const ocup = nysseOcupacoes(d, data, servico.agenda);
  const agora = new Date();
  const hoje = dataISO(agora) === data;
  const minAgora = agora.getHours() * 60 + agora.getMinutes() + 60; // pelo menos 1h de antecedência
  const res = [];
  for (let m = abre; m + servico.dur <= fecha; m += d.config.intervalo) {
    const fim = m + servico.dur;
    if (alm && m >= alm[0] && m < alm[1]) continue; // não começa no almoço
    if (hoje && m < minAgora) continue;
    // começa dentro de um horário já marcado → aparece como "Reservado"
    const ocupado = ocup.some(([a, b]) => m >= a && m < b);
    if (ocupado) { res.push({ hora: paraHora(m), livre: false }); continue; }
    // começa livre mas o serviço não cabe até o próximo cliente/almoço → não mostra
    const naoCabe = ocup.some(([a, b]) => m < b && fim > a) || (alm && m < alm[1] && fim > alm[0]);
    if (naoCabe) continue;
    res.push({ hora: paraHora(m), livre: true });
  }
  return res;
}

function nysseDias(d, servico) {
  const dias = [];
  const base = new Date(); base.setHours(0, 0, 0, 0);
  for (let i = 0; i < d.config.diasAFrente; i++) {
    const dt = new Date(base); dt.setDate(base.getDate() + i);
    const iso = dataISO(dt);
    const hs = nysseHorariosDoDia(d, iso, servico);
    dias.push({ iso, dt, fechado: hs === null, livres: hs ? hs.filter(h => h.livre).length : 0 });
  }
  return dias;
}

function nysseCodigo() { return 'NY-' + Math.floor(1000 + Math.random() * 9000); }

/* ---------- mensagens de WhatsApp ---------- */
function linkWhats(numero, texto) {
  const n = String(numero).replace(/\D/g, '');
  return 'https://wa.me/' + (n.startsWith('55') ? n : '55' + n) + '?text=' + encodeURIComponent(texto);
}
function msgPedidoParaNysse(d, a) {
  const s = d.servicos.find(x => x.id === a.servicoId);
  return `Olá, Nysse! 💛 Fiz um pedido de agendamento pelo site:\n\n` +
    `${s.icone} *${s.nome}${a.opcao ? ' – ' + a.opcao : ''}*\n` +
    `📅 ${dataBonita(a.data)} às ${a.hora} (${duracaoTexto(a.dur)})\n` +
    `👤 ${a.nome}\n📱 ${a.whats}\n` +
    (a.obs ? `📝 ${a.obs}\n` : '') +
    `\nCódigo: ${a.codigo}\nAguardo a confirmação 😊`;
}
function msgConfirmarPedirSinal(d, a) {
  const s = d.servicos.find(x => x.id === a.servicoId);
  return `Olá, ${a.nome.split(' ')[0]}! Aqui é da ${d.config.nome} 💛\n\n` +
    `Seu horário foi *pré-reservado*:\n${s.icone} ${s.nome}${a.opcao ? ' – ' + a.opcao : ''}\n📅 ${dataBonita(a.data)} às ${a.hora}\n\n` +
    `Para confirmar, faça o *sinal de ${dinheiro(a.sinal)}* pelo Pix:\n🔑 ${d.config.pix}\n(${d.config.pixNome})\n\n` +
    `Depois é só me mandar o comprovante por aqui. O sinal é descontado do valor no dia. Obrigada! ✨\nCódigo: ${a.codigo}`;
}
function msgConfirmado(d, a) {
  const s = d.servicos.find(x => x.id === a.servicoId);
  return `Sinal recebido! ✅ Obrigada, ${a.nome.split(' ')[0]}!\n\n` +
    `Seu horário está *confirmado*:\n${s.icone} ${s.nome}${a.opcao ? ' – ' + a.opcao : ''}\n📅 ${dataBonita(a.data)} às ${a.hora}\n📍 ${d.config.endereco}\n\nTe esperamos! 💛`;
}
function msgCancelado(d, a) {
  const s = d.servicos.find(x => x.id === a.servicoId);
  return `Olá, ${a.nome.split(' ')[0]}! Aqui é da ${d.config.nome}. Infelizmente não vamos conseguir te atender em ${dataBonita(a.data)} às ${a.hora} (${s.nome}). ` +
    `Posso te sugerir outro horário? Você também pode escolher um novo pelo nosso site. 💛`;
}

/* ---------- exemplos para a demonstração ---------- */
function nysseExemplos(d) {
  const nomes = ['Maria Fernanda', 'Juliana Souza', 'Patrícia Lima', 'Carla Mendes', 'Roberta Alves', 'Simone Rocha', 'Luciana Prado', 'Ana Paula', 'Débora Martins', 'Fernanda Costa'];
  const base = new Date(); base.setHours(0, 0, 0, 0);
  let k = 0;
  const add = (diasDepois, hora, servicoId, status, opcao) => {
    const dt = new Date(base); dt.setDate(base.getDate() + diasDepois);
    if (!d.config.horarios[dt.getDay()]) return;
    const s = d.servicos.find(x => x.id === servicoId);
    const exp = d.config.horarios[dt.getDay()];
    const ini = paraMin(hora), fim = ini + s.dur;
    if (fim > paraMin(exp[1])) return;
    if (nysseOcupacoes(d, dataISO(dt), s.agenda).some(([a, b]) => ini < b && fim > a)) return;
    const nome = nomes[k++ % nomes.length];
    d.agendamentos.push({
      id: 'ex' + k, codigo: 'NY-' + (2100 + k * 37), servicoId, opcao: opcao || '', data: dataISO(dt), hora, dur: s.dur, agenda: s.agenda,
      nome, whats: '(51) 9' + (8100 + (k * 113) % 1900) + '-' + (1000 + (k * 271) % 9000), obs: '', sinal: s.sinal, status,
      criadoEm: Date.now() - (k * 3600 * 1000)
    });
  };
  for (let i = 0; i < 12; i++) {
    add(i, '09:00', ['mechas', 'coloracao', 'alisamento'][i % 3], i < 2 ? 'confirmado' : (i % 4 === 0 ? 'sinal' : 'confirmado'));
    if (i % 2 === 0) add(i, '14:00', ['terapia', 'mechas'][i % 2 ? 1 : 0], i < 3 ? 'confirmado' : 'confirmado');
    if (i % 3 === 1) add(i, '16:30', 'corte', 'confirmado');
    if (i % 2 === 1) add(i, '10:00', 'unhas', 'confirmado', 'Pé e mão');
  }
  // pedidos novos esperando a Nysse
  add(2, '15:00', 'mechas', 'novo');
  add(3, '11:00', 'corte', 'novo');
  add(4, '13:00', 'unhas', 'novo', 'Mão');
  add(5, '16:00', 'coloracao', 'sinal');
}
