# TipJar

**Tip any creator in NIM — one link, one tap.**

TipJar is a [Nimiq Pay](https://nimiq.com/nimiq-pay/) Mini App that turns a
creator's Nimiq address into a shareable tip page. A supporter opens the link,
picks an amount, and confirms the payment in Nimiq Pay's native dialog. No
accounts, no backend, no fees beyond the network's own.

Built for the **Nimiq Mini Apps Competition, Cycle III** — category **Pay**.

## How it works

### For creators
1. Open your TipJar page (inside Nimiq Pay, or in any browser).
2. Paste your Nimiq address once — it is stored only in your browser's
   `localStorage`, never sent anywhere. Optionally add a Polygon address if
   you also want to accept USDT tips.
3. You get a **shareable tip link** (`…/?to=<your-address>`) and a **QR code**
   encoding it. Post it on your stream overlay, bio, or a sticker on your
   laptop.

### For supporters
1. Open a tip link — it shows the creator's (shortened) address, preset
   amounts (1 / 5 / 10 / 25 NIM) and a custom amount field.
2. Tap **Send tip**. TipJar asks the Nimiq Pay wallet to send a basic
   transaction; you confirm in Nimiq Pay's own native dialog.
3. Leave a note in the **guestbook**: inside Nimiq Pay you *sign* the message
   with your wallet (a signature, not a transaction — no fee). Signed notes
   appear on the wall, stored locally on the device and de-duplicated per
   device. Outside Nimiq Pay, notes can still be posted in unsigned
   "demo" mode.

### Optional: USDT on Polygon
If the creator's tip link carries a Polygon address (`&evm=0x…`) *and* the
supporter's browser has an EVM wallet (`window.ethereum`), an extra
"Tip with USDT (Polygon)" button appears. It switches the wallet to Polygon
(chain 137) and sends an ERC-20 `transfer` of USDT
(`0xc2132D05D31c914a87C6611C10748AEb04B58e8F`). This path is fully guarded —
no EVM provider simply means the button never shows and the NIM flow is
unaffected.

## Running inside Nimiq Pay

TipJar is a static web app. Inside Nimiq Pay it runs in the app's WebView and
talks to the wallet through the official SDK:

- **SDK:** [`@nimiq/mini-app-sdk`](https://www.npmjs.com/package/@nimiq/mini-app-sdk)
  **v0.2.5**, loaded as a pinned ES module from jsDelivr
  (`https://cdn.jsdelivr.net/npm/@nimiq/mini-app-sdk@0.2.5/dist/index.js`).
  `init()` returns the provider; TipJar uses `listAccounts()`,
  `sendBasicTransaction({ recipient, value })` (value in luna;
  1 NIM = 100,000 luna) and `sign(message)` for guestbook notes.
- **Host context:** `window.nimiqPay.language` sets the UI language
  (English default; Spanish and German included) and `window.nimiqPay.network`
  is shown as a badge (mainnet/testnet).
- **Fallbacks:** if the SDK CDN fails, TipJar falls back to the injected
  `window.nimiq` provider. If no provider exists at all (plain browser),
  the app shows a friendly "Open this in Nimiq Pay" banner with a deeplink
  and runs in a fully usable **demo/preview mode** — browsing, link/QR
  creation and unsigned guestbook notes all work; sending a tip explains
  that it needs Nimiq Pay.

No backend, no build step, no analytics, no trackers, no keys or secrets in
the code. All state (creator address, guestbook, device id) lives in
`localStorage` on the user's own device.

## Open TipJar in Nimiq Pay (deeplink)

Nimiq Pay opens Mini Apps through a deeplink of the form:

```
https://nimpay.app/miniapps/open/<domain>
```

For a deployment at `https://<user>.github.io/nimiq-tipjar/` the deeplink is:

```
https://nimpay.app/miniapps/open/<user>.github.io/nimiq-tipjar/
```

A tip link keeps its query string, so a creator's deeplink looks like:

```
https://nimpay.app/miniapps/open/<user>.github.io/nimiq-tipjar/?to=NQ…
```

TipJar's built-in "Open in Nimiq Pay" button generates exactly this link from
the current page URL automatically.

## Deploy to GitHub Pages

1. Fork or copy this repository (keep `index.html`, `style.css`, `app.js` at
   the repo root).
2. In the repo: **Settings → Pages → Build and deployment → Source:
   "Deploy from a branch"**, branch `main`, folder `/ (root)`. Save.
3. After a minute the app is live at `https://<user>.github.io/<repo>/`.
4. Open that URL once in a browser (demo mode), paste your Nimiq address,
   and copy your tip link / QR code from the "Your tip page" card.
5. (Optional) Point a custom domain at the Pages site via **Settings → Pages
   → Custom domain** for a shorter deeplink.

## Files

| File           | Purpose                                             |
| -------------- | --------------------------------------------------- |
| `index.html`   | The whole app UI (single page)                      |
| `style.css`    | Mobile-first styling, no framework                  |
| `app.js`       | SDK wiring, tipping, QR, guestbook, USDT fallback   |
| `SUBMISSION.md`| Draft competition submission + what's still needed  |
| `LICENSE`      | MIT                                                 |

Third-party code loaded at runtime (pinned, with graceful fallbacks):
`@nimiq/mini-app-sdk@0.2.5` (Nimiq, MIT/Apache) and
`qrcode-generator@1.4.4` (Kazuhiko Arase, MIT) — used only to draw the QR
code; if it fails to load, TipJar shows the copyable link instead.

## License

MIT — see [LICENSE](LICENSE).
