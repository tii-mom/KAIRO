import { createSubmissionSchema, patchSubmissionSchema } from '../../shared/domain';
import { getRow, listRows, type Env } from '../db/d1';

const submissionSelect = `
  SELECT
    submissions.*,
    bounties.title AS bounty_title,
    bounties.status AS bounty_status,
    bounties.reward_text AS bounty_reward_text,
    bounties.reward_type AS bounty_reward_type,
    bounties.funding_status AS bounty_funding_status,
    bounties.deadline AS bounty_deadline,
    bounties.token_id AS token_id,
    tokens.symbol AS token_symbol,
    tokens.name AS token_name
  FROM submissions
  LEFT JOIN bounties ON bounties.id = submissions.bounty_id
  LEFT JOIN tokens ON tokens.id = bounties.token_id
`;

const patchColumns = {
  name: 'name',
  tagline: 'tagline',
  demoUrl: 'demo_url',
  githubUrl: 'github_url',
  videoUrl: 'video_url',
  screenshotUrl: 'screenshot_url',
  description: 'description',
  status: 'status',
  deliveryStatus: 'delivery_status',
} as const;

export async function listSubmissions(env: Env, bountyId?: string) {
  if (bountyId) {
    return listRows(
      env.DB,
      `${submissionSelect}
       WHERE submissions.bounty_id = ?
       ORDER BY submissions.momentum_score DESC, submissions.created_at DESC`,
      [bountyId],
    );
  }

  return listRows(
    env.DB,
    `${submissionSelect}
     ORDER BY submissions.momentum_score DESC, submissions.created_at DESC
     LIMIT 50`,
  );
}

export async function getSubmission<T = unknown>(env: Env, id: string) {
  return getRow<T>(env.DB, `${submissionSelect} WHERE submissions.id = ?`, [id]);
}

export async function createSubmission(env: Env, payload: unknown) {
  const input = createSubmissionSchema.parse(payload);
  const now = new Date().toISOString();
  const id = crypto.randomUUID();

  await env.DB.batch([
    env.DB.prepare(
      `INSERT INTO submissions (
        id, bounty_id, builder_id, name, tagline, demo_url, github_url,
        video_url, screenshot_url, description, status, delivery_status, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'submitted', ?, ?, ?)`,
    ).bind(
      id,
      input.bountyId,
      input.builderId,
      input.name,
      input.tagline,
      input.demoUrl ?? null,
      input.githubUrl ?? null,
      input.videoUrl ?? null,
      input.screenshotUrl ?? null,
      input.description ?? null,
      input.deliveryStatus ?? 'not_started',
      now,
      now,
    ),
    env.DB.prepare(
      `UPDATE bounties
       SET submission_count = submission_count + 1, momentum_score = momentum_score + 300, updated_at = ?
       WHERE id = ?`,
    ).bind(now, input.bountyId),
  ]);

  return getSubmission(env, id);
}

export async function patchSubmission(env: Env, id: string, payload: unknown) {
  const input = patchSubmissionSchema.parse(payload);
  const setClauses: string[] = [];
  const bindings: unknown[] = [];

  for (const [payloadKey, columnName] of Object.entries(patchColumns)) {
    const key = payloadKey as keyof typeof patchColumns;
    if (Object.prototype.hasOwnProperty.call(input, key)) {
      setClauses.push(`${columnName} = ?`);
      bindings.push(input[key] ?? null);
    }
  }

  if (setClauses.length === 0) {
    return getSubmission(env, id);
  }

  const now = new Date().toISOString();
  setClauses.push('updated_at = ?');
  bindings.push(now, id);

  await env.DB.prepare(`UPDATE submissions SET ${setClauses.join(', ')} WHERE id = ?`).bind(...bindings).run();
  return getSubmission(env, id);
}
