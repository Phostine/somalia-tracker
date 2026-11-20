// Local server for preview and editing: node scripts/serve.js [port]
// - serves the site;
// - refreshes the live wire (data/wire.json) every 15 minutes (set WIRE=0 to turn off);
// - lets an editor approve or reject drafted entries in data/pending.json from the #/review page;
// - publishes: after an approval (or the Publish button) it commits the data and pushes to GitHub,
//   where .github/workflows/wire.yml redeploys the public site.
// It listens on 127.0.0.1 only, so the review actions are never reachable from other machines.
const http = require("http"), fs = require("fs"), path = require("path"), { execFile } = require("child_process");
const root = path.resolve(__dirname, ".."), port = +process.env.PORT || +process.argv[2] || 8427;
const DATA = path.join(root, "data"), PENDING = path.join(DATA, "pending.json"), LOG = path.join(root, "updates", "review-log.md");
const SECTORS = ["politics", "economy", "security", "diplomacy", "social"];
const types = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".json": "application/json", ".svg": "image/svg+xml", ".png": "image/png", ".md": "text/plain" };

// ---------- live wire ----------
if (process.env.WIRE !== "0") {
  const wire = require("./fetch_wire");
  const tick = () => wire.run({ quiet: true }).then((r) => r.added && console.log(`wire: +${r.added} new (${r.total} total)`)).catch((e) => console.error("wire:", e.message));
  tick();
  setInterval(tick, 15 * 60e3);
}

// ---------- review queue ----------
const readJSON = (f, d) => { try { return JSON.parse(fs.readFileSync(f, "utf8")); } catch (e) { return d; } };
const writeJSON = (f, v) => { fs.writeFileSync(f + ".tmp", JSON.stringify(v, null, 2) + "\n"); fs.renameSync(f + ".tmp", f); };
const today = () => new Date().toISOString().slice(0, 10);
const log = (line) => {
  if (!fs.existsSync(LOG)) fs.writeFileSync(LOG, "# Review log\n\nEvery approval or rejection made on the #/review page, newest last.\n\n");
  fs.appendFileSync(LOG, `- ${new Date().toISOString().slice(0, 16).replace("T", " ")} UTC · ${line}\n`);
};
function validate() {
  return new Promise((res) => execFile("python3", [path.join(root, "scripts", "validate.py")], { cwd: root, timeout: 60e3 }, (err, out, errOut) => {
    const text = String(out || "") + String(errOut || "");
    res({ ok: !err, summary: (text.trim().split("\n").pop() || "").trim(), text });
  }));
}

// ---------- publishing (git) ----------
const git = (args) => new Promise((res) => execFile("git", args, { cwd: root, timeout: 120e3 }, (err, out, errOut) => res({ ok: !err, out: (String(out || "") + String(errOut || "")).trim() })));
async function gitInfo() {
  const remote = await git(["remote", "get-url", "origin"]);
  if (!remote.ok) return { remote: false, unpublished: 0 };
  const st = await git(["status", "--porcelain"]);
  const ahead = await git(["rev-list", "--count", "@{u}..HEAD"]);
  return { remote: true, unpublished: (st.out ? st.out.split("\n").length : 0) + (+ahead.out || 0) };
}
let publishing = Promise.resolve();
function publish(message) {
  const run = async () => {
    if (!(await gitInfo()).remote) return { ok: false, out: "No GitHub remote is set up." };
    await git(["add", "-A"]);
    const c = await git(["commit", "-m", message]);
    if (!c.ok && !/nothing to commit/.test(c.out)) return c;
    const pull = await git(["pull", "--rebase", "--autostash"]);
    if (!pull.ok) return pull;
    return git(["push"]);
  };
  return (publishing = publishing.then(run, run));
}

