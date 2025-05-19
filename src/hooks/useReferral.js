import { useEffect } from 'react';

export default function useReferralTracker() {
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const ref = params.get('ref');
        if (ref) {
            localStorage.setItem('referrer_id', ref);
        }
    }, []);
}
