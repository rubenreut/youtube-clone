// Utility functions for formatting dates, numbers, and durations

/**
 * Format a date to relative time (e.g., "2 days ago", "3 months ago")
 * @param {string|Date} date - The date to format
 * @returns {string} Formatted relative time string
 */
export function formatTimeAgo(date) {
    if (!date) return '';

    const now = new Date();
    const past = new Date(date);
    const diffInSeconds = Math.floor((now - past) / 1000);

    if (diffInSeconds < 60) {
        return 'Just now';
    }

    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) {
        return `${diffInMinutes} ${diffInMinutes === 1 ? 'minute' : 'minutes'} ago`;
    }

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) {
        return `${diffInHours} ${diffInHours === 1 ? 'hour' : 'hours'} ago`;
    }

    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) {
        return `${diffInDays} ${diffInDays === 1 ? 'day' : 'days'} ago`;
    }

    const diffInWeeks = Math.floor(diffInDays / 7);
    if (diffInWeeks < 4) {
        return `${diffInWeeks} ${diffInWeeks === 1 ? 'week' : 'weeks'} ago`;
    }

    const diffInMonths = Math.floor(diffInDays / 30);
    if (diffInMonths < 12) {
        return `${diffInMonths} ${diffInMonths === 1 ? 'month' : 'months'} ago`;
    }

    const diffInYears = Math.floor(diffInDays / 365);
    return `${diffInYears} ${diffInYears === 1 ? 'year' : 'years'} ago`;
}

/**
 * Format a number to abbreviated form (e.g., 1.2K, 543K, 1.2M)
 * @param {number} num - The number to format
 * @returns {string} Formatted number string
 */
export function formatViewCount(num) {
    if (num === null || num === undefined) return '0';

    const number = parseInt(num, 10);

    if (number < 1000) {
        return number.toString();
    }

    if (number < 1000000) {
        const formatted = (number / 1000).toFixed(1);
        // Remove trailing .0
        return formatted.endsWith('.0')
            ? `${Math.floor(number / 1000)}K`
            : `${formatted}K`;
    }

    if (number < 1000000000) {
        const formatted = (number / 1000000).toFixed(1);
        return formatted.endsWith('.0')
            ? `${Math.floor(number / 1000000)}M`
            : `${formatted}M`;
    }

    const formatted = (number / 1000000000).toFixed(1);
    return formatted.endsWith('.0')
        ? `${Math.floor(number / 1000000000)}B`
        : `${formatted}B`;
}

/**
 * Format duration in seconds to MM:SS or HH:MM:SS
 * @param {number} seconds - Duration in seconds
 * @returns {string} Formatted duration string
 */
export function formatDuration(seconds) {
    if (!seconds || seconds < 0) return '0:00';

    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);

    if (hrs > 0) {
        return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }

    return `${mins}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Format subscriber count with appropriate suffix
 * @param {number} count - Subscriber count
 * @returns {string} Formatted subscriber string
 */
export function formatSubscriberCount(count) {
    if (!count) return '0 subscribers';

    const formatted = formatViewCount(count);
    return `${formatted} subscriber${count === 1 ? '' : 's'}`;
}
