/* TipJar — Nimiq Pay Mini App (single page, no backend, no build step)
 *
 * Wallet access: @nimiq/mini-app-sdk (pinned CDN build) -> init() -> provider.
 * Fallback chain: SDK import/init fails -> injected window.nimiq -> demo mode.
 * Everything degrades gracefully in a plain browser.
 */

const SDK_URL = 'https://cdn.jsdelivr.net/npm/@nimiq/mini-app-sdk@0.2.5/dist/index.js';
const LUNA_PER_NIM = 100000; // 1 NIM = 100,000 luna (per SDK docs)
const USDT_POLYGON = '0xc2132D05D31c914a87C6611C10748AEb04B58e8F'; // USDT on Polygon PoS
const POLYGON_CHAIN_ID = '0x89'; // 137

const LS = {
  creator: 'tipjar.creatorAddress',
  creatorEvm: 'tipjar.creatorEvm',
  guestbook: 'tipjar.guestbook.v1',
  deviceId: 'tipjar.deviceId',
};

/* ---------------- i18n (default English; host language when in Nimiq Pay) ------- */
const STRINGS = {
  en: {
    badgeDemo: 'Demo mode', bannerTitle: 'Open this page in Nimiq Pay',
    bannerText: 'TipJar runs as a Mini App inside Nimiq Pay, where tipping is one tap. You can preview everything here, but sending a tip needs the Nimiq Pay wallet.',
    bannerButton: 'Open in Nimiq Pay',
    creatorTitle: 'Your tip page', creatorHint: 'Paste your Nimiq address once. It stays on this device only.',
    creatorAddressLabel: 'Your Nimiq address', creatorEvmLabel: 'Your Polygon address (optional, for USDT tips)',
    saveButton: 'Save & get my link', fillMineButton: 'Use my wallet address',
    shareLinkLabel: 'Your shareable tip link', copyButton: 'Copy',
    qrFallback: 'QR code unavailable (library failed to load) — copy the link instead.',
    tipTitle: 'Tip', tipToLabel: 'Sending to', customAmountLabel: 'Custom amount (NIM)',
    tipButton: 'Send tip',
    usdtHint: 'Prefer USDT? This creator also accepts USDT on Polygon. The amount above is used as the USDT amount.',
    usdtButton: 'Tip with USDT (Polygon)',
    guestbookTitle: 'Guestbook',
    guestbookHint: 'Leave a note on the wall. Inside Nimiq Pay you sign it with your wallet — no transaction, no fee.',
    guestbookNameLabel: 'Your name (optional)', guestbookMsgLabel: 'Message',
    guestbookButton: 'Sign & post', guestbookEmpty: 'No notes yet — be the first.',
    footerText: 'A Nimiq Pay Mini App. No backend, no tracking — your data stays on this device.',
    copied: 'Copied!', invalidAddress: 'That does not look like a valid Nimiq address (NQ…).',
    invalidEvm: 'That does not look like a valid Polygon (0x…) address — or clear the field.',
    saved: 'Saved. Share your link or QR code anywhere.',
    pickAmount: 'Pick or enter an amount first.',
    demoTip: 'Demo mode: open this page inside Nimiq Pay to send a real tip.',
    sending: 'Waiting for confirmation in Nimiq Pay…',
    tipSent: (amt) => `Tip sent — thank you! (${amt} NIM)`,
    tipRef: (ref) => `Transaction: ${ref}`,
    tipFailed: (m) => `Tip failed: ${m}`,
    rejected: 'Request was rejected or cancelled.',
    gbNeedMsg: 'Write a message first.',
    gbSigning: 'Waiting for your signature in Nimiq Pay…',
    gbPosted: 'Posted to the wall.',
    gbDuplicate: 'That note is already on the wall from this device.',
    gbDemoPosted: 'Posted (demo mode — unsigned). Open in Nimiq Pay to sign your notes.',
    gbFailed: (m) => `Could not post: ${m}`,
    signedChip: 'signed', demoChip: 'demo',
    usdtNoWallet: 'No EVM wallet found in this browser.',
    usdtSending: 'Confirm the USDT transfer in your wallet…',
    usdtSent: (h) => `USDT tip sent. Tx: ${h}`,
    usdtFailed: (m) => `USDT tip failed: ${m}`,
  },
  es: {
    badgeDemo: 'Modo demo', bannerTitle: 'Abre esta página en Nimiq Pay',
    bannerText: 'TipJar funciona como Mini App dentro de Nimiq Pay, donde propinar es un solo toque. Puedes previsualizar todo aquí, pero enviar una propina necesita la billetera de Nimiq Pay.',
    bannerButton: 'Abrir en Nimiq Pay',
    creatorTitle: 'Tu página de propinas', creatorHint: 'Pega tu dirección Nimiq una vez. Se queda solo en este dispositivo.',
    creatorAddressLabel: 'Tu dirección Nimiq', creatorEvmLabel: 'Tu dirección de Polygon (opcional, para propinas en USDT)',
    saveButton: 'Guardar y obtener mi enlace', fillMineButton: 'Usar la dirección de mi billetera',
    shareLinkLabel: 'Tu enlace para compartir', copyButton: 'Copiar',
    qrFallback: 'Código QR no disponible — copia el enlace.',
    tipTitle: 'Propina', tipToLabel: 'Enviando a', customAmountLabel: 'Cantidad personalizada (NIM)',
    tipButton: 'Enviar propina',
    guestbookTitle: 'Libro de visitas',
    guestbookHint: 'Deja una nota en el muro. En Nimiq Pay la firmas con tu billetera — sin transacción, sin comisiones.',
    guestbookNameLabel: 'Tu nombre (opcional)', guestbookMsgLabel: 'Mensaje',
    guestbookButton: 'Firmar y publicar', guestbookEmpty: 'Aún no hay notas — sé el primero.',
    copied: '¡Copiado!', invalidAddress: 'Eso no parece una dirección Nimiq válida (NQ…).',
    pickAmount: 'Elige o escribe una cantidad primero.',
    demoTip: 'Modo demo: abre esta página dentro de Nimiq Pay para enviar una propina real.',
    tipSent: (amt) => `Propina enviada — ¡gracias! (${amt} NIM)`,
    rejected: 'La solicitud fue rechazada o cancelada.',
    gbNeedMsg: 'Escribe un mensaje primero.',
    gbPosted: 'Publicado en el muro.',
    gbDuplicate: 'Esa nota ya está en el muro desde este dispositivo.',
  },
  de: {
    badgeDemo: 'Demo-Modus', bannerTitle: 'Öffne diese Seite in Nimiq Pay',
    bannerText: 'TipJar läuft als Mini App in Nimiq Pay — dort ist ein Trinkgeld nur einen Tipp entfernt. Hier kannst du alles ansehen, zum Senden brauchst du die Nimiq-Pay-Wallet.',
    bannerButton: 'In Nimiq Pay öffnen',
    creatorTitle: 'Deine Trinkgeld-Seite', creatorHint: 'Füge deine Nimiq-Adresse einmal ein. Sie bleibt nur auf diesem Gerät.',
    creatorAddressLabel: 'Deine Nimiq-Adresse', creatorEvmLabel: 'Deine Polygon-Adresse (optional, für USDT)',
    saveButton: 'Speichern & Link erhalten', fillMineButton: 'Adresse meiner Wallet nutzen',
    shareLinkLabel: 'Dein teilbarer Link', copyButton: 'Kopieren',
    qrFallback: 'QR-Code nicht verfügbar — kopiere stattdessen den Link.',
    tipTitle: 'Trinkgeld', tipToLabel: 'Empfänger', customAmountLabel: 'Eigener Betrag (NIM)',
    tipButton: 'Trinkgeld senden',
    guestbookTitle: 'Gästebuch',
    guestbookHint: 'Hinterlasse eine Nachricht an der Wand. In Nimiq Pay signierst du sie mit deiner Wallet — keine Transaktion, keine Gebühr.',
    guestbookNameLabel: 'Dein Name (optional)', guestbookMsgLabel: 'Nachricht',
    guestbookButton: 'Signieren & posten', guestbookEmpty: 'Noch keine Einträge — sei der Erste.',
    copied: 'Kopiert!', invalidAddress: 'Das sieht nicht nach einer gültigen Nimiq-Adresse aus (NQ…).',
    pickAmount: 'Wähle zuerst einen Betrag oder gib einen ein.',
    demoTip: 'Demo-Modus: Öffne diese Seite in Nimiq Pay, um ein echtes Trinkgeld zu senden.',
    tipSent: (amt) => `Trinkgeld gesendet — danke! (${amt} NIM)`,
    rejected: 'Die Anfrage wurde abgelehnt oder abgebrochen.',
    gbNeedMsg: 'Schreibe zuerst eine Nachricht.',
    gbPosted: 'An die Wand gepostet.',
    gbDuplicate: 'Dieser Eintrag ist von diesem Gerät schon an der Wand.',
  },
};

