'use client';

import React, { useEffect, useState } from 'react';
import { Box, Typography, Stack, Badge, IconButton, Popover, Divider, Avatar, Button } from '@mui/material';
import Icon from '../ui/Icon';
import { formatDateTime } from '@/utils/formatters';
import { apiFetch } from '@/utils/api';

interface Notification {
    id_notification: number;
    title: string;
    message: string;
    read: boolean;
    created_at: string;
}

const NotificationDropdown = () => {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
    const [unreadCount, setUnreadCount] = useState(0);

    const fetchNotifications = async () => {
        const storedUser = localStorage.getItem('lab_user');
        if (!storedUser) return;
        
        const user = JSON.parse(storedUser);
        try {
            const data = await apiFetch<Notification[]>(`/notifications/user/${user.id_user}`);
            setNotifications(data);
            setUnreadCount(data.filter((n: Notification) => !n.read).length);
        } catch (error) {
            console.error('Error fetching notifications:', error);
        }
    };

    useEffect(() => {
        fetchNotifications();
        // Poll every 30 seconds
        const interval = setInterval(fetchNotifications, 30000);
        return () => clearInterval(interval);
    }, []);

    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const markAsRead = async (id: number) => {
        try {
            await apiFetch(`/notifications/${id}/read`, {
                method: 'PATCH',
            });
            fetchNotifications();
        } catch (error) {
            console.error('Error marking as read:', error);
        }
    };

    const markAllAsRead = async () => {
        const storedUser = localStorage.getItem('lab_user');
        if (!storedUser) return;
        const user = JSON.parse(storedUser);
        
        try {
            await apiFetch(`/notifications/user/${user.id_user}/read-all`, {
                method: 'PATCH',
            });
            fetchNotifications();
        } catch (error) {
            console.error('Error marking all as read:', error);
        }
    };

    const open = Boolean(anchorEl);

    return (
        <>
            <IconButton onClick={handleClick} sx={{ color: 'rgba(255, 255, 255, 0.6)', '&:hover': { color: '#0ea5e9', bgcolor: 'rgba(14, 165, 233, 0.1)' } }}>
                <Badge badgeContent={unreadCount} color="error" sx={{ '& .MuiBadge-badge': { bgcolor: '#ef4444', color: 'white' } }}>
                    <Icon name="bell" size="sm" />
                </Badge>
            </IconButton>

            <Popover
                open={open}
                anchorEl={anchorEl}
                onClose={handleClose}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                PaperProps={{
                    sx: {
                        mt: 1.5,
                        width: 360,
                        maxHeight: 480,
                        bgcolor: '#0f172a',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        borderRadius: '1rem',
                        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5)',
                        overflow: 'hidden'
                    }
                }}
            >
                <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', bgcolor: 'rgba(255, 255, 255, 0.02)' }}>
                    <Typography variant="subtitle1" fontWeight={700} color="white">Notificaciones</Typography>
                    {unreadCount > 0 && (
                        <Button size="small" onClick={markAllAsRead} sx={{ textTransform: 'none', color: '#0ea5e9' }}>
                            Marcar todo como leído
                        </Button>
                    )}
                </Box>
                <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.05)' }} />
                
                <Stack sx={{ maxHeight: 400, overflowY: 'auto' }}>
                    {notifications.length > 0 ? (
                        notifications.map((notification) => (
                            <Box 
                                key={notification.id_notification} 
                                onClick={() => !notification.read && markAsRead(notification.id_notification)}
                                sx={{ 
                                    p: 2, 
                                    cursor: 'pointer',
                                    bgcolor: notification.read ? 'transparent' : 'rgba(14, 165, 233, 0.05)',
                                    borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                                    transition: 'all 0.2s',
                                    '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.03)' }
                                }}
                            >
                                <Stack direction="row" spacing={2}>
                                    <Avatar sx={{ bgcolor: notification.read ? 'rgba(255, 255, 255, 0.05)' : 'rgba(14, 165, 233, 0.2)', color: notification.read ? 'rgba(255, 255, 255, 0.3)' : '#0ea5e9', width: 40, height: 40 }}>
                                        <Icon name={notification.title.includes('Cita') ? 'calendar' : 'file-text'} size="xs" />
                                    </Avatar>
                                    <Stack spacing={0.5} sx={{ flex: 1 }}>
                                        <Typography variant="body2" fontWeight={700} color="white">{notification.title}</Typography>
                                        <Typography variant="caption" color="rgba(255, 255, 255, 0.6)" sx={{ lineHeight: 1.4 }}>
                                            {notification.message}
                                        </Typography>
                                        <Typography variant="caption" color="rgba(255, 255, 255, 0.3)" fontSize="0.65rem">
                                            {formatDateTime(notification.created_at)}
                                        </Typography>
                                    </Stack>
                                    {!notification.read && (
                                        <Box sx={{ width: 8, height: 8, bgcolor: '#0ea5e9', borderRadius: '50%', mt: 1 }} />
                                    )}
                                </Stack>
                            </Box>
                        ))
                    ) : (
                        <Box sx={{ p: 4, textAlign: 'center' }}>
                            <Icon name="bell-off" size="md" color="rgba(255, 255, 255, 0.1)" />
                            <Typography variant="body2" color="rgba(255, 255, 255, 0.4)" mt={1}>
                                No tienes notificaciones
                            </Typography>
                        </Box>
                    )}
                </Stack>
            </Popover>
        </>
    );
};

export default NotificationDropdown;
