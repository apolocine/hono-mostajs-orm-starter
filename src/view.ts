/**
 * Tiny server-rendered HTML views (plain CSS, no framework — boots anywhere).
 * @author Dr Hamid MADANI <drmdh@msn.com>
 */
const STYLE = `
:root{--bg:#f8fafc;--surface:#fff;--border:#e2e8f0;--text:#0f172a;--muted:#64748b;--accent:#4f46e5}
*{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--text);font-family:ui-sans-serif,system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;line-height:1.6}
a{color:inherit;text-decoration:none}.container{max-width:44rem;margin:0 auto;padding:0 1rem}
.site-header{background:var(--surface);border-bottom:1px solid var(--border)}
.site-header .container{display:flex;align-items:center;justify-content:space-between;padding:1rem}
.brand{font-weight:600}.brand .dim{color:var(--muted);font-weight:400}.ghlink{font-size:.875rem;color:var(--muted)}
.page{padding:2.5rem 0}.page-title{font-size:1.6rem;font-weight:700;margin:0}
.lead{color:var(--muted);margin:.4rem 0 0}.lead code{background:#eef2ff;color:var(--accent);padding:.05rem .35rem;border-radius:6px;font-size:.85em}
.post-list{list-style:none;margin:1.75rem 0 0;padding:0;display:grid;gap:.75rem}
.post-card{display:block;background:var(--surface);border:1px solid var(--border);border-radius:12px;padding:1rem 1.1rem;transition:.15s}
.post-card:hover{border-color:#cbd5e1;box-shadow:0 4px 16px -8px rgba(15,23,42,.15);transform:translateY(-1px)}
.post-card h2{font-size:1.05rem;font-weight:600;margin:0}.post-meta{font-size:.85rem;color:var(--muted);margin:.35rem 0 0}
.back{font-size:.875rem;color:var(--muted)}.article-title{font-size:2rem;font-weight:800;margin:1rem 0 .25rem}
.byline{color:var(--muted);font-size:.9rem;margin:0}.prose{margin-top:1.5rem;color:#334155}
.comments-title{font-size:1.1rem;font-weight:700;margin:2.5rem 0 0}
.comment-list{list-style:none;margin:1rem 0 0;padding:0;display:grid;gap:.6rem}
.comment{background:var(--surface);border:1px solid var(--border);border-radius:10px;padding:.7rem .9rem;font-size:.92rem;color:#334155}
.site-footer{padding:2.5rem 0;font-size:.85rem;color:#94a3b8}
`;

const esc = (s: unknown) =>
  String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c] as string));

export function page(framework: string, body: string): string {
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(framework)} + @mostajs/orm — Blog</title><style>${STYLE}</style></head><body>
<header class="site-header"><div class="container">
<a href="/" class="brand">◐ @mostajs/orm <span class="dim">· ${esc(framework)}</span></a>
<a class="ghlink" href="https://github.com/apolocine/mosta-orm">GitHub ↗</a>
</div></header>
<div class="container">${body}</div>
<footer class="site-footer"><div class="container">Built with <code>@mostajs/orm</code> — one API, 13 databases, runs in the browser via WASM (<code>sqljs</code>).</div></footer>
</body></html>`;
}

type PostCard = { id: string; title: string; author?: { name?: string }; comments?: unknown[] };

export function postListPage(framework: string, posts: PostCard[]): string {
  const items = posts
    .map((p) => {
      const n = p.comments?.length ?? 0;
      const author = p.author?.name ? `by ${esc(p.author.name)}` : 'Unknown author';
      return `<li><a class="post-card" href="/posts/${esc(p.id)}"><h2>${esc(p.title)}</h2>
<p class="post-meta">${author} · ${n} comment${n === 1 ? '' : 's'}</p></a></li>`;
    })
    .join('');
  const body = `<section class="page"><h1 class="page-title">📝 Recent posts</h1>
<p class="lead">Powered by <code>@mostajs/orm</code> — one API, 13 databases, zero codegen. Boots in the browser via WASM (<code>sqljs</code>).</p>
<ul class="post-list">${items}</ul>${posts.length === 0 ? '<p>No published posts yet.</p>' : ''}</section>`;
  return page(framework, body);
}

type PostFull = { title: string; content: string; author?: { name?: string }; comments?: { id: string; body: string }[] };

export function postDetailPage(framework: string, post: PostFull): string {
  const comments = post.comments ?? [];
  const body = `<article class="page"><a class="back" href="/">← Back</a>
<h1 class="article-title">${esc(post.title)}</h1>
${post.author?.name ? `<p class="byline">by ${esc(post.author.name)}</p>` : ''}
<div class="prose">${esc(post.content)}</div>
<h2 class="comments-title">💬 Comments (${comments.length})</h2>
<ul class="comment-list">${comments.map((c) => `<li class="comment">${esc(c.body)}</li>`).join('')}</ul></article>`;
  return page(framework, body);
}