const hostLang = (window.nimiqPay && window.nimiqPay.language) || navigator.language || 'en';
const lang = STRINGS[hostLang.slice(0, 2)] ? hostLang.slice(0, 2) : 'en';
const t = (key, ...args) => {
  const val = (STRINGS[lang] && STRINGS[lang][key]) ?? STRINGS.en[key] ?? key;
  return typeof val === 'function' ? val(...args) : val;
};
function applyI18n() {
  document.documentElement.lang = lang;
  document.querySelectorAll('[data-i18n]').forEach((el) => { el.textContent = t(el.dataset.i18n); });
}

/* ---------------- helpers --------------------------------------------------- */
const $ = (id) => document.getElementById(id);
const NIMIQ_CHARS = '0123456789ABCDEFGHJKLMNPQRSTUVXY'; // Nimiq address alphabet

function normalizeAddress(raw) {
  return (raw || '').replace(/\s+/g, '').toUpperCase();
}
function isValidNimiqAddress(raw) {
  const a = normalizeAddress(raw);
  if (a.length !== 36 || !a.startsWith('NQ')) return false;
  if (!/^\d{2}$/.test(a.slice(2, 4))) return false;
  return [...a.slice(4)].every((c) => NIMIQ_CHARS.includes(c));
}
function formatAddress(raw) {
  const a = normalizeAddress(raw);
  return a.replace(/(.{4})/g, '$1 ').trim();
}
function shortenAddress(raw) {
  const f = formatAddress(raw);
  const groups = f.split(' ');
  return groups.length > 2 ? `${groups[0]} ${groups[1]} … ${groups[groups.length - 1]}` : f;
}
function isValidEvmAddress(raw) {
  return /^0x[0-9a-fA-F]{40}$/.test((raw || '').trim());
}
function lsGet(key) { try { return localStorage.getItem(key); } catch { return null; } }
function lsSet(key, val) { try { localStorage.setItem(key, val); } catch { /* storage unavailable */ } }
function getDeviceId() {
  let id = lsGet(LS.deviceId);
  if (!id) {
    id = (crypto.randomUUID ? crypto.randomUUID()
      : 'dev-' + Math.random().toString(36).slice(2) + Date.now().toString(36));
    lsSet(LS.deviceId, id);
  }
  return id;
}
function setStatus(el, msg, kind) {
  el.textContent = msg || '';
  el.className = 'status' + (kind ? ' ' + kind : '');
}
function errText(err) {
  if (!err) return t('rejected');
  const msg = err.message || err.type || String(err);
  if (/reject|cancel|denied|abort/i.test(msg)) return t('rejected');
  return msg;
}
/** Unwrap legacy {error} responses from a raw injected provider. */
function unwrap(res) {
  if (res && typeof res === 'object' && res.error) {
    throw new Error(res.error.message || res.error.type || 'Provider error');
  }
  return res;
}

