import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { query, get, run } from '../db/database.js';
import { authenticate, requirePermission, logAudit } from '../middleware/authMiddleware.js';

const router = express.Router();

// 1. List All Course Categories with Live Course Counts
router.get('/', authenticate, async (req, res) => {
  try {
    const categories = await query(`
      SELECT c.*,
             (SELECT COUNT(*) FROM courses WHERE category = c.name AND (org_id = ? OR ? = 'SUPER_ADMIN')) AS course_count
      FROM course_categories c
      WHERE c.org_id = ? OR ? = 'SUPER_ADMIN'
      ORDER BY c.order_index ASC, c.name ASC
    `, [req.user.org_id, req.user.role, req.user.org_id, req.user.role]);

    res.json(categories);
  } catch (err) {
    console.error('Failed to get categories:', err);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

// 2. Create Course Category (Admin / Course Creator)
router.post('/', authenticate, requirePermission('course.create'), async (req, res) => {
  try {
    const { name, description, icon, color, orderIndex } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Category name is required' });
    }

    const cleanName = name.trim();
    const slug = cleanName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const id = 'cat-' + uuidv4().slice(0, 8);

    await run(`
      INSERT INTO course_categories (id, org_id, name, slug, description, icon, color, order_index)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      id,
      req.user.org_id,
      cleanName,
      slug,
      description || '',
      icon || 'BookOpen',
      color || '#dc2626',
      orderIndex || 0
    ]);

    const created = await get('SELECT * FROM course_categories WHERE id = ?', [id]);
    await logAudit(req.user.org_id, req.user.id, 'CATEGORY_CREATED', 'CATEGORY', id, { name: cleanName });

    res.status(201).json({ ...created, course_count: 0 });
  } catch (err) {
    console.error('Failed to create category:', err);
    res.status(500).json({ error: 'Failed to create category' });
  }
});

// 3. Update Course Category
router.put('/:id', authenticate, requirePermission('course.update'), async (req, res) => {
  try {
    const { name, description, icon, color, orderIndex } = req.body;
    const existing = await get('SELECT * FROM course_categories WHERE id = ?', [req.params.id]);
    if (!existing) return res.status(404).json({ error: 'Category not found' });

    const newName = name ? name.trim() : existing.name;
    const newSlug = newName.toLowerCase().replace(/[^a-z0-9]+/g, '-');

    await run(`
      UPDATE course_categories SET
        name = ?,
        slug = ?,
        description = COALESCE(?, description),
        icon = COALESCE(?, icon),
        color = COALESCE(?, color),
        order_index = COALESCE(?, order_index)
      WHERE id = ?
    `, [
      newName,
      newSlug,
      description,
      icon,
      color,
      orderIndex,
      req.params.id
    ]);

    // If category name changed, update courses that referenced the old name
    if (existing.name !== newName) {
      await run('UPDATE courses SET category = ? WHERE category = ? AND org_id = ?', [
        newName,
        existing.name,
        existing.org_id
      ]);
    }

    const updated = await get('SELECT * FROM course_categories WHERE id = ?', [req.params.id]);
    res.json(updated);
  } catch (err) {
    console.error('Failed to update category:', err);
    res.status(500).json({ error: 'Failed to update category' });
  }
});

// 4. Delete Course Category
router.delete('/:id', authenticate, requirePermission('course.update'), async (req, res) => {
  try {
    const existing = await get('SELECT * FROM course_categories WHERE id = ?', [req.params.id]);
    if (!existing) return res.status(404).json({ error: 'Category not found' });

    const courseCheck = await get('SELECT COUNT(*) as count FROM courses WHERE category = ?', [existing.name]);
    if (courseCheck && courseCheck.count > 0) {
      return res.status(400).json({
        error: `Cannot delete category "${existing.name}" because ${courseCheck.count} course(s) are actively categorized under it. Please reassign those courses first.`
      });
    }

    await run('DELETE FROM course_categories WHERE id = ?', [req.params.id]);
    await logAudit(req.user.org_id, req.user.id, 'CATEGORY_DELETED', 'CATEGORY', req.params.id, { name: existing.name });

    res.json({ success: true, message: 'Category deleted successfully' });
  } catch (err) {
    console.error('Failed to delete category:', err);
    res.status(500).json({ error: 'Failed to delete category' });
  }
});

export default router;
