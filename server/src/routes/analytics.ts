import express from 'express';
import { pool } from '../config/database.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';
import { format } from 'date-fns';
import * as XLSX from 'xlsx';

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

// Export Excel report with organized tables (admin only)
router.get('/report', authenticateToken, requireAdmin, async (req, res) => {
  try {
    console.log('Starting Excel report generation...');
    
    // Create a new workbook
    const workbook = XLSX.utils.book_new();
    console.log('Workbook created');

    // 1. TASK OVERVIEW TABLE
    console.log('Fetching task overview...');
    const taskOverview = await pool.query(`
      SELECT 
        t.title as "Task Title",
        t.description as "Description",
        CASE 
          WHEN t.status = 'not_started' THEN 'Not Started'
          WHEN t.status = 'in_progress' THEN 'In Progress'
          WHEN t.status = 'completed' THEN 'Completed'
          ELSE t.status
        END as "Status",
        CASE 
          WHEN t.priority = 'low' THEN 'Low'
          WHEN t.priority = 'medium' THEN 'Medium'
          WHEN t.priority = 'high' THEN 'High'
          ELSE t.priority
        END as "Priority",
        u1.name as "Assigned To",
        u1.department as "Department",
        u2.name as "Assigned By",
        t.due_date as "Due Date",
        t.created_at as "Created Date",
        t.updated_at as "Last Updated"
      FROM tasks t
      LEFT JOIN users u1 ON t.assignee_id = u1.id
      LEFT JOIN users u2 ON t.assigner_id = u2.id
      ORDER BY t.created_at DESC
    `);
    console.log(`Found ${taskOverview.rows.length} tasks`);

    const taskSheet = XLSX.utils.json_to_sheet(taskOverview.rows);
    XLSX.utils.book_append_sheet(workbook, taskSheet, 'Tasks Overview');
    console.log('Task sheet added');

    // 2. USER MANAGEMENT TABLE
    console.log('Fetching user overview...');
    const userOverview = await pool.query(`
      SELECT 
        u.name as "Full Name",
        u.email as "Email Address",
        u.department as "Department",
        CASE 
          WHEN u.role = 'admin' THEN 'Administrator'
          WHEN u.role = 'user' THEN 'Employee'
          ELSE u.role
        END as "Role",
        CASE 
          WHEN u.is_active = true THEN 'Active'
          ELSE 'Inactive'
        END as "Status",
        u.created_at as "Join Date"
      FROM users u
      ORDER BY u.created_at DESC
    `);
    console.log(`Found ${userOverview.rows.length} users`);

    const userSheet = XLSX.utils.json_to_sheet(userOverview.rows);
    XLSX.utils.book_append_sheet(workbook, userSheet, 'Users Management');
    console.log('User sheet added');

    // 3. STATISTICS SUMMARY TABLE
    console.log('Fetching statistics...');
    const taskStats = await pool.query(`
      SELECT 
        COUNT(*) as "Total Tasks",
        COUNT(CASE WHEN status = 'completed' THEN 1 END) as "Completed Tasks",
        COUNT(CASE WHEN status = 'in_progress' THEN 1 END) as "In Progress Tasks",
        COUNT(CASE WHEN status = 'not_started' THEN 1 END) as "Not Started Tasks",
        COUNT(CASE WHEN due_date < CURRENT_DATE AND status != 'completed' THEN 1 END) as "Overdue Tasks"
      FROM tasks
    `);

    const userStats = await pool.query(`
      SELECT 
        COUNT(*) as "Total Users",
        COUNT(CASE WHEN is_active = true THEN 1 END) as "Active Users",
        COUNT(CASE WHEN role = 'admin' THEN 1 END) as "Administrators",
        COUNT(CASE WHEN role = 'user' THEN 1 END) as "Employees"
      FROM users
    `);

    // Combine statistics
    const summaryData = [
      { "Metric": "Total Tasks", "Value": taskStats.rows[0]["Total Tasks"] },
      { "Metric": "Completed Tasks", "Value": taskStats.rows[0]["Completed Tasks"] },
      { "Metric": "In Progress Tasks", "Value": taskStats.rows[0]["In Progress Tasks"] },
      { "Metric": "Not Started Tasks", "Value": taskStats.rows[0]["Not Started Tasks"] },
      { "Metric": "Overdue Tasks", "Value": taskStats.rows[0]["Overdue Tasks"] },
      { "Metric": "", "Value": "" }, // Empty row
      { "Metric": "Total Users", "Value": userStats.rows[0]["Total Users"] },
      { "Metric": "Active Users", "Value": userStats.rows[0]["Active Users"] },
      { "Metric": "Administrators", "Value": userStats.rows[0]["Administrators"] },
      { "Metric": "Employees", "Value": userStats.rows[0]["Employees"] }
    ];

    const summarySheet = XLSX.utils.json_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(workbook, summarySheet, 'Statistics Summary');
    console.log('Summary sheet added');

    // Generate Excel file
    console.log('Generating Excel file...');
    const excelBuffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
    console.log(`Excel file generated, size: ${excelBuffer.length} bytes`);
    
    const filename = `TaskForge-Report-${format(new Date(), 'yyyy-MM-dd-HHmmss')}.xlsx`;
    
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(excelBuffer);
    console.log('Excel report sent successfully');
  } catch (error) {
    console.error('Excel report generation error:', error);
    res.status(500).json({ error: 'Failed to generate Excel report', details: error.message });
  }
});

export default router;