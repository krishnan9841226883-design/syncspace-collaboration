/**
 * SyncSpace — Chat Page
 * Real-time messaging with Firestore sync
 */

import { useState, useRef, useEffect, type KeyboardEvent } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useMessages, addDocument } from '../services/firestoreService';

interface ChatChannel {
  id: string;
  name: string;
  type: 'public' | 'private' | 'direct';
  unread: number;
  description: string;
}

const channels: ChatChannel[] = [
  { id: 'general', name: 'general', type: 'public', unread: 0, description: 'General team discussions' },
  { id: 'engineering', name: 'engineering', type: 'public', unread: 0, description: 'Engineering team channel' },
  { id: 'design', name: 'design', type: 'public', unread: 0, description: 'Design discussions & reviews' },
  { id: 'standup', name: 'standup', type: 'public', unread: 0, description: 'Daily standup updates' },
  { id: 'random', name: 'random', type: 'public', unread: 0, description: 'Off-topic fun' },
];

export default function Chat() {
  const { user, isDemoMode } = useAuth();
  const [activeChannel, setActiveChannel] = useState(channels[0]);
  const { messages: firestoreMessages, sendMessage } = useMessages(activeChannel.id);
  const [localMessages, setLocalMessages] = useState<Array<{ id: string; content: string; senderName: string; senderInitials: string; createdAt: unknown; type: string }>>([]);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const messages = isDemoMode ? localMessages : firestoreMessages;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Seed a welcome message for new channels in Firestore
  useEffect(() => {
    if (!isDemoMode && firestoreMessages.length === 0 && activeChannel.id === 'general') {
      addDocument(`channels/general/messages`, {
        content: `Welcome to #general! This is your team's main channel. 🎉`,
        senderId: 'system',
        senderName: 'SyncSpace',
        senderInitials: '🤖',
        type: 'system',
      }).catch(() => { /* ignore if already seeded */ });
    }
  }, [isDemoMode, firestoreMessages.length, activeChannel.id]);

  const handleSend = async () => {
    if (!input.trim()) return;
    const initials = user?.displayName?.split(' ').map(n => n[0]).join('').slice(0, 2) || 'U';

    if (!isDemoMode && user) {
      await sendMessage({
        content: input,
        senderId: user.uid,
        senderName: user.displayName || 'User',
        senderInitials: initials,
      });
    } else {
      setLocalMessages(prev => [...prev, {
        id: `m${Date.now()}`,
        content: input,
        senderName: user?.displayName || 'Demo User',
        senderInitials: initials,
        createdAt: new Date(),
        type: 'text',
      }]);
    }
    setInput('');
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const formatTime = (ts: unknown): string => {
    if (!ts) return '';
    try {
      const date = (ts as { toDate?: () => Date }).toDate?.() || new Date(ts as string);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '';
    }
  };

  return (
    <div className="chat-page" role="region" aria-label="Team messaging">
      {/* Channel Sidebar */}
      <div className="channel-sidebar">
        <div className="channel-sidebar-header">
          <h2 className="channel-sidebar-title">Channels</h2>
          <button className="btn btn-ghost btn-sm" aria-label="Create new channel" title="Create channel">➕</button>
        </div>
        <div className="channel-list" role="list" aria-label="Available channels">
          <div className="channel-list-section">
            <div className="channel-list-section-title">Channels</div>
            {channels.map((ch) => (
              <button
                key={ch.id}
                id={`channel-${ch.id}`}
                className={`channel-list-item ${activeChannel.id === ch.id ? 'active' : ''}`}
                onClick={() => setActiveChannel(ch)}
                aria-current={activeChannel.id === ch.id ? 'true' : undefined}
                role="listitem"
              >
                <span className="channel-icon" aria-hidden="true">#</span>
                {ch.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Chat Area */}
      <div className="chat-area">
        <div className="chat-header">
          <div className="chat-header-info">
            <div>
              <div className="chat-header-name"># {activeChannel.name}</div>
              <div className="chat-header-desc">
                {activeChannel.description}
                {!isDemoMode && <span style={{ color: 'var(--color-success-500)', marginLeft: 8, fontSize: '11px' }}>● Live</span>}
              </div>
            </div>
          </div>
          <div className="chat-header-actions">
            <button className="header-btn" aria-label="Search in channel" title="Search">🔍</button>
            <button className="header-btn" aria-label="AI Summary" title="AI Summary">🧠</button>
            <button className="header-btn" aria-label="Start video call" title="Start Meet">📹</button>
          </div>
        </div>

        <div className="chat-messages" role="log" aria-label={`Messages in ${activeChannel.name}`} aria-live="polite">
          {messages.length === 0 ? (
            <div className="chat-empty">
              <span className="chat-empty-icon" aria-hidden="true">💬</span>
              <p>No messages yet. Start the conversation!</p>
            </div>
          ) : (
            messages.map((msg) =>
              (msg as { type?: string }).type === 'system' ? (
                <div key={msg.id} className="message-system" role="status">{(msg as { content: string }).content}</div>
              ) : (
                <div key={msg.id} className="message">
                  <div className="message-avatar-placeholder">{(msg as { senderInitials?: string }).senderInitials || '?'}</div>
                  <div className="message-body">
                    <div className="message-header">
                      <span className="message-sender">{(msg as { senderName?: string }).senderName || 'User'}</span>
                      <time className="message-time">{formatTime((msg as { createdAt?: unknown }).createdAt)}</time>
                    </div>
                    <div className="message-content">{(msg as { content: string }).content}</div>
                  </div>
                </div>
              )
            )
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="chat-input-container">
          <div className="chat-input-wrapper">
            <label htmlFor="chat-message-input" className="sr-only">Type a message</label>
            <textarea
              id="chat-message-input"
              className="chat-input"
              placeholder={`Message #${activeChannel.name}`}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              rows={1}
              aria-label={`Type a message in ${activeChannel.name}`}
            />
            <button
              id="send-message-btn"
              className="chat-send-btn"
              onClick={handleSend}
              disabled={!input.trim()}
              aria-label="Send message"
            >
              ➤
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
