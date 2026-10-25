/* DWAYA — site vitrine : thème, menu mobile, prix, demande de démonstration (sans serveur). Aucune dépendance. */
(function () {
  'use strict';
  var root = document.documentElement;
  var ar = root.lang === 'ar';
  var R = window.DWAYA_REGLAGES || { prix: {}, contact: {} };
  /* Version publique (hébergement statique, build-public.sh) : assets/site-mode.js vaut 'public' ; aucun appel à l'API. */
  var PUBLIC = window.DWAYA_MODE === 'public';
  var T = ar ? {
    dark: 'الوضع الداكن',
    missing: 'وسيلة التواصل لم تُحدَّد بعد (CONTACT_A_DEFINIR).',
    required: 'المرجو ملء الحقول الإلزامية: اسم الصيدلية، المدينة، الاسم والهاتف.',
    subject: 'طلب عرض توضيحي لـ DWAYATI',
    labels: ['الصيدلية', 'المدينة', 'الاسم', 'الهاتف', 'عدد الأجهزة', 'العرض', 'الرسالة'],
    sentMail: 'يُفتح برنامج البريد مع رسالتكم. أرسلوها من هناك.',
    sentWa: 'يُفتح واتساب مع رسالتكم. أرسلوها من هناك.',
    e: {
      required: 'هذا الحقل إلزامي.', email: 'أدخلوا بريدًا إلكترونيًا صحيحًا.',
      consent: 'ضعوا علامة في الخانة للمتابعة.', fix: 'راجعوا الحقول المشار إليها.',
      busy: 'جارٍ إنشاء الحساب…', wait: 'طلبات كثيرة. أعيدوا المحاولة بعد بضع دقائق.',
      off: 'التجربة الذاتية غير متاحة هنا. اطلبوا عرضًا توضيحيًا بالاستمارة أدناه.',
      fail: 'تعذّر إنشاء الحساب. أعيدوا المحاولة بعد قليل أو اطلبوا عرضًا توضيحيًا أدناه.',
      copied: 'تم نسخ كلمة المرور.', copyFail: 'تعذّر النسخ: حدّدوا كلمة المرور وانسخوها.',
      locale: 'ar-MA-u-nu-latn'
    }
  } : {
    dark: 'Thème sombre',
    missing: 'Le contact n’est pas encore défini (CONTACT_A_DEFINIR).',
    required: 'Merci de remplir les champs obligatoires : pharmacie, ville, nom et téléphone.',
    subject: 'Demande de démonstration DWAYATI',
    labels: ['Pharmacie', 'Ville', 'Nom', 'Téléphone', 'Nombre de postes', 'Offre', 'Message'],
    sentMail: 'Votre messagerie s’ouvre avec la demande : il reste à l’envoyer.',
    sentWa: 'WhatsApp s’ouvre avec la demande : il reste à l’envoyer.',
    e: {
      required: 'Ce champ est obligatoire.', email: 'Saisissez une adresse e-mail valide.',
      consent: 'Cochez la case pour continuer.', fix: 'Vérifiez les champs signalés.',
      busy: 'Création du compte…', wait: 'Trop de demandes. Réessayez dans quelques minutes.',
      off: 'L’essai en libre-service n’est pas disponible ici. Demandez une démo avec le formulaire ci-dessous.',
      fail: 'Le compte n’a pas pu être créé. Réessayez dans un instant ou demandez une démo ci-dessous.',
      copied: 'Mot de passe copié.', copyFail: 'Copie impossible : sélectionnez le mot de passe et copiez-le.',
      locale: 'fr-MA-u-nu-latn'
    }
  };
  var TE = T.e;

  /* Thème clair / sombre : préférence du système, puis choix mémorisé sur ce navigateur. */
  var themeBtn = document.getElementById('theme-btn');
  function applyTheme(t) {
    root.setAttribute('data-theme', t);
    if (themeBtn) {
      themeBtn.setAttribute('aria-pressed', String(t === 'dark'));
      themeBtn.setAttribute('aria-label', T.dark);
    }
  }
  applyTheme(root.getAttribute('data-theme') || 'light');
  if (themeBtn) themeBtn.addEventListener('click', function () {
    var t = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    applyTheme(t);
    try { localStorage.setItem('dwaya-theme', t); } catch (e) { /* navigation privée */ }
  });
  if (window.matchMedia) {
    var mq = window.matchMedia('(prefers-color-scheme: dark)');
    var follow = function (e) {
      var saved = null;
      try { saved = localStorage.getItem('dwaya-theme'); } catch (err) { /* ignoré */ }
      if (!saved) applyTheme(e.matches ? 'dark' : 'light');
    };
    if (mq.addEventListener) mq.addEventListener('change', follow);
  }

  /* Menu sur téléphone */
  var menuBtn = document.getElementById('menu-btn');
  var nav = document.getElementById('nav');
  function closeMenu() { if (nav && menuBtn) { nav.classList.remove('open'); menuBtn.setAttribute('aria-expanded', 'false'); } }
  if (menuBtn && nav) {
    menuBtn.addEventListener('click', function () {
      var open = nav.classList.toggle('open');
      menuBtn.setAttribute('aria-expanded', String(open));
      if (open) { var first = nav.querySelector('a'); if (first) first.focus(); }
    });
    nav.addEventListener('click', function (e) { if (e.target.closest('a')) closeMenu(); });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && nav.classList.contains('open')) { closeMenu(); menuBtn.focus(); }
    });
  }

  /* Prix : données dans prix.json (voir README.md), lues au chargement. Le HTML de la page sert de repli
     (fichier absent, invalide ou lent, JavaScript désactivé). Tout le DOM est construit avec textContent. */
  var SCRIPT_SRC = document.currentScript && document.currentScript.src;
  var PX = ar ? {
    mois: 'شهريًا، دون احتساب الضريبة', unique: 'دون احتساب الضريبة', soon: 'قريبًا', ribbon: 'ننصح به', cta: 'اطلب عرضًا توضيحيًا',
    was: 'بدلًا من ', dev: 'درهم'
  } : {
    mois: 'HT / mois', unique: 'HT', soon: 'Bientôt', ribbon: 'Conseillé', cta: 'Demander une démo', was: 'au lieu de ', dev: 'DH'
  };
  var SVGNS = 'http://www.w3.org/2000/svg';
  var ICONS = { server: 'i-server', users: 'i-users', spark: 'i-spark', check: 'i-check' };
  var PERIODS = { mois: 1, unique: 1, devis: 1, bientot: 1 };

  function fmt(n) {
    var s = (Math.round(n * 100) / 100).toFixed(2).replace(/\.00$/, '').replace('.', ',');
    var parts = s.split(',');
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
    return parts.join(',');
  }
  function isNum(v) { return typeof v === 'number' && isFinite(v) && v >= 0 && v <= 1000000; }
  function isText(v) { return typeof v === 'string' && v.trim().length > 0 && v.length <= 400; }
  /* Texte bilingue {fr, ar} -> texte de la langue de la page (repli sur le français) ; null si absent. */
  function loc(o) {
    if (!o || typeof o !== 'object') return null;
    var v = ar && isText(o.ar) ? o.ar : (isText(o.fr) ? o.fr : null);
    return v === null ? null : v.trim();
  }
  function today() {
    var d = new Date(), m = d.getMonth() + 1, j = d.getDate();
    return d.getFullYear() + '-' + (m < 10 ? '0' : '') + m + '-' + (j < 10 ? '0' : '') + j;
  }
  function validDate(v) { return typeof v === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(v); }

  /* Valide un pack ; renvoie un objet prêt à afficher ou null (carte ignorée). */
  function normalize(p, day) {
    if (!p || typeof p !== 'object' || p.visible === false) return null;
    if (typeof p.id !== 'string' || !/^[a-z0-9-]{1,40}$/.test(p.id)) return null;
    if (!PERIODS[p.periodicite]) return null;
    var nom = loc(p.nom);
    if (!nom) return null;
    var out = { id: p.id, ordre: typeof p.ordre === 'number' && isFinite(p.ordre) ? p.ordre : 0, nom: nom, per: p.periodicite,
      star: p.mis_en_avant === true, ribbon: loc(p.bandeau) || PX.ribbon, icone: ICONS[p.icone] ? p.icone : null,
      desc: loc(p.description), texte: loc(p.prix_texte), prix: null, barre: null, etiquette: null, points: [] };
    if (p.prix !== null && p.prix !== undefined) { if (!isNum(p.prix)) return null; out.prix = p.prix; }
    if (p.prix_barre !== null && p.prix_barre !== undefined) { if (!isNum(p.prix_barre)) return null; out.barre = p.prix_barre; }
    var promo = p.promo;
    if (promo !== null && promo !== undefined) {
      if (typeof promo !== 'object') return null;
      if (promo.jusqu_au !== null && promo.jusqu_au !== undefined && !validDate(promo.jusqu_au)) return null;
    }
    if (out.prix === null && !out.texte) {
      if (p.periodicite === 'mois' || p.periodicite === 'unique') return null; /* ni prix ni texte : rien à afficher */
    }
    /* Promotion : valide tant que la date du jour <= jusqu_au (ou sans date). Expirée : l'ancien prix redevient le prix. */
    if (out.prix !== null && out.barre !== null && out.barre > out.prix) {
      var fin = promo && promo.jusqu_au;
      if (fin && day > fin) { out.prix = out.barre; out.barre = null; }
      else {
        var tag = promo ? loc(promo.etiquette) : null;
        if (!tag && promo) tag = '-' + Math.round((1 - out.prix / out.barre) * 100) + (ar ? '٪' : ' %');
        out.etiquette = tag;
      }
    } else { out.barre = null; }
    var pts = p.points && Array.isArray(p.points[ar ? 'ar' : 'fr']) ? p.points[ar ? 'ar' : 'fr'] : (p.points && Array.isArray(p.points.fr) ? p.points.fr : []);
    pts.slice(0, 12).forEach(function (t) { if (isText(t)) out.points.push(t.trim()); });
    return out;
  }

  function el(tag, cls, text) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text !== undefined && text !== null) e.textContent = text;
    return e;
  }
  function icon(id, cls) {
    var svg = document.createElementNS(SVGNS, 'svg'), use = document.createElementNS(SVGNS, 'use');
    svg.setAttribute('class', cls || 'i'); svg.setAttribute('aria-hidden', 'true');
    use.setAttribute('href', '#' + id); svg.appendChild(use);
    return svg;
  }
  function priceLine(p, devise) {
    var line = el('p', 'price' + (p.prix === null ? ' text' : ''));
    var bdi = el('bdi');
    if (p.prix !== null) {
      if (p.barre !== null) {
        var del = el('del', 'was', fmt(p.barre) + ' ' + devise);
        var sr = el('span', 'sr-only', PX.was + fmt(p.barre) + ' ' + devise);
        /* Texte accessible : « 490 DH, au lieu de 590 DH » ; l'ancien prix barré est masqué aux lecteurs d'écran. */
        del.setAttribute('aria-hidden', 'true');
        bdi.appendChild(el('span', 'now', fmt(p.prix) + ' ' + devise));
        bdi.appendChild(document.createTextNode(' '));
        bdi.appendChild(del);
        bdi.appendChild(sr);
      } else bdi.appendChild(document.createTextNode(fmt(p.prix) + ' ' + devise));
      line.appendChild(bdi);
      if (p.per === 'mois' || p.per === 'unique') line.appendChild(el('small', null, PX[p.per]));
      if (p.etiquette) line.appendChild(el('span', 'promo-tag', p.etiquette));
    } else {
      bdi.textContent = p.texte || '';
      line.appendChild(bdi);
      if (p.texte && p.per === 'unique') line.appendChild(el('small', null, PX.unique));
    }
    return line;
  }
  function planCard(p, devise) {
    var art = el('article', 'card plan' + (p.star ? ' featured' : '') + (p.per === 'bientot' ? ' is-soon' : ''));
    art.setAttribute('aria-labelledby', 'p-' + p.id);
    if (p.star) art.appendChild(el('span', 'ribbon', p.ribbon));
    if (p.per === 'bientot') { var w = el('p'); w.appendChild(el('span', 'soon', PX.soon)); art.appendChild(w); }
    var h = el('h3', null, p.nom); h.id = 'p-' + p.id; art.appendChild(h);
    if (p.prix !== null || p.texte) art.appendChild(priceLine(p, devise)); /* « Bientôt » sans prix : pas de ligne vide */
    var ul = el('ul', 'checks');
    p.points.forEach(function (t) {
      var li = el('li'); li.appendChild(icon(p.per === 'bientot' ? 'i-spark' : 'i-check'));
      li.appendChild(el('span', null, t)); ul.appendChild(li);
    });
    art.appendChild(ul);
    if (p.per === 'bientot') { if (p.desc) art.appendChild(el('p', 'muted', p.desc)); }
    else {
      var a = el('a', 'btn ' + (p.star ? 'btn-primary' : 'btn-ghost'), PX.cta); a.setAttribute('href', '#demo'); art.appendChild(a);
    }
    return art;
  }
  function extraCard(p, devise) {
    var art = el('article', 'card');
    art.setAttribute('aria-labelledby', 'p-' + p.id);
    var h = el('h3'); h.id = 'p-' + p.id;
    if (p.icone) { var b = el('span', 'badge-ico'); b.appendChild(icon(ICONS[p.icone])); h.appendChild(b); }
    h.appendChild(document.createTextNode(p.nom)); art.appendChild(h);
    if (p.desc) art.appendChild(el('p', null, p.desc));
    art.appendChild(priceLine(p, devise));
    return art;
  }
  function render(data) {
    if (!data || data.version !== 1 || !Array.isArray(data.packs)) return false;
    var devise = typeof data.devise === 'string' && data.devise.length <= 8 && data.devise.trim() ? data.devise.trim() : PX.dev;
    if (ar && devise === 'DH') devise = PX.dev;
    var day = today(), plans = [], extras = [];
    data.packs.slice(0, 12).forEach(function (raw) {
      var p;
      try { p = normalize(raw, day); } catch (e) { p = null; }
      if (!p) return;
      (p.per === 'mois' || p.per === 'bientot' ? plans : extras).push(p);
    });
    var byOrder = function (a, b) { return a.ordre - b.ordre; };
    plans.sort(byOrder); extras.sort(byOrder);
    var plansBox = document.querySelector('#offres .plans'), extrasBox = document.querySelector('#offres .extras');
    if (!plans.length && !extras.length) return false;
    if (plansBox && plans.length) { plansBox.textContent = ''; plans.forEach(function (p) { plansBox.appendChild(planCard(p, devise)); }); }
    if (extrasBox && extras.length) { extrasBox.textContent = ''; extras.forEach(function (p) { extrasBox.appendChild(extraCard(p, devise)); }); }
    var note = document.querySelector('#offres .wrap > .note'), m = loc(data.mention);
    if (note && m) note.textContent = m;
    return true;
  }
  (function loadPrices() {
    if (!SCRIPT_SRC || !window.fetch) return;
    var url, ctl = window.AbortController ? new AbortController() : null;
    try { url = new URL('../prix.json', SCRIPT_SRC).href; } catch (e) { return; }
    var timer = setTimeout(function () { if (ctl) ctl.abort(); }, 3000);
    fetch(url, { cache: 'no-store', credentials: 'omit', signal: ctl ? ctl.signal : undefined })
      .then(function (r) { if (!r.ok) throw new Error('http'); return r.json(); })
      .then(function (d) { clearTimeout(timer); render(d); })
      .catch(function () { clearTimeout(timer); /* repli : le HTML de la page reste */ });
  })();

  /* Essayer la démo : POST JSON vers l'API publique, même origine que l'application (pas de CSRF : l'API est sans
     cookie ; le navigateur envoie Sec-Fetch-Site: same-origin). Le mot de passe provisoire n'est ni stocké ni mis dans l'URL. */
  var eForm = document.getElementById('essai-form');
  if (eForm && !PUBLIC) (function () {
    var endpoint = (R.demo && R.demo.endpoint) || '/api/public/demo-accounts';
    var f = eForm.elements;
    var msgEl = document.getElementById('essai-msg');
    var btn = document.getElementById('essai-submit');
    var busy = false;
    var FIELDS = { fullName: 'e-nom', pharmacyName: 'e-pharmacie', email: 'e-email', phone: 'e-tel', consent: 'e-consent' };
    function setErr(id, text) {
      var input = document.getElementById(id), out = document.getElementById(id.replace(/$/, '-err'));
      if (out) out.textContent = text || '';
      if (input) { if (text) input.setAttribute('aria-invalid', 'true'); else input.removeAttribute('aria-invalid'); }
    }
    function status(text, err) { msgEl.textContent = text; msgEl.className = 'form-msg' + (err ? ' err' : ''); }
    function clearAll() { Object.keys(FIELDS).forEach(function (k) { setErr(FIELDS[k], ''); }); status('', false); }
    function validate() {
      var bad = null;
      function need(name, ok, text) { if (!ok) { setErr(FIELDS[name], text); if (!bad) bad = FIELDS[name]; } }
      need('fullName', f.fullName.value.trim().length > 0, TE.required);
      need('pharmacyName', f.pharmacyName.value.trim().length > 0, TE.required);
      var mail = f.email.value.trim();
      need('email', mail.length > 0 ? /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(mail) : false, mail ? TE.email : TE.required);
      need('consent', f.consent.checked, TE.consent);
      if (bad) { document.getElementById(bad).focus(); status(TE.fix, true); }
      return !bad;
    }
    function fallback(text) {
      /* Démo désactivée ou service indisponible : on laisse le formulaire de contact (mailto / WhatsApp). */
      status(text, true);
      var note = document.getElementById('demo-note');
      if (note) { note.textContent = text; note.hidden = false; }
      var d = document.getElementById('demo');
      if (d) { d.scrollIntoView(); }
    }
    function serverFields(body) {
      var errs = body && (body.errors || body.fieldErrors || body.violations), shown = false;
      if (Array.isArray(errs)) errs.forEach(function (x) {
        var id = x && FIELDS[x.field || x.name];
        if (id) { setErr(id, ar ? TE.required : String(x.message || x.detail || TE.required)); shown = true; }
      });
      else if (errs && typeof errs === 'object') Object.keys(errs).forEach(function (k) {
        var m = errs[k], id = FIELDS[k];
        if (id) { setErr(id, ar ? TE.required : String(Array.isArray(m) ? m[0] : m)); shown = true; }
      });
      return shown;
    }
    function safeLogin(path, user) {
      /* Chemin interne uniquement (pas de //, pas de schéma) : sinon on reconstruit le lien nous-mêmes. */
      if (typeof path === 'string' && /^\/(?!\/)[\w\-./?=&%]*$/.test(path)) return path;
      return '/' + (ar ? 'ar' : 'fr') + '/login?u=' + encodeURIComponent(user);
    }
    function show(d) {
      document.getElementById('r-user').textContent = d.username;
      document.getElementById('r-pass').textContent = d.temporaryPassword;
      var exp = '';
      try { exp = new Date(d.expiresAt).toLocaleDateString(TE.locale, { day: 'numeric', month: 'long', year: 'numeric' }); } catch (e) { exp = String(d.expiresAt || ''); }
      document.getElementById('r-exp').textContent = exp === 'Invalid Date' ? '' : exp;
      document.getElementById('r-go').setAttribute('href', safeLogin(d.loginPath, d.username));
      eForm.hidden = true;
      var res = document.getElementById('essai-result');
      res.hidden = false;
      var title = document.getElementById('essai-result-title');
      title.focus();
      title.scrollIntoView({ block: 'start' });
    }
    eForm.addEventListener('submit', function (e) {
      e.preventDefault();
      if (busy) return;
      clearAll();
      if (!validate()) return;
      busy = true; btn.disabled = true; status(TE.busy, false);
      var payload = {
        fullName: f.fullName.value.trim(), pharmacyName: f.pharmacyName.value.trim(), email: f.email.value.trim(),
        consent: true, website: f.website.value, locale: ar ? 'ar' : 'fr'
      };
      var tel = f.phone.value.trim();
      if (tel) payload.phone = tel;
      fetch(endpoint, {
        method: 'POST', credentials: 'same-origin', cache: 'no-store',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify(payload)
      }).then(function (r) {
        if (r.status === 201) return r.json().then(function (d) {
          if (!d || !d.username || !d.temporaryPassword) throw new Error('bad');
          status('', false); show(d);
        });
        if (r.status === 404) { fallback(TE.off); return; }
        if (r.status === 429) { status(TE.wait, true); return; }
        if (r.status === 400) return r.json().catch(function () { return null; }).then(function (b) {
          var any = serverFields(b); status(TE.fix, true);
          if (any) { var first = eForm.querySelector('[aria-invalid="true"]'); if (first) first.focus(); }
        });
        fallback(TE.fail);
      }).catch(function () { fallback(TE.fail); }).then(function () { busy = false; btn.disabled = false; });
    });
    var copy = document.getElementById('r-copy');
    copy.addEventListener('click', function () {
      var pass = document.getElementById('r-pass').textContent, out = document.getElementById('copy-msg');
      function ok() { out.textContent = TE.copied; out.className = 'form-msg'; }
      function ko() {
        out.textContent = TE.copyFail; out.className = 'form-msg err';
        var sel = window.getSelection(), range = document.createRange();
        range.selectNodeContents(document.getElementById('r-pass')); sel.removeAllRanges(); sel.addRange(range);
      }
      if (navigator.clipboard && window.isSecureContext) navigator.clipboard.writeText(pass).then(ok, ko); else ko();
    });
  })();

  /* Demande de démonstration : aucun envoi vers un serveur, on prépare un e-mail ou un message WhatsApp. */
  var form = document.getElementById('demo-form');
  if (!form) return;
  var msg = document.getElementById('form-msg');
  /* WhatsApp masqué tant que le numéro n'est pas défini dans reglages.js. */
  var waNum = (R.contact || {}).whatsapp;
  if (!waNum || waNum === 'CONTACT_A_DEFINIR') {
    var waBtn = form.querySelector('button[value="whatsapp"]');
    if (waBtn) waBtn.hidden = true;
  }
  /* Version publique : code de source facultatif ?ref=PUB-A (campagne de test), ajouté en tête du sujet et du message
     pour compter les demandes par annonce, sans cookie, stockage ni traqueur. Valeur hors format : ignorée. */
  var ref = '';
  if (PUBLIC) try {
    var rv = new URLSearchParams(window.location.search).get('ref');
    if (rv && /^[A-Za-z0-9_-]{1,20}$/.test(rv)) ref = '[' + rv + '] ';
  } catch (e) { ref = ''; }
  /* Le code suit le changement de langue (même page, autre langue), rien n'est mémorisé ailleurs. */
  if (ref) Array.prototype.forEach.call(document.querySelectorAll('a[hreflang]'), function (a) {
    var h = a.getAttribute('href');
    if (h && h.indexOf('?') < 0 && h.indexOf('#') < 0) a.setAttribute('href', h + '?ref=' + encodeURIComponent(ref.slice(1, -2)));
  });
  function say(text, err) { msg.textContent = text; msg.className = 'form-msg' + (err ? ' err' : ''); }
  function body() {
    var f = form.elements;
    var vals = [f.pharmacie.value, f.ville.value, f.nom.value, f.telephone.value, f.postes.value, f.offre.value, f.message.value];
    return vals.map(function (v, i) { return v ? T.labels[i] + ' : ' + v.trim() : ''; }).filter(Boolean).join('\n');
  }
  function valid() {
    var ok = form.checkValidity();
    if (!ok) {
      say(T.required, true);
      var bad = form.querySelector(':invalid');
      if (bad) bad.focus();
    }
    return ok;
  }
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var via = (e.submitter && e.submitter.value) || 'email';
    if (!valid()) return;
    var c = R.contact || {};
    var target = via === 'whatsapp' ? c.whatsapp : c.email;
    if (!target || target === 'CONTACT_A_DEFINIR') { say(T.missing, true); return; }
    if (via === 'whatsapp') {
      window.open('https://wa.me/' + encodeURIComponent(target) + '?text=' + encodeURIComponent(ref + T.subject + '\n' + body()), '_blank', 'noopener');
      say(T.sentWa, false);
    } else {
      // Crochet de test : les vérifications automatiques interceptent l'adresse au lieu d'ouvrir la messagerie du poste.
      (window.DWAYA_NAVIGATE || function (u) { window.location.href = u; })('mailto:' + target + '?subject=' + encodeURIComponent(ref + T.subject) + '&body=' + encodeURIComponent((ref ? ref.trim() + '\n' : '') + body()));
      say(T.sentMail, false);
    }
  });
})();
