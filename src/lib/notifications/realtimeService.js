/**
 * Realtime Notification Service
 * Manages Supabase Realtime WebSocket subscriptions for In-App Notifications.
 * Handles automatic deduplication, reconnections, and clean unmounting.
 */

import { supabase } from '@/lib/supabaseClient';

class RealtimeNotificationManager {
    constructor() {
        this.channel = null;
        this.currentUserId = null;
        this.listeners = new Set();
    }

    /**
     * Subscribe to realtime notifications for a user or admin
     */
    subscribe(userId, onNotification) {
        if (typeof onNotification === 'function') {
            this.listeners.add(onNotification);
        }

        // If already subscribed to the same user channel, return unsubscribe handle
        if (this.channel && this.currentUserId === userId) {
            return () => {
                this.listeners.delete(onNotification);
            };
        }

        // Clean up previous channel if user changed
        if (this.channel) {
            this.unsubscribeAll();
        }

        this.currentUserId = userId;

        if (!supabase) {
            return () => {
                this.listeners.delete(onNotification);
            };
        }

        try {
            const channelName = userId ? `user_notifications_${userId}` : 'admin_notifications';
            
            this.channel = supabase
                .channel(channelName)
                .on(
                    'postgres_changes',
                    {
                        event: 'INSERT',
                        schema: 'public',
                        table: 'notifications'
                    },
                    (payload) => {
                        const newRecord = payload.new;
                        // Trigger listeners if notification is meant for this user or admin
                        if (
                            !userId ||
                            newRecord.recipient_id === userId ||
                            newRecord.target_role === 'admin' ||
                            newRecord.target_role === 'all'
                        ) {
                            this.listeners.forEach(fn => {
                                try { fn(newRecord); } catch (e) { console.error('Realtime callback error:', e); }
                            });

                            // Also dispatch custom DOM event for other components
                            if (typeof window !== 'undefined') {
                                window.dispatchEvent(new CustomEvent('nxt:new_notification', { detail: newRecord }));
                            }
                        }
                    }
                )
                .subscribe((status) => {
                    if (status === 'SUBSCRIBED') {
                        // Channel active
                    }
                });
        } catch (err) {
            console.warn('Supabase Realtime notification channel error:', err);
        }

        return () => {
            this.listeners.delete(onNotification);
            if (this.listeners.size === 0) {
                this.unsubscribeAll();
            }
        };
    }

    unsubscribeAll() {
        if (this.channel && supabase) {
            try {
                supabase.removeChannel(this.channel);
            } catch (err) {
                console.warn('Remove channel error:', err);
            }
            this.channel = null;
            this.currentUserId = null;
        }
    }
}

export const realtimeNotificationManager = new RealtimeNotificationManager();
