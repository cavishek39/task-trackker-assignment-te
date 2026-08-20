import { open } from '@op-engineering/op-sqlite';

// Open (or create) the database
export const db = open({
  name: 'tasktracker.sqlite',
});

// Initialize database schema
export const initDB = () => {
  try {
    db.executeSync(`
      CREATE TABLE IF NOT EXISTS tasks (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT,
        completed INTEGER DEFAULT 0,
        synced_status INTEGER DEFAULT 0,
        updated_at INTEGER NOT NULL
      );
    `);
    
    db.executeSync(`
      CREATE TABLE IF NOT EXISTS settings (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL
      );
    `);
    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Error initializing database', error);
  }
};

// --- Settings Operations ---
export const setSetting = (key: string, value: string) => {
  db.executeSync('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)', [key, value]);
};

export const getSetting = (key: string): string | null => {
  const result = db.executeSync('SELECT value FROM settings WHERE key = ?', [key]);
  const rows = Array.isArray(result.rows) ? result.rows : ((result.rows as any)?._array || []);
  if (rows.length > 0) return rows[0].value;
  return null;
};

// --- CRUD Operations ---

export const getTasks = () => {
  const result = db.executeSync('SELECT * FROM tasks ORDER BY updated_at DESC');
  // @op-engineering/op-sqlite returns rows as an array in newer versions
  // or inside an _array wrapper in older versions.
  const rows = Array.isArray(result.rows) ? result.rows : ((result.rows as any)?._array || []);
  
  // Map SQLite INTEGER booleans to JS booleans
  return rows.map((row: any) => ({
    ...row,
    completed: row.completed === 1,
    synced_status: row.synced_status === 1,
  }));
};

export const insertTask = (task: any) => {
  db.executeSync(
    `INSERT INTO tasks (id, title, description, completed, synced_status, updated_at) 
     VALUES (?, ?, ?, ?, ?, ?)`,
    [
      task.id, 
      task.title, 
      task.description || '', 
      task.completed ? 1 : 0, 
      task.synced_status ? 1 : 0, 
      task.updated_at
    ]
  );
};

export const updateTaskInDB = (task: any) => {
  db.executeSync(
    `UPDATE tasks SET title = ?, description = ?, completed = ?, synced_status = ?, updated_at = ? WHERE id = ?`,
    [
      task.title,
      task.description || '',
      task.completed ? 1 : 0,
      task.synced_status ? 1 : 0,
      task.updated_at,
      task.id,
    ]
  );
};

export const deleteTaskFromDB = (id: string) => {
  db.executeSync('DELETE FROM tasks WHERE id = ?', [id]);
};
