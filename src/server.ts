/**
 * Hono + @mostajs/orm — blog starter (Node runtime via @hono/node-server).
 * Boots with no native binary via the sqljs (SQLite WASM) dialect.
 * Hono also runs on Bun, Deno, Cloudflare Workers and Vercel Edge.
 * @author Dr Hamid MADANI <drmdh@msn.com>
 */
import { Hono } from 'hono';
import { serve } from '@hono/node-server';
import { getRepos } from './orm/repositories.js';
import { postDetailPage, postListPage } from './view.js';

const app = new Hono();

// --- HTML pages ---
app.get('/', async (c) => {
  const { posts } = await getRepos();
  const list = await posts.findWithRelations({ published: true }, ['author', 'comments'], { sort: { createdAt: -1 }, limit: 20 });
  return c.html(postListPage('Hono', list as never));
});

app.get('/posts/:id', async (c) => {
  const { posts } = await getRepos();
  const post = await posts.findByIdWithRelations(c.req.param('id'), ['author', 'comments']);
  if (!post) return c.html(postListPage('Hono', []), 404);
  return c.html(postDetailPage('Hono', post as never));
});

// --- JSON API ---
app.get('/api/posts', async (c) => {
  const { posts } = await getRepos();
  return c.json(await posts.findAll({ published: true }, { sort: { createdAt: -1 }, limit: 50 }));
});

app.get('/api/posts/:id', async (c) => {
  const { posts } = await getRepos();
  const post = await posts.findByIdWithRelations(c.req.param('id'), ['author', 'comments']);
  return post ? c.json(post) : c.json({ error: 'Not found' }, 404);
});

app.post('/api/posts', async (c) => {
  const { posts } = await getRepos();
  const b = await c.req.json();
  const created = await posts.create({ title: b.title, slug: b.slug, content: b.content, published: b.published ?? false, author: b.authorId });
  return c.json(created, 201);
});

const port = Number(process.env.PORT) || 3000;
serve({ fetch: app.fetch, port }, () => console.log(`▲ Hono + @mostajs/orm — http://localhost:${port}`));