/* ---------------- provider bootstrap ---------------------------------------- */
let provider = null;      // Nimiq provider (SDK-wrapped or raw window.nimiq)
let inNimiqPay = !!window.nimiqPay;
let myAccounts = [];
let lastTip = null;       // { amountNim, ref } for this session, shown in guestbook meta

async function initProvider() {
  // 1) Official SDK (pinned CDN ESM build)
  try {
    const sdk = await Promise.race([
      import(/* @vite-ignore */ SDK_URL),
      new Promise((_, rej) => setTimeout(() => rej(new Error('sdk load timeout')), 10000)),
    ]);
    provider = await sdk.init({ timeout: 8000 });
  } catch (e) {
    provider = null;
  }
  // 2) Raw injected provider fallback (host exposes window.nimiq)
  if (!provider && window.nimiq && typeof window.nimiq.listAccounts === 'function') {
    provider = window.nimiq;
  }
  if (provider) {
    inNimiqPay = true;
    try { myAccounts = unwrap(await provider.listAccounts()) || []; } catch { myAccounts = []; }
    if (typeof provider.on === 'function') {
      try {
        provider.on('accountsChanged', (accs) => { myAccounts = accs || []; refreshFillMine(); });
      } catch { /* events optional */ }
    }
  }
  return provider;
}

