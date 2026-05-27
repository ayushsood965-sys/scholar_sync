const Notification = require('../models/Notification');

// @desc    Get all notifications for logged-in user (personal + role scope)
// @route   GET /api/notifications
// @access  Private
exports.getNotifications = async (req, res) => {
  try {
    const userId = req.user._id;
    const userRole = req.user.role;
    const userDept = req.user.department;

    // Fetch personal notifications OR role-scoped notifications (optional dept-specific)
    const notifications = await Notification.find({
      $or: [
        { recipient: userId },
        {
          roleScope: userRole,
          $or: [{ department: null }, { department: userDept }]
        }
      ]
    }).sort({ createdAt: -1 });

    // Format output: add 'read' virtual boolean for client convenience
    const formatted = notifications.map(n => {
      let read = false;
      if (n.recipient) {
        read = n.isRead;
      } else {
        read = n.isReadBy.includes(userId);
      }
      return {
        _id: n._id,
        recipient: n.recipient,
        roleScope: n.roleScope,
        department: n.department,
        title: n.title,
        message: n.message,
        type: n.type,
        link: n.link,
        createdAt: n.createdAt,
        read
      };
    });

    res.json(formatted);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving notifications', error: error.message });
  }
};

// @desc    Mark specific notification as read
// @route   PUT /api/notifications/:id/read
// @access  Private
exports.markAsRead = async (req, res) => {
  try {
    const notificationId = req.params.id;
    const userId = req.user._id;

    const notif = await Notification.findById(notificationId);

    if (!notif) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    if (notif.recipient) {
      // Personal notification
      if (notif.recipient.toString() !== userId.toString()) {
        return res.status(403).json({ message: 'Unauthorized action' });
      }
      notif.isRead = true;
    } else {
      // Group/role-scoped notification
      if (!notif.isReadBy.includes(userId)) {
        notif.isReadBy.push(userId);
      }
    }

    await notif.save();
    res.json({ message: 'Notification marked as read', success: true });
  } catch (error) {
    res.status(500).json({ message: 'Error marking notification as read', error: error.message });
  }
};

// @desc    Mark all notifications as read for the user
// @route   PUT /api/notifications/read-all
// @access  Private
exports.markAllAsRead = async (req, res) => {
  try {
    const userId = req.user._id;
    const userRole = req.user.role;
    const userDept = req.user.department;

    // 1. Update all personal notifications to isRead = true
    await Notification.updateMany(
      { recipient: userId, isRead: false },
      { $set: { isRead: true } }
    );

    // 2. For group/role-scoped notifications, add user to isReadBy array
    const unreadGroupNotifs = await Notification.find({
      recipient: null,
      roleScope: userRole,
      $or: [{ department: null }, { department: userDept }],
      isReadBy: { $ne: userId }
    });

    for (const notif of unreadGroupNotifs) {
      notif.isReadBy.push(userId);
      await notif.save();
    }

    res.json({ message: 'All notifications marked as read', success: true });
  } catch (error) {
    res.status(500).json({ message: 'Error marking all notifications as read', error: error.message });
  }
};

// @desc    Internal helper to create notifications on system actions
exports.createNotification = async ({ recipient, roleScope, department, title, message, type, link }) => {
  try {
    // Avoid duplicate welcome notifications for the same recipient
    if (type === 'WELCOME' && recipient) {
      const exists = await Notification.findOne({ recipient, type: 'WELCOME' });
      if (exists) return exists;
    }

    const newNotification = await Notification.create({
      recipient: recipient || null,
      roleScope: roleScope || null,
      department: department || null,
      title,
      message,
      type: type || 'INFO',
      link: link || ''
    });

    return newNotification;
  } catch (error) {
    console.error('Failed to create notification:', error.message);
    return null;
  }
};
