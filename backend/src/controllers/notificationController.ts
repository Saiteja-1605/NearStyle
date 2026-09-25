import { Request, Response, NextFunction } from 'express';
import { Notification } from '../models/Notification';

// @desc Get user notifications
// @route GET /api/notifications
export const getMyNotifications = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const notifications = await Notification.find({ userId: req.user.id })
      .sort({ createdAt: -1 })
      .limit(30)
      .lean();

    const unreadCount = await Notification.countDocuments({ userId: req.user.id, read: false });

    res.json({
      notifications,
      unreadCount,
    });
  } catch (error) {
    next(error);
  }
};

// @desc Mark a notification as read
// @route PATCH /api/notifications/:id/read
export const markNotificationRead = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    await Notification.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      { read: true }
    );

    res.json({ message: 'Notification marked as read' });
  } catch (error) {
    next(error);
  }
};

// @desc Mark all notifications as read
// @route PATCH /api/notifications/read-all
export const markAllNotificationsRead = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    await Notification.updateMany({ userId: req.user.id, read: false }, { read: true });

    res.json({ message: 'All notifications marked as read' });
  } catch (error) {
    next(error);
  }
};