/* ---------------- tip target / creator setup -------------------------------- */
const params = new URLSearchParams(location.search);
const tipTarget = params.get('to') || '';
const tipTargetEvm = params.get('evm') || '';

function buildTipLink(address, evm) {
  const url = new URL(location.href);
  url.search = '';
  url.searchParams.set('to', normalizeAddress(address));
  if (evm && isValidEvmAddress(evm)) url.searchParams.set('evm', evm.trim());
  return url.toString();
}

function renderQr(link) {
  const box = $('qrBox');
  box.innerHTML = '';
  if (window.__qrLibFailed || typeof window.qrcode !== 'function') {
    $('qrFallback').hidden = false;
    return;
  }
  try {
    const qr = window.qrcode(0, 'M'); // type 0 = auto size
    qr.addData(link);
    qr.make();
    box.innerHTML = qr.createSvgTag({ cellSize: 5, margin: 8, scalable: true });
    $('qrFallback').hidden = true;
  } catch {
    $('qrFallback').hidden = false;
  }
}

function refreshShareBox() {
  const addr = lsGet(LS.creator);
  if (!addr || !isValidNimiqAddress(addr)) { $('shareBox').hidden = true; return; }
  const evm = lsGet(LS.creatorEvm) || '';
  const link = buildTipLink(addr, evm);
  $('shareLink').value = link;
  $('shareBox').hidden = false;
  renderQr(link);
}

function refreshFillMine() {
  $('fillMine').hidden = !(provider && myAccounts && myAccounts.length);
}

function setupCreator() {
  const saved = lsGet(LS.creator);
  if (saved) $('creatorAddress').value = formatAddress(saved);
  const savedEvm = lsGet(LS.creatorEvm);
  if (savedEvm) $('creatorEvm').value = savedEvm;
  refreshShareBox();

  $('saveCreator').addEventListener('click', () => {
    const addr = $('creatorAddress').value;
    const evm = $('creatorEvm').value.trim();
    const errEl = $('creatorError');
    if (!isValidNimiqAddress(addr)) {
      errEl.textContent = t('invalidAddress');
      errEl.hidden = false;
      return;
    }
    if (evm && !isValidEvmAddress(evm)) {
      errEl.textContent = t('invalidEvm');
      errEl.hidden = false;
      return;
    }
    errEl.hidden = true;
    lsSet(LS.creator, normalizeAddress(addr));
    if (evm) lsSet(LS.creatorEvm, evm); else { try { localStorage.removeItem(LS.creatorEvm); } catch {} }
    $('creatorAddress').value = formatAddress(addr);
    refreshShareBox();
    setStatus($('tipStatus'), '', '');
    $('shareBox').scrollIntoView({ behavior: 'smooth', block: 'center' });
  });

  $('fillMine').addEventListener('click', () => {
    if (myAccounts && myAccounts.length) {
      $('creatorAddress').value = formatAddress(myAccounts[0]);
    }
  });

  $('copyLink').addEventListener('click', async () => {
    const input = $('shareLink');
    try { await navigator.clipboard.writeText(input.value); }
    catch { input.select(); document.execCommand('copy'); }
    $('copyLink').textContent = t('copied');
    setTimeout(() => { $('copyLink').textContent = t('copyButton'); }, 1500);
  });
}

