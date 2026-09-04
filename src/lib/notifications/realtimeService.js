/**
 * Realtime Notification Service
 * Manages Supabase Realtime WebSocket subscriptions for In-App Notifications.
 * Guarantees ONE active channel per session, server-side row filters,
 * robust reconnect handling, and reconciliation on reconnection.
 */

import { supabase } from '@/lib/supabaseClient';

class RealtimeNotificationManager {
    constructor() {
        this.channel = null;
        this.currentUserId = null;
        this.isAdmin = false;
        this.listeners = new Set();
        this.reconnectListeners = new Set();
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 5;
        this.reconnectTimer = null;
        this.isSubscribed = false;
    }

    /**
     * Subscribe to realtime notifications for a user or administrator.
     * Guarantees single channel per active session.
     */
    subscribe(userId, onNotification, onReconnect) {
        if (typeof onNotification === 'function') {
            this.listeners.add(onNotification);
        }
        if (typeof onReconnect === 'function') {
            this.reconnectListeners.add(onReconnect);
        }

        const isUserSessionAdmin = !userId; // Admin center passes null/empty for userId

        // If already subscribed to the same scope, return unsubscribe handle
        if (this.channel && this.currentUserId === userId && this.isAdmin === isUserSessionAdmin) {
            return () => this.unsubscribeListener(onNotification, onReconnect);
        }

        // Clean up any existing channel before establishing new scope
        this.cleanupChannel();

        this.currentUserId = userId;
        this.isAdmin = isUserSessionAdmin;

        if (!supabase) {
            return () => this.unsubscribeListener(onNotification, onReconnect);
        }

        this.establishChannel();

        return () => this.unsubscribeListener(onNotification, onReconnect);
    }

    establishChannel() {
        try {
            const channelId = this.isAdmin
                ? 'admin_notifications_live'
                : `user_notifications_${this.currentUserId}`;

            // Create Supabase Realtime Channel
            this.channel = supabase.channel(channelId);

            if (this.isAdmin) {
                // Filter for administrator-targeted notifications
                this.channel
                    .on(
                        'postgres_changes',
                        {
                            event: 'INSERT',
                            schema: 'public',
                            table: 'notifications',
                            filter: 'target_role=eq.admin'
                        },
                        (payload) => this.handleIncomingNotification(payload.new)
                    )
                    .on(
                        'postgres_changes',
                        {
                            event: 'UPDATE',
                            schema: 'public',
                            table: 'notifications',
                            filter: 'target_role=eq.admin'
                        },
                        (payload) => this.handleIncomingUpdate(payload.new)
                    );
            } else if (this.currentUserId) {
                // Filter for user-targeted notifications
                this.channel
                    .on(
                        'postgres_changes',
                        {
                            event: 'INSERT',
                            schema: 'public',
                            table: 'notifications',
                            filter: `recipient_id=eq.${this.currentUserId}`
                        },
                        (payload) => this.handleIncomingNotification(payload.new)
                    )
                    .on(
                        'postgres_changes',
                        {
                            event: 'UPDATE',
                            schema: 'public',
                            table: 'notifications',
                            filter: `recipient_id=eq.${this.currentUserId}`
                        },
                        (payload) => this.handleIncomingUpdate(payload.new)
                    );
            }

            // Subscribe and monitor connection lifecycle
            this.channel.subscribe((status, err) => {
                if (status === 'SUBSCRIBED') {
                    const wasDisconnected = !this.isSubscribed;
                    this.isSubscribed = true;
                    this.reconnectAttempts = 0;

                    // Trigger reconciliation if reconnecting after an outage
                    if (wasDisconnected) {
                        this.reconnectListeners.forEach((fn) => {
                            try { fn(); } catch (e) { console.error('Reconnect listener error:', e); }
                        });
                    }
                } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT' || status === 'CLOSED') {
                    this.isSubscribed = false;
                    this.scheduleReconnect();
                }
            });
        } catch (err) {
            console.warn('Realtime channel configuration error:', err);
            this.scheduleReconnect();
        }
    }

    handleIncomingNotification(newRecord) {
        if (!newRecord) return;

        this.listeners.forEach((fn) => {
            try { fn(newRecord); } catch (e) { console.error('Realtime notification listener error:', e); }
        });

        // Dispatch DOM event for cross-component updates
        if (typeof window !== 'undefined') {
            const eventName = this.isAdmin ? 'nxt:new_admin_notification' : 'nxt:new_notification';
            window.dispatchEvent(new CustomEvent(eventName, { detail: newRecord }));
        }
    }

    handleIncomingUpdate(updatedRecord) {
        if (!updatedRecord) return;

        // Invalidate and trigger refetch across listeners
        this.listeners.forEach((fn) => {
            try { fn(updatedRecord); } catch (e) { console.error('Realtime update listener error:', e); }
        });
    }

    scheduleReconnect() {
        if (this.reconnectAttempts >= this.maxReconnectAttempts) {
            console.warn(`[Realtime] Max reconnect attempts (${this.maxReconnectAttempts}) reached. Realtime paused until user action.`);
            return;
        }

        if (this.reconnectTimer) return;

        this.reconnectAttempts += 1;
        const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000);

        this.reconnectTimer = setTimeout(() => {
            this.reconnectTimer = null;
            if (this.currentUserId || this.isAdmin) {
                this.cleanupChannel();
                this.establishChannel();
            }
        }, delay);
    }

    unsubscribeListener(onNotification, onReconnect) {
        if (onNotification) this.listeners.delete(onNotification);
        if (onReconnect) this.reconnectListeners.delete(onReconnect);

        if (this.listeners.size === 0 && this.reconnectListeners.size === 0) {
            this.cleanupChannel();
        }
    }

    cleanupChannel() {
        if (this.reconnectTimer) {
            clearTimeout(this.reconnectTimer);
            this.reconnectTimer = null;
        }

        if (this.channel && supabase) {
            try {
                supabase.removeChannel(this.channel);
            } catch (err) {
                console.warn('Realtime removeChannel note:', err);
            }
            this.channel = null;
        }
        this.isSubscribed = false;
    }

    unsubscribeAll() {
        this.listeners.clear();
        this.reconnectListeners.clear();
        this.cleanupChannel();
        this.currentUserId = null;
        this.isAdmin = false;
    }
}

export const realtimeNotificationManager = new RealtimeNotificationManager();
export default realtimeNotificationManager;