function apply(draft) {
  const stamp = today();
  if (draft.kind === "milestone") {
    const e = { ...draft.entry, added: stamp };
    if (!SECTORS.includes(e.sector)) throw new Error("unknown sector " + e.sector);
    const file = path.join(DATA, e.sector + ".json"), list = readJSON(file, []);
    if (list.some((m) => m.id === e.id)) throw new Error("an entry with id " + e.id + " already exists");
    list.push(e); writeJSON(file, list);
    return `added milestone \`${e.id}\` to ${e.sector}.json`;
  }
  if (draft.kind === "factcheck") {
    const e = { ...draft.entry, added: stamp }, file = path.join(DATA, "factchecks.json"), list = readJSON(file, []);
    if (list.some((f) => f.id === e.id)) throw new Error("a fact-check with id " + e.id + " already exists");
    list.push(e); writeJSON(file, list);
    return `added fact-check \`${e.id}\``;
  }
  if (draft.kind === "update") {
    for (const s of SECTORS) {
      const file = path.join(DATA, s + ".json"), list = readJSON(file, []), m = list.find((x) => x.id === draft.target);
      if (!m) continue;
      if (draft.append_context) {
        m.context = [m.context, draft.append_context].filter(Boolean).join(" ");
        if (draft.append_context_so) m.context_so = [m.context_so, draft.append_context_so].filter(Boolean).join(" ");
        m.translation_so = "machine";
      }
      for (const src of draft.add_sources || []) if (!(m.sources || []).some((x) => x.url === src.url)) (m.sources ||= []).push(src);
      m.added = stamp; writeJSON(file, list);
      return `updated \`${m.id}\` in ${s}.json`;
    }
    throw new Error("no milestone with id " + draft.target);
  }
  throw new Error("unknown draft kind " + draft.kind);
}

async function review(req, res) {
  let body = "";
  for await (const c of req) { body += c; if (body.length > 1e5) throw new Error("too large"); }
  const { id, action, note } = JSON.parse(body || "{}");
  const pending = readJSON(PENDING, []), i = pending.findIndex((d) => d.id === id);
  if (i < 0) return send(res, 404, { error: "No pending draft with that id." });
  const draft = pending[i];
  let did;
  if (action === "approve") did = apply(draft);
  else if (action === "reject") did = `rejected draft \`${id}\``;
  else return send(res, 400, { error: "action must be approve or reject" });
  pending.splice(i, 1); writeJSON(PENDING, pending);
  log(`${did}${note ? ` · note: ${String(note).replace(/\s+/g, " ").slice(0, 300)}` : ""} · ${draft.title || draft.entry?.title || draft.target || ""}`);
  const v = action === "approve" ? await validate() : null;
  // Publish only if the checker passes; otherwise the change stays local for the editor to fix.
  const pub = v && v.ok ? await publish(`Approve: ${draft.entry?.title || draft.target || id}`) : null;
  send(res, 200, { ok: true, did, validation: v && { ok: v.ok, summary: v.summary }, published: pub && { ok: pub.ok, out: pub.out.slice(-400) } });
}

function send(res, code, obj) { res.writeHead(code, { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" }); res.end(JSON.stringify(obj)); }

http.createServer(async (req, res) => {
  const url = req.url.split("?")[0];
  try {
    if (url === "/api/status") return send(res, 200, { review: true, pending: readJSON(PENDING, []).length, git: await gitInfo() });
    if (url === "/api/review" && req.method === "POST") {
      if (!/^http:\/\/(localhost|127\.0\.0\.1):\d+$/.test(req.headers.origin || "")) return send(res, 403, { error: "Review actions are only accepted from this computer's own pages." });
      return await review(req, res);
    }
    if (url === "/api/publish" && req.method === "POST") {
      if (!/^http:\/\/(localhost|127\.0\.0\.1):\d+$/.test(req.headers.origin || "")) return send(res, 403, { error: "Publishing is only accepted from this computer's own pages." });
      const v = await validate();
      if (!v.ok) return send(res, 409, { error: "The checker found errors, so nothing was published: " + v.summary });
      const pub = await publish("Publish local changes");
      return send(res, pub.ok ? 200 : 500, pub.ok ? { ok: true, out: pub.out.slice(-400) } : { error: pub.out.slice(-400) });
    }
  } catch (e) { return send(res, 500, { error: e.message }); }
  const p = path.normalize(decodeURIComponent(url)).replace(/^(\.\.[\/\\])+/, "");
  let file = path.join(root, p);
  if (!file.startsWith(root)) { res.writeHead(403); return res.end(); }
  if (fs.existsSync(file) && fs.statSync(file).isDirectory()) file = path.join(file, "index.html");
  fs.readFile(file, (err, buf) => {
    if (err) { res.writeHead(404); return res.end("Not found"); }
    res.writeHead(200, { "Content-Type": (types[path.extname(file)] || "application/octet-stream") + "; charset=utf-8", "Cache-Control": "no-cache" });
    res.end(buf);
  });
}).listen(port, "127.0.0.1", () => console.log(`Serving ${root} at http://localhost:${port}`));