/* ---------------- tipping (NIM) ---------------------------------------------- */
let selectedAmount = null;

function chosenAmount() {
  const custom = parseFloat($('customAmount').value);
  if (Number.isFinite(custom) && custom > 0) return custom;
  return selectedAmount;
}

function setupTipping() {
  const target = tipTarget || lsGet(LS.creator) || '';
  if (!target || !isValidNimiqAddress(target)) { $('tipCard').hidden = true; return; }
  $('tipCard').hidden = false;
  $('tipTargetShort').textContent = shortenAddress(target);
  $('tipTargetFull').textContent = formatAddress(target);

  document.querySelectorAll('.amount-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.amount-btn').forEach((b) => b.classList.remove('selected'));
      btn.classList.add('selected');
      selectedAmount = parseFloat(btn.dataset.amount);
      $('customAmount').value = '';
    });
  });
  $('customAmount').addEventListener('input', () => {
    if ($('customAmount').value) {
      document.querySelectorAll('.amount-btn').forEach((b) => b.classList.remove('selected'));
    }
  });

  // Optional USDT section: needs a creator Polygon address AND an EVM provider.
  if (tipTargetEvm && isValidEvmAddress(tipTargetEvm) && window.ethereum) {
    $('usdtBox').hidden = false;
    $('usdtButton').addEventListener('click', () => tipWithUsdt(target));
  }

  $('tipButton').addEventListener('click', async () => {
    const amount = chosenAmount();
    if (!amount || amount <= 0) { setStatus($('tipStatus'), t('pickAmount'), 'err'); return; }
    if (!provider) {
      setStatus($('tipStatus'), t('demoTip'), 'err');
      $('openInAppBanner').hidden = false;
      $('openInAppBanner').scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }
    const btn = $('tipButton');
    btn.disabled = true;
    setStatus($('tipStatus'), t('sending'), '');
    try {
      const valueLuna = Math.round(amount * LUNA_PER_NIM);
      const result = unwrap(await provider.sendBasicTransaction({
        recipient: normalizeAddress(target),
        value: valueLuna,
      }));
      const ref = typeof result === 'string' ? result : (result && (result.hash || '')) || '';
      lastTip = { amountNim: amount, ref };
      setStatus($('tipStatus'),
        t('tipSent', amount) + (ref ? '\n' + t('tipRef', ref.length > 44 ? ref.slice(0, 44) + '…' : ref) : ''),
        'ok');
    } catch (err) {
      setStatus($('tipStatus'), t('tipFailed', errText(err)), 'err');
    } finally {
      btn.disabled = false;
    }
  });
}

/* ---------------- optional USDT on Polygon via window.ethereum --------------- */
function erc20TransferData(to, amountBaseUnits) {
  const addr = to.toLowerCase().replace(/^0x/, '').padStart(64, '0');
  const val = amountBaseUnits.toString(16).padStart(64, '0');
  return '0xa9059cbb' + addr + val;
}

async function tipWithUsdt() {
  const eth = window.ethereum;
  const status = $('usdtStatus');
  if (!eth) { setStatus(status, t('usdtNoWallet'), 'err'); return; }
  const amount = chosenAmount();
  if (!amount || amount <= 0) { setStatus(status, t('pickAmount'), 'err'); return; }
  const btn = $('usdtButton');
  btn.disabled = true;
  setStatus(status, t('usdtSending'), '');
  try {
    const accounts = await eth.request({ method: 'eth_requestAccounts' });
    const from = accounts && accounts[0];
    if (!from) throw new Error(t('rejected'));
    let chainId = await eth.request({ method: 'eth_chainId' });
    if (chainId !== POLYGON_CHAIN_ID) {
      await eth.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: POLYGON_CHAIN_ID }],
      });
      chainId = POLYGON_CHAIN_ID;
    }
    const baseUnits = BigInt(Math.round(amount * 1e6)); // USDT has 6 decimals
    const hash = await eth.request({
      method: 'eth_sendTransaction',
      params: [{
        from,
        to: USDT_POLYGON,
        data: erc20TransferData(tipTargetEvm, baseUnits),
      }],
    });
    setStatus(status, t('usdtSent', hash), 'ok');
  } catch (err) {
    setStatus(status, t('usdtFailed', errText(err)), 'err');
  } finally {
    btn.disabled = false;
  }
}

