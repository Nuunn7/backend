const db = require('../config/db');
const { AppError } = require('../utils/errors');

const getAll = async ({ page, limit, status, userId, activityId }) => {
  const offset = (parseInt(page) - 1) * parseInt(limit);
  const params = [];
  const conditions = [];
  let paramIndex = 1;

  if (status) {
    conditions.push(`p.status = $${paramIndex++}`);
    params.push(status.toUpperCase());
  }
  if (userId) {
    conditions.push(`p.user_id = $${paramIndex++}`);
    params.push(parseInt(userId));
  }
  if (activityId) {
    conditions.push(`p.activity_id = $${paramIndex++}`);
    params.push(parseInt(activityId));
  }

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

  const countResult = await db.query(
    `SELECT COUNT(*) FROM participations p ${where}`,
    params
  );
  const total = parseInt(countResult.rows[0].count);

  params.push(parseInt(limit), offset);
  const result = await db.query(
    `SELECT p.id, p.activity_id, p.user_id, p.status, p.hours,
            p.verified_by, p.verified_at, p.created_at,
            u.name AS user_name, u.email AS user_email,
            a.title AS activity_title, a.date AS activity_date,
            v.name AS verifier_name
     FROM participations p
     JOIN users u      ON p.user_id      = u.id
     JOIN activities a ON p.activity_id  = a.id
     LEFT JOIN users v ON p.verified_by  = v.id
     ${where}
     ORDER BY p.created_at DESC
     LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
    params
  );

  return {
    data: result.rows,
    pagination: {
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      pages: Math.ceil(total / parseInt(limit)),
    },
  };
};

const getById = async (id) => {
  const result = await db.query(
    `SELECT p.id, p.activity_id, p.user_id, p.status, p.hours,
            p.verified_by, p.verified_at, p.created_at,
            u.name AS user_name, u.email AS user_email, u.identifier,
            a.title AS activity_title, a.date AS activity_date,
            a.location, a.organizer_id,
            v.name AS verifier_name
     FROM participations p
     JOIN users u      ON p.user_id      = u.id
     JOIN activities a ON p.activity_id  = a.id
     LEFT JOIN users v ON p.verified_by  = v.id
     WHERE p.id = $1`,
    [id]
  );
  if (!result.rows[0]) throw new AppError('Participation not found', 404);
  return result.rows[0];
};

const reject = async (id, verifier) => {
  const participation = await getById(id);

  if (
    verifier.role !== 'ADMIN' &&
    participation.organizer_id !== verifier.id
  ) {
    throw new AppError('Not authorized to reject this participation', 403);
  }

  if (participation.status !== 'PENDING') {
    throw new AppError(
      `Cannot reject a participation with status '${participation.status}'`,
      400
    );
  }

  const result = await db.query(
    `UPDATE participations
     SET status      = 'REJECTED',
         verified_by = $1,
         verified_at = NOW()
     WHERE id = $2
     RETURNING *`,
    [verifier.id, id]
  );
  return result.rows[0];
};

const remove = async (id, requester) => {
  const participation = await getById(id);

  if (
    requester.role !== 'ADMIN' &&
    participation.user_id !== requester.id
  ) {
    throw new AppError('Not authorized to delete this participation', 403);
  }

  if (requester.role !== 'ADMIN' && participation.status !== 'PENDING') {
    throw new AppError(
      `Cannot withdraw from a participation with status '${participation.status}'`,
      400
    );
  }

  const cert = await db.query(
    'SELECT id FROM certificates WHERE participation_id = $1',
    [id]
  );
  if (cert.rows.length > 0) {
    throw new AppError(
      'Cannot delete a participation with an issued certificate',
      400
    );
  }

  await db.query('DELETE FROM participations WHERE id = $1', [id]);
};

module.exports = {
  getAll,
  getById,
  reject,
  remove,
};