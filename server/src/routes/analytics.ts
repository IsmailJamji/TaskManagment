import express from 'express';
import { pool } from '../config/database.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';
import { format } from 'date-fns';

const router = express.Router();

// Get dashboard analytics (admin only)
router.get('/dashboard', authenticateToken, requireAdmin, async (req, res) => {
  try {
    // Get task statistics
    const taskStats = await pool.query(`
      SELECT 
        COUNT(*) as total_tasks,
        COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_tasks,
        COUNT(CASE WHEN status = 'in_progress' THEN 1 END) as in_progress_tasks,
        COUNT(CASE WHEN due_date < CURRENT_DATE AND status != 'completed' THEN 1 END) as overdue_tasks
      FROM tasks
    `);

    // Get user statistics
    const userStats = await pool.query(`
      SELECT 
        COUNT(*) as total_users,
        COUNT(CASE WHEN is_active = true THEN 1 END) as active_users,
        COUNT(CASE WHEN role = 'admin' THEN 1 END) as admin_users
      FROM users
    `);

    // Get recent activity
    const recentTasks = await pool.query(`
      SELECT t.id, t.title, u.name as assignee_name, t.status, t.created_at
      FROM tasks t
      JOIN users u ON t.assignee_id = u.id
      ORDER BY t.updated_at DESC
      LIMIT 5
    `);

    res.json({
      taskStats: taskStats.rows[0],
      userStats: userStats.rows[0],
      recentActivity: recentTasks.rows
    });
  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get user dashboard analytics
router.get('/user-dashboard', authenticateToken, async (req: any, res) => {
  try {
    const userStats = await pool.query(`
      SELECT 
        COUNT(*) as total_tasks,
        COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_tasks,
        COUNT(CASE WHEN status = 'in_progress' THEN 1 END) as in_progress_tasks,
        COUNT(CASE WHEN due_date < CURRENT_DATE AND status != 'completed' THEN 1 END) as overdue_tasks
      FROM tasks
      WHERE assignee_id = $1
    `, [req.user.id]);

    res.json({
      userStats: userStats.rows[0]
    });
  } catch (error) {
    console.error('User analytics error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Export CSV report of activities (admin only)
router.get('/report', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const report = await pool.query(`
      SELECT 
        t.id,
        t.title,
        t.status,
        t.priority,
        t.due_date,
        t.created_at,
        t.updated_at,
        u1.name as assignee_name,
        u2.name as assigner_name
      FROM tasks t
      LEFT JOIN users u1 ON t.assignee_id = u1.id
      LEFT JOIN users u2 ON t.assigner_id = u2.id
      ORDER BY t.created_at DESC
    `);

    const headers = [
      'id','title','status','priority','due_date','created_at','updated_at','assignee_name','assigner_name'
    ];

    const escapeCsv = (val: any) => {
      if (val === null || val === undefined) return '';
      const s = String(val).replace(/"/g, '""');
      return /[",\n]/.test(s) ? `"${s}"` : s;
    };

    const rows = report.rows.map(r => [
      r.id,
      r.title,
      r.status,
      r.priority,
      r.due_date ? new Date(r.due_date).toISOString().slice(0,10) : '',
      r.created_at ? new Date(r.created_at).toISOString() : '',
      r.updated_at ? new Date(r.updated_at).toISOString() : '',
      r.assignee_name || '',
      r.assigner_name || ''
    ]);

    const csv = [headers.join(','), ...rows.map(row => row.map(escapeCsv).join(','))].join('\n');
    const filename = `taskforge-report-${format(new Date(), 'yyyyMMdd-HHmmss')}.csv`;
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=${filename}`);
    res.send(csv);
  } catch (error) {
    console.error('Report generation error:', error);
    res.status(500).json({ error: 'Failed to generate report' });
  }
});

export default router;