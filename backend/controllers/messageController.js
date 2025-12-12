// ========================================
// backend/controllers/messageController.js
// ========================================
import Message from "../models/Message.js";
import User from "../models/User.js"; // ← Missing import added

// Send a new message
export const sendMessage = async (req, res) => {
  try {
    const { receiverId, content } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({ msg: "Message content is required" });
    }

    const receiver = await User.findById(receiverId);
    if (!receiver) {
      return res.status(404).json({ msg: "Receiver not found" });
    }

    const message = await Message.create({
      senderId: req.user._id,
      receiverId,
      content: content.trim()
    });

    await message.populate("senderId", "name email");

    res.status(201).json({ msg: "Message sent", message });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
};

// Get conversation between current user and another user
export const getConversation = async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user._id;

    const messages = await Message.find({
      $or: [
        { senderId: currentUserId, receiverId: userId },
        { senderId: userId, receiverId: currentUserId }
      ]
    })
      .sort({ createdAt: 1 })
      .populate("senderId", "name email")
      .populate("receiverId", "name email");

    // Mark messages as read
    await Message.updateMany(
      { senderId: userId, receiverId: currentUserId, isRead: false },
      { isRead: true, readAt: new Date() }
    );

    res.json({ messages });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
};

// Get all conversations for the current user
export const getConversations = async (req, res) => {
  try {
    const currentUserId = req.user._id;

    const sentMessages = await Message.distinct("receiverId", { senderId: currentUserId });
    const receivedMessages = await Message.distinct("senderId", { receiverId: currentUserId });

    const uniqueUserIds = [...new Set([...sentMessages, ...receivedMessages])];

    const conversations = await Promise.all(
      uniqueUserIds.map(async (userId) => {
        const lastMessage = await Message.findOne({
          $or: [
            { senderId: currentUserId, receiverId: userId },
            { senderId: userId, receiverId: currentUserId }
          ]
        })
          .sort({ createdAt: -1 })
          .populate("senderId", "name email")
          .populate("receiverId", "name email");

        const unreadCount = await Message.countDocuments({
          senderId: userId,
          receiverId: currentUserId,
          isRead: false
        });

        const user = await User.findById(userId).select("name email role");

        return {
          user,
          lastMessage,
          unreadCount
        };
      })
    );

    // Sort conversations by latest message
    conversations.sort((a, b) => {
      const timeA = a.lastMessage?.createdAt || 0;
      const timeB = b.lastMessage?.createdAt || 0;
      return timeB - timeA;
    });

    res.json({ conversations });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
};

// Get total unread messages count for current user
export const getUnreadCount = async (req, res) => {
  try {
    const count = await Message.countDocuments({
      receiverId: req.user._id,
      isRead: false
    });

    res.json({ unreadCount: count });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
};

// Mark a specific message as read
export const markAsRead = async (req, res) => {
  try {
    const { messageId } = req.params;

    const message = await Message.findById(messageId);

    if (!message) {
      return res.status(404).json({ msg: "Message not found" });
    }

    if (message.receiverId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ msg: "Not authorized" });
    }

    message.isRead = true;
    message.readAt = new Date();
    await message.save();

    res.json({ msg: "Message marked as read", message });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
};

// Delete a specific message
export const deleteMessage = async (req, res) => {
  try {
    const { messageId } = req.params;

    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({ msg: "Message not found" });
    }

    // Only sender can delete
    if (message.senderId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ msg: "Not authorized" });
    }

    await message.remove();
    res.json({ msg: "Message deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
};
