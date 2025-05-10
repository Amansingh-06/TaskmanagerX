import { supabase } from './supabaseClient';

let subscription;

export const subscribeToTable = () => {
    subscription = supabase
        .channel('public:tasks')
        .on(
            'postgres_changes',
            { event: '*', schema: 'public', table: 'tasks' },
            payload => {
                console.log('Change received!', payload);
                showNotification(payload);
            }
        )
        .on('error', (err) => {
            console.error('Realtime subscription error:', err);
        })
        .subscribe();
};

const showNotification = async (payload) => {
    const task = payload.new;
    let title = '';
    let message = '';

    // Determine the event type
    switch (payload.eventType) {
        case 'INSERT':
            title = 'New Task Added';
            message = `Task: ${task.title} has been added!`;
            break;
        case 'UPDATE':
            title = 'Task Updated';
            message = `Task: ${task.title} was updated!`;
            break;
        case 'DELETE':
            title = 'Task Deleted';
            message = `Task: ${task.title} was deleted!`;
            break;
        default:
            title = 'Task Event';
            message = `Task: ${task.title} had an unknown event!`;
            break;
    }
    console.log(payload)
    console.log(payload.event)

    // Instead of showing directly, send to backend which triggers push
    await fetch('http://localhost:3000/api/send-notification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            title,
            message
        }),
    });
};

export const requestNotificationPermission = async () => {
    if (Notification.permission !== 'granted') {
        await Notification.requestPermission();
    }
};

export const unsubscribeFromTable = () => {
    if (subscription) {
        supabase.removeChannel(subscription);
        console.log('Unsubscribed from task changes');
    }
};