/* ---------------- guestbook --------------------------------------------------- */
function loadGuestbook() {
  try { return JSON.parse(lsGet(LS.guestbook) || '[]'); } catch { return []; }
}
function saveGuestbook(entries) { lsSet(LS.guestbook, JSON.stringify(entries.slice(0, 200))); }

function renderGuestbook() {
  const entries = loadGuestbook();
  const wall = $('gbWall');
  wall.innerHTML = '';
  $('gbEmpty').hidden = entries.length > 0;
  for (const e of entries) {
    const li = document.createElement('li');
    const head = document.createElement('div');
    head.className = 'gb-head';
    const name = document.createElement('span');
    name.className = 'gb-name';
    name.textContent = e.name || 'anon';
    const chip = document.createElement('span');
    chip.className = 'chip' + (e.signature ? '' : ' demo');
    chip.textContent = e.signature ? t('signedChip') : t('demoChip');
    head.append(name, chip);
    const msg = document.createElement('p');
    msg.className = 'gb-msg';
    msg.textContent = e.message;
    const meta = document.createElement('div');
    meta.className = 'gb-meta';
    const parts = [new Date(e.ts).toLocaleString()];
    if (e.tipAmount) parts.push(`tipped ${e.tipAmount} NIM`);
    meta.textContent = parts.join(' · ');
    li.append(head, msg, meta);
    wall.appendChild(li);
  }
}

function setupGuestbook() {
  renderGuestbook();
  $('gbPost').addEventListener('click', async () => {
    const name = $('gbName').value.trim().slice(0, 40);
    const message = $('gbMessage').value.trim().slice(0, 280);
    const status = $('gbStatus');
    if (!message) { setStatus(status, t('gbNeedMsg'), 'err'); return; }

    const deviceId = getDeviceId();
    const dedupKey = deviceId + '|' + message.toLowerCase();
    const entries = loadGuestbook();
    if (entries.some((e) => e.dedupKey === dedupKey)) {
      setStatus(status, t('gbDuplicate'), 'err');
      return;
    }

    const btn = $('gbPost');
    btn.disabled = true;
    let signature = null;
    let publicKey = null;
    try {
      if (provider) {
        setStatus(status, t('gbSigning'), '');
        const toSign = `TipJar guestbook\n${name || 'anon'}: ${message}\n${new Date().toISOString()}`;
        const res = unwrap(await provider.sign(toSign));
        signature = res && res.signature ? res.signature : null;
        publicKey = res && res.publicKey ? res.publicKey : null;
      }
      entries.unshift({
        name, message, signature, publicKey,
        deviceId, dedupKey,
        tipAmount: lastTip ? lastTip.amountNim : null,
        tipRef: lastTip ? lastTip.ref : null,
        ts: Date.now(),
      });
      saveGuestbook(entries);
      renderGuestbook();
      $('gbMessage').value = '';
      setStatus(status, provider ? t('gbPosted') : t('gbDemoPosted'), 'ok');
    } catch (err) {
      setStatus(status, t('gbFailed', errText(err)), 'err');
    } finally {
      btn.disabled = false;
    }
  });
}

/* ---------------- boot --------------------------------------------------------- */
async function boot() {
  applyI18n();

  // Host context badges (window.nimiqPay is injected by Nimiq Pay before load)
  if (window.nimiqPay && window.nimiqPay.network) {
    const badge = $('networkBadge');
    badge.textContent = window.nimiqPay.network;
    badge.hidden = false;
  }

  // "Open in Nimiq Pay" deeplink for plain-browser visitors
  const deeplink = 'https://nimpay.app/miniapps/open/'
    + location.host + location.pathname + location.search;
  $('openInAppBtn').href = deeplink;

  setupCreator();
  setupGuestbook();

  await initProvider();

  $('modeBadge').hidden = inNimiqPay;
  $('openInAppBanner').hidden = inNimiqPay;
  refreshFillMine();
  setupTipping();
}

boot();
