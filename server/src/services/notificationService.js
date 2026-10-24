
import Notification from '../models/Notification.js';

export async function createNotification({
  recipient,
  actor = null,
  type,
  title,
  message,
  link = '/claims',
  relatedClaim = null,
}) {
  if (!recipient) return null;

  try {
    return await Notification.create({
      recipient,
      actor,
      type,
      title,
      message,
      link,
      relatedClaim,
    });
  } catch (error) {
    // The main claim action should succeed even if notification
    // creation fails. Log the failure for debugging.
    console.error('Could not create notification:', error.message);
    return null;
  }
}
