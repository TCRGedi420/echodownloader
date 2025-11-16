import { Hono } from "hono";
import type { Env } from './core-utils';
import { UserEntity, ChatBoardEntity } from "./entities";
import { ok, bad, notFound, isStr } from './core-utils';
import type { VideoItem } from "@shared/types";
const MOCK_PLAYLIST_VIDEOS: VideoItem[] = [
    { id: 'y_8_y_2_p_Y', title: 'Introduction to Quantum Computing', thumbnail: 'https://i.ytimg.com/vi/y_8_y_2_p_Y/hqdefault.jpg', duration: '12:45' },
    { id: 'g_IaVepNDT4', title: 'The Beauty of Bézier Curves', thumbnail: 'https://i.ytimg.com/vi/g_IaVepNDT4/hqdefault.jpg', duration: '7:32' },
    { id: 'V4o_1_S_7_Y', title: 'History of the Web', thumbnail: 'https://i.ytimg.com/vi/V4o_1_S_7_Y/hqdefault.jpg', duration: '25:10' },
    { id: 'R_t0_f_Q_s', title: 'How Do CPUs Actually Work?', thumbnail: 'https://i.ytimg.com/vi/R_t0_f_Q_s/hqdefault.jpg', duration: '9:58' },
    { id: 'k-r_x_y_z', title: 'The Art of Code Refactoring', thumbnail: 'https://i.ytimg.com/vi/k-r_x_y_z/hqdefault.jpg', duration: '18:22' },
    { id: 'a_b_c_d_e', title: 'Understanding Docker in 100 Seconds', thumbnail: 'https://i.ytimg.com/vi/a_b_c_d_e/hqdefault.jpg', duration: '1:40' },
    { id: 'f_g_h_i_j', title: 'Building a Neural Network from Scratch', thumbnail: 'https://i.ytimg.com/vi/f_g_h_i_j/hqdefault.jpg', duration: '45:30' },
    { id: 'k_l_m_n_o', title: 'CSS Grid vs. Flexbox', thumbnail: 'https://i.ytimg.com/vi/k_l_m_n_o/hqdefault.jpg', duration: '15:05' },
    { id: 'p_q_r_s_t', title: 'The Math Behind Cryptography', thumbnail: 'https://i.ytimg.com/vi/p_q_r_s_t/hqdefault.jpg', duration: '22:18' },
    { id: 'u_v_w_x_y', title: 'A Deep Dive into WebAssembly', thumbnail: 'https://i.ytimg.com/vi/u_v_w_x_y/hqdefault.jpg', duration: '30:00' },
];
export function userRoutes(app: Hono<{ Bindings: Env }>) {
  // EchoDownloader Mock API
  app.get('/api/playlist/fetch', async (c) => {
    const url = c.req.query('url');
    if (!url) {
      return bad(c, 'Playlist URL is required.');
    }
    // Simulate network delay
    await new Promise(res => setTimeout(res, 1500));
    if (url.includes('fail')) {
      return bad(c, 'This is a mock error. The provided playlist could not be found.');
    }
    return ok(c, MOCK_PLAYLIST_VIDEOS);
  });
  // --- Existing Demo Routes ---
  app.get('/api/test', (c) => c.json({ success: true, data: { name: 'CF Workers Demo' }}));
  // USERS
  app.get('/api/users', async (c) => {
    await UserEntity.ensureSeed(c.env);
    const cq = c.req.query('cursor');
    const lq = c.req.query('limit');
    const page = await UserEntity.list(c.env, cq ?? null, lq ? Math.max(1, (Number(lq) | 0)) : undefined);
    return ok(c, page);
  });
  app.post('/api/users', async (c) => {
    const { name } = (await c.req.json()) as { name?: string };
    if (!name?.trim()) return bad(c, 'name required');
    return ok(c, await UserEntity.create(c.env, { id: crypto.randomUUID(), name: name.trim() }));
  });
  // CHATS
  app.get('/api/chats', async (c) => {
    await ChatBoardEntity.ensureSeed(c.env);
    const cq = c.req.query('cursor');
    const lq = c.req.query('limit');
    const page = await ChatBoardEntity.list(c.env, cq ?? null, lq ? Math.max(1, (Number(lq) | 0)) : undefined);
    return ok(c, page);
  });
  app.post('/api/chats', async (c) => {
    const { title } = (await c.req.json()) as { title?: string };
    if (!title?.trim()) return bad(c, 'title required');
    const created = await ChatBoardEntity.create(c.env, { id: crypto.randomUUID(), title: title.trim(), messages: [] });
    return ok(c, { id: created.id, title: created.title });
  });
  // MESSAGES
  app.get('/api/chats/:chatId/messages', async (c) => {
    const chat = new ChatBoardEntity(c.env, c.req.param('chatId'));
    if (!await chat.exists()) return notFound(c, 'chat not found');
    return ok(c, await chat.listMessages());
  });
  app.post('/api/chats/:chatId/messages', async (c) => {
    const chatId = c.req.param('chatId');
    const { userId, text } = (await c.req.json()) as { userId?: string; text?: string };
    if (!isStr(userId) || !text?.trim()) return bad(c, 'userId and text required');
    const chat = new ChatBoardEntity(c.env, chatId);
    if (!await chat.exists()) return notFound(c, 'chat not found');
    return ok(c, await chat.sendMessage(userId, text.trim()));
  });
  // DELETE: Users
  app.delete('/api/users/:id', async (c) => ok(c, { id: c.req.param('id'), deleted: await UserEntity.delete(c.env, c.req.param('id')) }));
  app.post('/api/users/deleteMany', async (c) => {
    const { ids } = (await c.req.json()) as { ids?: string[] };
    const list = ids?.filter(isStr) ?? [];
    if (list.length === 0) return bad(c, 'ids required');
    return ok(c, { deletedCount: await UserEntity.deleteMany(c.env, list), ids: list });
  });
  // DELETE: Chats
  app.delete('/api/chats/:id', async (c) => ok(c, { id: c.req.param('id'), deleted: await ChatBoardEntity.delete(c.env, c.req.param('id')) }));
  app.post('/api/chats/deleteMany', async (c) => {
    const { ids } = (await c.req.json()) as { ids?: string[] };
    const list = ids?.filter(isStr) ?? [];
    if (list.length === 0) return bad(c, 'ids required');
    return ok(c, { deletedCount: await ChatBoardEntity.deleteMany(c.env, list), ids: list });
  });
}