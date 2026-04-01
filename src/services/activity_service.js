const db = require('../config/db');
const { AppError } = require('../utils/errors');

const getAll = async ({ page, limit, status, search }) => {
  const offset = (parseInt(page) - 1) * parseInt(limit);
  const params = [];
  const conditions = [];
  let paramIndex = 1;

  if (status) {
    conditions.push(`a.status = $${paramIndex++}`);
    params.push(status.toUpperCase());
  }
  if (search) {
    conditions.push(`(a.title ILIKE $${paramIndex} OR a.description ILIKE $${paramIndex})`);
    params.push(`%${search}%`);
    paramIndex++;
  }

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

  const countResult = await db.query(`SELECT COUNT(*) FROM activities a ${where}`, params);
  const total = parseInt(countResult.rows[0].count);

  params.push(parseInt(limit), offset);
  const result = await db.query(
    `SELECT a.*, u.name AS organizer_name
     FROM activities a
     LEFT JOIN users u ON a.organizer_id = u.id
     ${where}
     ORDER BY a.created_at DESC
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
    `SELECT a.*, u.name AS organizer_name,
       COUNT(p.id) AS participant_count
     FROM activities a
     LEFT JOIN users u ON a.organizer_id = u.id
     LEFT JOIN participations p ON a.id = p.activity_id
     WHERE a.id = $1
     GROUP BY a.id, u.name`,
    [id]
  );
  if (!result.rows[0]) throw new AppError('Activity not found', 404);
  return result.rows[0];
};

const getParticipations = async (activityId) => {
  const result = await db.query(
    `SELECT p.*, u.name AS user_name, u.email AS user_email
     FROM participations p
     JOIN users u ON p.user_id = u.id
     WHERE p.activity_id = $1
     ORDER BY p.created_at DESC`,
    [activityId]
  );
  return result.rows;
};

const create = async ({ title, description, date, location, maxParticipants, organizerId }) => {
  const result = await db.query(
    `INSERT INTO activities (title, description, date, location, max_participants, organizer_id, status)
     VALUES ($1, $2, $3, $4, $5, $6, 'UPCOMING')
     RETURNING *`,
    [title, description, date, location, maxParticipants, organizerId]
  );
  return result.rows[0];
};

const update = async (id, data, user) => {
  const activity = await getById(id);
  if (user.role !== 'ADMIN' && activity.organizer_id !== user.id) {
    throw new AppError('Not authorized to update this activity', 403);
  }
  const result = await db.query(
    `UPDATE activities SET title=$1, description=$2, date=$3, location=$4,
       max_participants=$5, updated_at=NOW()
     WHERE id=$6 RETURNING *`,
    [data.title, data.description, data.date, data.location, data.maxParticipants, id]
  );
  return result.rows[0];
};

const remove = async (id) => {
  const result = await db.query('DELETE FROM activities WHERE id=$1 RETURNING id', [id]);
  if (!result.rows[0]) throw new AppError('Activity not found', 404);
};

const join = async (activityId, userId) => {
  const existing = await db.query(
    'SELECT id FROM participations WHERE activity_id=$1 AND user_id=$2',
    [activityId, userId]
  );
  if (existing.rows.length > 0) throw new AppError('Already joined this activity', 400);

  const result = await db.query(
    `INSERT INTO participations (activity_id, user_id, status)
     VALUES ($1, $2, 'PENDING') RETURNING *`,
    [activityId, userId]
  );
  return result.rows[0];
};

const verifyParticipation = async (activityId, userId, hours, verifier) => {
  const result = await db.query(
    `UPDATE participations
     SET status='VERIFIED', hours=$1, verified_by=$2, verified_at=NOW()
     WHERE activity_id=$3 AND user_id=$4
     RETURNING *`,
    [hours, verifier.id, activityId, userId]
  );
  if (!result.rows[0]) throw new AppError('Participation record not found', 404);
  return result.rows[0];
};

module.exports = { getAll, getById, create, update, remove, join, verifyParticipation };