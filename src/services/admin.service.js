const pool = require("../db/pool");
const bcrypt = require("bcrypt");
const { BadRequestError, NotFoundError, ConflictError } = require("../errors/AppError");

// Tüm kullanıcıları listele (pagination + opsiyonel role filtresi)
const getAllUsers = async (filters) => {
    const { role_id, page = 1, limit = 10 } = filters;

    const offset = (page - 1) * limit;
    const values = [];
    let whereClause = "";

    if (role_id) {
        values.push(role_id);
        whereClause = `WHERE u.role_id = $${values.length}`;
    }

    values.push(limit);
    const limitIndex = values.length;

    values.push(offset);
    const offsetIndex = values.length;

    const result = await pool.query(
        `SELECT
           u.id,
           u.full_name,
           u.email,
           u.role_id,
           r.name AS role_name,
           u.manager_id,
           u.created_at
         FROM users u
         JOIN roles r ON u.role_id = r.id
         ${whereClause}
         ORDER BY u.created_at DESC
         LIMIT $${limitIndex}
         OFFSET $${offsetIndex}`,
        values
    );

    return {
        page: Number(page),
        limit: Number(limit),
        count: result.rows.length,
        users: result.rows,
    };
};

// Tek kullanıcı detayı
const getUserById = async (userId) => {
    const result = await pool.query(
        `SELECT
           u.id,
           u.full_name,
           u.email,
           u.role_id,
           r.name AS role_name,
           u.manager_id,
           u.created_at
         FROM users u
         JOIN roles r ON u.role_id = r.id
         WHERE u.id = $1`,
        [userId]
    );

    if (result.rows.length === 0) {
        throw new NotFoundError("User not found");
    }

    return result.rows[0];
};

// Admin yeni kullanıcı oluşturur
const createUser = async (data) => {
    const { full_name, email, password, role_id, manager_id } = data;

    if (!full_name || !email || !password || !role_id) {
        throw new BadRequestError("full_name, email, password and role_id are required");
    }

    // email kontrolü
    const existing = await pool.query(
        "SELECT id FROM users WHERE email = $1",
        [email]
    );

    if (existing.rows.length > 0) {
        throw new ConflictError("Email already exists");
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await pool.query(
        `INSERT INTO users (full_name, email, password_hash, role_id, manager_id)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING id, full_name, email, role_id, manager_id, created_at`,
        [full_name, email, hashedPassword, role_id, manager_id || null]
    );

    return result.rows[0];
};

// Kullanıcı bilgilerini güncelle (full_name, email)
const updateUser = async (userId, data) => {
    const { full_name, email } = data;

    const existing = await pool.query(
        "SELECT * FROM users WHERE id = $1",
        [userId]
    );

    if (existing.rows.length === 0) {
        throw new NotFoundError("User not found");
    }

    const newFullName = full_name || existing.rows[0].full_name;
    const newEmail = email || existing.rows[0].email;

    // Eğer email değiştiyse, başka biri kullanıyor mu kontrol et
    if (email && email !== existing.rows[0].email) {
        const emailCheck = await pool.query(
            "SELECT id FROM users WHERE email = $1 AND id != $2",
            [email, userId]
        );
        if (emailCheck.rows.length > 0) {
            throw new ConflictError("Email already exists");
        }
    }

    const result = await pool.query(
        `UPDATE users
         SET full_name = $1, email = $2
         WHERE id = $3
         RETURNING id, full_name, email, role_id, manager_id`,
        [newFullName, newEmail, userId]
    );

    return result.rows[0];
};

// Kullanıcıyı sil
const deleteUser = async (userId) => {
    const existing = await pool.query(
        "SELECT id FROM users WHERE id = $1",
        [userId]
    );

    if (existing.rows.length === 0) {
        throw new NotFoundError("User not found");
    }

    await pool.query("DELETE FROM users WHERE id = $1", [userId]);

    return true;
};

// Kullanıcının rolünü değiştir + audit log
const updateUserRole = async (adminUserId, userId, role_id) => {
    if (!role_id) {
        throw new BadRequestError("role_id is required");
    }

    const existing = await pool.query(
        "SELECT * FROM users WHERE id = $1",
        [userId]
    );

    if (existing.rows.length === 0) {
        throw new NotFoundError("User not found");
    }

    const result = await pool.query(
        `UPDATE users
         SET role_id = $1
         WHERE id = $2
         RETURNING id, full_name, email, role_id, manager_id`,
        [role_id, userId]
    );

    // Audit log
    await pool.query(
        `INSERT INTO audit_logs (actor_user_id, action, target_type, target_id)
         VALUES ($1, $2, $3, $4)`,
        [adminUserId, "CHANGE_ROLE", "user", userId]
    );

    return result.rows[0];
};

// Kullanıcının manager'ını değiştir + audit log
const updateUserManager = async (adminUserId, userId, manager_id) => {
    const existing = await pool.query(
        "SELECT id FROM users WHERE id = $1",
        [userId]
    );

    if (existing.rows.length === 0) {
        throw new NotFoundError("User not found");
    }

    // manager_id null olabilir (manager'ı kaldırmak için)
    if (manager_id) {
        const managerCheck = await pool.query(
            "SELECT id FROM users WHERE id = $1",
            [manager_id]
        );
        if (managerCheck.rows.length === 0) {
            throw new NotFoundError("Manager not found");
        }
    }

    const result = await pool.query(
        `UPDATE users
         SET manager_id = $1
         WHERE id = $2
         RETURNING id, full_name, email, role_id, manager_id`,
        [manager_id || null, userId]
    );

    // Audit log
    await pool.query(
        `INSERT INTO audit_logs (actor_user_id, action, target_type, target_id)
         VALUES ($1, $2, $3, $4)`,
        [adminUserId, "CHANGE_MANAGER", "user", userId]
    );

    return result.rows[0];
};

module.exports = {
    getAllUsers,
    getUserById,
    createUser,
    updateUser,
    deleteUser,
    updateUserRole,
    updateUserManager,
};
