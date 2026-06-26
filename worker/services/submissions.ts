import { createSubmissionSchema, updateSubmissionSchema } from '../../shared/domain';
import { getRow, listRows, type Env } from '../db/d1';

export async function listSubmissions(env: Env, bountyId?: string) {
  if (bountyId) {
    return listRows(
      env.DB,
      `SELECT * FROM submissions WHERE bounty_id = ? ORDER BY momentum_score DESC, created_at DESC`,
      [bountyId],
    );
  }

  return listRows(
    env.DB,
    `SELECT * FROM submissions ORDER BY momentum_score DESC, created_at DESC LIMIT 50`,
  );
}

export async function getSubmission(env: Env, id: string) {
  return getRow(env.DB, `SELECT * FROM submissions WHERE id = ?`, [id]);
}

export async function createSubmission(env: Env, payload: unknown) {
  const input = createSubmissionSchema.parse(payload);
  const now = new Date().toISOString();
  const id = crypto.randomUUID();

  await env.DB.batch([
    env.DB.prepare(
      `INSERT INTO submissions (
        id, bounty_id, builder_id, name, tagline, demo_url, github_url,
        video_url, description, status, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'submitted', ?, ?)`,
    ).bind(
      id,
      input.bountyId,
      input.builderId,
      input.name,
      input.tagline,
      input.demoUrl ?? null,
      input.githubUrl ?? null,
      input.videoUrl ?? null,
      input.description ?? null,
      now,
      now,
    ),
    env.DB.prepare(
      `UPDATE bounties
       SET submission_count = submission_count + 1, momentum_score = momentum_score + 300, updated_at = ?
       WHERE id = ?`,
    ).bind(now, input.bountyId),
    env.DB.prepare(
      `INSERT INTO builder_scores (builder_id, total_score, submitted_count, updated_at)
       VALUES (?, 100, 1, ?)
       ON CONFLICT(builder_id) DO UPDATE SET
        total_score = total_score + 100,
        submitted_count = submitted_count + 1,
        updated_at = excluded.updated_at`,
    ).bind(input.builderId, now),
  ]);

  return getSubmission(env, id);
}

export async function updateSubmission(env: Env, id: string, payload: unknown) {
  const input = updateSubmissionSchema.parse(payload);
  const updates: string[] = [];
  const bindings: unknown[] = [];

  const set = (column: string, value: unknown) => {
    updates.push(`${column} = ?`);
    bindings.push(value ?? null);
  };

  if (input.name !== undefined) set('name', input.name);
  if (input.tagline !== undefined) set('tagline', input.tagline);
  if (input.demoUrl !== undefined) set('demo_url', input.demoUrl);
  if (input.githubUrl !== undefined) set('github_url', input.githubUrl);
  if (input.videoUrl !== undefined) set('video_url', input.videoUrl);
  if (input.description !== undefined) set('description', input.description);
  if (input.status !== undefined) set('status', input.status);

  if (updates.length === 0) return getSubmission(env, id);

  const now = new Date().toISOString();
  updates.push('updated_at = ?');
  bindings.push(now, id);

  await env.DB.prepare(`UPDATE submissions SET ${updates.join(', ')} WHERE id = ?`).bind(...bindings).run();
  return getSubmission(env, id);
}
