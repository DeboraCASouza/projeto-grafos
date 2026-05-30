(function () {
  var cur = window.location.pathname.split('/').pop() || 'index.html';

  var p1 = [
    'grafo_interativo.html',
    'arvore_percurso.html',
    'dashboard_interativo.html',
    'storytelling.html',
    'parte1_galeria.html',
  ];
  var p2 = [
    'parte2_grafo_amostra.html',
    'parte2_distribuicao_graus.html',
    'parte2_comparacao_algoritmos.html',
  ];

  function cls(href) { return cur === href ? ' nb-cur' : ''; }
  function groupActive(list) { return list.indexOf(cur) !== -1 ? ' nb-active' : ''; }

  var CSS = [
    '#nb{position:fixed;top:0;left:0;right:0;height:52px;',
    'background:#1e1e2e;border-bottom:1px solid #313244;',
    'display:flex;align-items:center;padding:0 22px;gap:16px;',
    'z-index:99999;box-shadow:0 2px 16px #0006;',
    'font-family:"Segoe UI",Arial,sans-serif;box-sizing:border-box}',

    '#nb .nb-brand{color:#cba6f7;font-weight:700;font-size:15px;',
    'text-decoration:none;white-space:nowrap;letter-spacing:-.3px;',
    'display:flex;align-items:center;gap:7px}',
    '#nb .nb-brand:hover{color:#f5c2e7}',

    '#nb .nb-sep{width:1px;height:28px;background:#313244;flex-shrink:0}',
    '#nb .nb-links{display:flex;gap:6px;align-items:center}',

    '#nb .nb-dd{position:relative}',
    '#nb .nb-btn{background:transparent;border:1px solid #313244;color:#cdd6f4;',
    'padding:7px 14px;border-radius:7px;cursor:pointer;font-size:13px;',
    'transition:background .15s,color .15s;white-space:nowrap;',
    'font-family:inherit;line-height:1}',
    '#nb .nb-btn:hover,#nb .nb-btn.nb-active{background:#313244;color:#cba6f7;border-color:#45475a}',

    '#nb .nb-menu{display:none;position:absolute;top:48px;left:0;',
    'background:#181825;border:1px solid #313244;border-radius:10px;',
    'min-width:240px;box-shadow:0 12px 32px #0008;',
    'z-index:100000;overflow:hidden}',
    '#nb .nb-dd:hover .nb-menu{display:block}',

    '#nb .nb-menu a{display:flex;align-items:center;gap:10px;',
    'color:#a6adc8;padding:10px 16px;text-decoration:none;',
    'font-size:13px;transition:background .1s,color .1s;',
    'border-bottom:1px solid #31324430;white-space:nowrap}',
    '#nb .nb-menu a:last-child{border-bottom:none}',
    '#nb .nb-menu a:hover{background:#31324470;color:#cba6f7}',
    '#nb .nb-menu a.nb-cur{color:#cba6f7;background:#31324450;font-weight:600}',
  ].join('');

  var HTML = [
    '<a class="nb-brand" href="index.html">✈ Projeto Grafos</a>',
    '<div class="nb-sep"></div>',
    '<div class="nb-links">',

    '<div class="nb-dd">',
    '<button class="nb-btn' + groupActive(p1) + '">Parte 1 — Aeroportos ▾</button>',
    '<div class="nb-menu">',
    '<a href="grafo_interativo.html"' + cls('grafo_interativo.html') + '>🗺 Grafo Interativo</a>',
    '<a href="arvore_percurso.html"' + cls('arvore_percurso.html') + '>🌳 Árvore de Percurso</a>',
    '<a href="dashboard_interativo.html"' + cls('dashboard_interativo.html') + '>🎛 Dashboard com Filtros</a>',
    '<a href="storytelling.html"' + cls('storytelling.html') + '>📖 Storytelling Analítico</a>',
    '<a href="parte1_galeria.html"' + cls('parte1_galeria.html') + '>📊 Galeria de Visualizações</a>',
    '</div></div>',

    '<div class="nb-dd">',
    '<button class="nb-btn' + groupActive(p2) + '">Parte 2 — Netflix ▾</button>',
    '<div class="nb-menu">',
    '<a href="parte2_grafo_amostra.html"' + cls('parte2_grafo_amostra.html') + '>🎬 Dashboard Interativo</a>',
    '<a href="parte2_distribuicao_graus.html"' + cls('parte2_distribuicao_graus.html') + '>📈 Distribuição de Graus</a>',
    '<a href="parte2_comparacao_algoritmos.html"' + cls('parte2_comparacao_algoritmos.html') + '>⚡ Comparação de Algoritmos</a>',
    '</div></div>',

    '</div>',
  ].join('');

  var styleEl = document.createElement('style');
  styleEl.textContent = CSS;
  document.head.appendChild(styleEl);

  var bodyPad = document.createElement('style');
  bodyPad.textContent = 'body{padding-top:52px!important}';
  document.head.appendChild(bodyPad);

  var nav = document.createElement('nav');
  nav.id = 'nb';
  nav.innerHTML = HTML;
  document.body.insertBefore(nav, document.body.firstChild);
})();
