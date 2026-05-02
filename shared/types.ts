/**
 * SyncSpace - Shared Type Definitions
 * Shared between frontend and backend for type safety
 */

// ============================================
// User & Auth Types
// ============================================

/** User roles within a workspace */
export enum UserRole {
  ADMIN = 'admin',
  MEMBER = 'member',
  VIEWER = 'viewer',
}

/** User status for presence tracking */
export enum UserStatus {
  ONLINE = 'online',
  AWAY = 'away',
  DND = 'dnd',     // Do Not Disturb / Focus Mode
  OFFLINE = 'offline',
}

/** User profile */
export interface User {
  id: string;
  email: string;
  displayName: string;
  photoURL: string;
  role: UserRole;
  status: UserStatus;
  lastSeen: string;
  createdAt: string;
  focusModeUntil?: string;
  skills?: string[];
  department?: string;
}

// ============================================
// Task Types
// ============================================

/** Task status in Kanban workflow */
export enum TaskStatus {
  TODO = 'todo',
  IN_PROGRESS = 'in_progress',
  REVIEW = 'review',
  DONE = 'done',
}

/** Task priority levels */
export enum TaskPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent',
}

/** Task label/tag */
export interface TaskLabel {
  id: string;
  name: string;
  color: string;
}

/** Task entity */
export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  assigneeId: string | null;
  assigneeName?: string;
  assigneePhoto?: string;
  creatorId: string;
  labels: TaskLabel[];
  dueDate: string | null;
  estimatedHours?: number;
  actualHours?: number;
  attachments: Attachment[];
  subtasks: Subtask[];
  channelId?: string;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
  order: number;
}

/** Subtask within a task */
export interface Subtask {
  id: string;
  title: string;
  completed: boolean;
}

/** File attachment */
export interface Attachment {
  id: string;
  name: string;
  url: string;
  type: string;
  size: number;
  uploadedBy: string;
  uploadedAt: string;
}

// ============================================
// Channel & Message Types
// ============================================

/** Channel type */
export enum ChannelType {
  PUBLIC = 'public',
  PRIVATE = 'private',
  DIRECT = 'direct',
}

/** Communication channel */
export interface Channel {
  id: string;
  name: string;
  description: string;
  type: ChannelType;
  memberIds: string[];
  createdBy: string;
  createdAt: string;
  lastMessageAt: string;
  unreadCount?: number;
  pinnedMessageIds?: string[];
}

/** Message in a channel */
export interface Message {
  id: string;
  channelId: string;
  senderId: string;
  senderName: string;
  senderPhoto: string;
  content: string;
  type: 'text' | 'file' | 'system' | 'ai_summary';
  attachments: Attachment[];
  reactions: Record<string, string[]>; // emoji -> userIds
  threadId?: string;
  replyCount?: number;
  mentions: string[];
  createdAt: string;
  editedAt?: string;
  isDeleted?: boolean;
}

// ============================================
// Calendar & Meeting Types
// ============================================

/** Calendar event */
export interface CalendarEvent {
  id: string;
  title: string;
  description: string;
  startTime: string;
  endTime: string;
  attendeeIds: string[];
  meetLink?: string;
  location?: string;
  createdBy: string;
  isAllDay: boolean;
  color: string;
  googleEventId?: string;
}

// ============================================
// Analytics Types
// ============================================

/** Team analytics data */
export interface TeamAnalytics {
  totalTasks: number;
  completedTasks: number;
  overdueTasks: number;
  averageCompletionTime: number;
  tasksByStatus: Record<TaskStatus, number>;
  tasksByPriority: Record<TaskPriority, number>;
  tasksByMember: Record<string, number>;
  weeklyVelocity: number[];
  teamMoodAverage: number;
  activeMembers: number;
  totalMessages: number;
}

/** Activity feed item */
export interface ActivityItem {
  id: string;
  userId: string;
  userName: string;
  userPhoto: string;
  action: string;
  targetType: 'task' | 'channel' | 'message' | 'meeting' | 'member';
  targetId: string;
  targetName: string;
  timestamp: string;
  metadata?: Record<string, string>;
}

// ============================================
// Notification Types
// ============================================

/** Notification */
export interface Notification {
  id: string;
  userId: string;
  title: string;
  body: string;
  type: 'task_assigned' | 'mention' | 'deadline' | 'meeting' | 'system';
  actionUrl?: string;
  read: boolean;
  createdAt: string;
}

// ============================================
// Workflow Automation Types
// ============================================

/** Automation trigger type */
export enum AutomationTrigger {
  TASK_STATUS_CHANGE = 'task_status_change',
  TASK_ASSIGNED = 'task_assigned',
  DEADLINE_APPROACHING = 'deadline_approaching',
  NEW_MESSAGE = 'new_message',
}

/** Automation action type */
export enum AutomationAction {
  SEND_NOTIFICATION = 'send_notification',
  POST_MESSAGE = 'post_message',
  UPDATE_TASK = 'update_task',
  CREATE_MEETING = 'create_meeting',
}

/** Workflow automation rule */
export interface AutomationRule {
  id: string;
  name: string;
  trigger: AutomationTrigger;
  triggerConfig: Record<string, string>;
  action: AutomationAction;
  actionConfig: Record<string, string>;
  enabled: boolean;
  createdBy: string;
  createdAt: string;
}

// ============================================
// API Response Types
// ============================================

/** Standard API response */
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

/** Paginated response */
export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

// ============================================
// AI Types
// ============================================

/** AI-generated task suggestion */
export interface AISuggestion {
  title: string;
  description: string;
  priority: TaskPriority;
  estimatedHours: number;
  suggestedAssignee?: string;
}

/** AI summary result */
export interface AISummary {
  summary: string;
  keyPoints: string[];
  actionItems: string[];
  sentiment: 'positive' | 'neutral' | 'negative';
}
