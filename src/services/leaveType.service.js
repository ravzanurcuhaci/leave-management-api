const pool = require("../db/pool");

// Tüm izin türlerini listele
const getAll = async () => {
    const result = await pool.query(
        `SELECT id, name, default_days
         FROM leave_types
         ORDER BY name ASC`
    );

    return result.rows;
};

// Yeni izin türü oluştur
const create = async (data) => {
    const { name, default_days } = data;

    if (!name || default_days === undefined) {
        throw new Error("name and default_days are required");
    }

    // Aynı isimde var mı kontrol et
    const existing = await pool.query(
        "SELECT id FROM leave_types WHERE name = $1",
        [name]
    );

    if (existing.rows.length > 0) {
        throw new Error("Leave type already exists");
    }

    const result = await pool.query(
        `INSERT INTO leave_types (name, default_days)
         VALUES ($1, $2)
         RETURNING *`,
        [name, default_days]
    );

    return result.rows[0];
};

// İzin türünü güncelle
const update = async (id, data) => {
    const { name, default_days } = data;

    const existing = await pool.query(
        "SELECT * FROM leave_types WHERE id = $1",
        [id]
    );

    if (existing.rows.length === 0) {
        throw new Error("Leave type not found");
    }

    const newName = name || existing.rows[0].name;
    const newDefaultDays = default_days !== undefined ? default_days : existing.rows[0].default_days;

    // İsim değiştiyse çakışma kontrolü
    if (name && name !== existing.rows[0].name) {
        const nameCheck = await pool.query(
            "SELECT id FROM leave_types WHERE name = $1 AND id != $2",
            [name, id]
        );
        if (nameCheck.rows.length > 0) {
            throw new Error("Leave type name already exists");
        }
    }

    const result = await pool.query(
        `UPDATE leave_types
         SET name = $1, default_days = $2
         WHERE id = $3
         RETURNING *`,
        [newName, newDefaultDays, id]
    );

    return result.rows[0];
};

// İzin türünü sil
const remove = async (id) => {
    const existing = await pool.query(
        "SELECT id FROM leave_types WHERE id = $1",
        [id]
    );

    if (existing.rows.length === 0) {
        throw new Error("Leave type not found");
    }

    await pool.query("DELETE FROM leave_types WHERE id = $1", [id]);

    return true;
};

module.exports = {
    getAll,
    create,
    update,
    remove,
};
