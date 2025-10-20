export const formatDateTimeUS = (dateString: string | Date): string => {
    if (!dateString) return '';
    
    try {
        const date = new Date(dateString);
        
        if (isNaN(date.getTime())) {
            return 'Invalid Date';
        }
        
        return date.toLocaleString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        });
    } catch (error) {
        console.error('Error formatting date:', error);
        return 'Invalid Date';
    }
};

export const formatDateTimeLocal = (dateString: string | Date): string => {
    if (!dateString) return '';
    
    try {
        if (dateString instanceof Date) {
            return dateString.toLocaleString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: 'numeric',
                minute: '2-digit',
                hour12: true
            });
        }
        
        const date = new Date(dateString);
        
        if (isNaN(date.getTime())) {
            return 'Invalid Date';
        }
        
        return date.toLocaleString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        });
    } catch (error) {
        console.error('Error formatting date:', error);
        return 'Invalid Date';
    }
};

export const formatDateUS = (dateString: string | Date): string => {
    if (!dateString) return '';
    
    try {
        const date = new Date(dateString);
        
        if (isNaN(date.getTime())) {
            return 'Invalid Date';
        }
        
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    } catch (error) {
        console.error('Error formatting date:', error);
        return 'Invalid Date';
    }
};

export const formatDateOnly = (dateString: string | Date): string => {
    if (!dateString) return '';
    
    try {
        const date = new Date(dateString);
        
        if (isNaN(date.getTime())) {
            return 'Invalid Date';
        }
        
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    } catch (error) {
        console.error('Error formatting date:', error);
        return 'Invalid Date';
    }
};

export const formatTimeOnly = (dateString: string | Date): string => {
    if (!dateString) return '';
    
    try {
        const date = new Date(dateString);
        
        if (isNaN(date.getTime())) {
            return 'Invalid Time';
        }
        
        return date.toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        });
    } catch (error) {
        console.error('Error formatting time:', error);
        return 'Invalid Time';
    }
};

export const getNextBusinessDay = (): Date => {
    const today = new Date();
    const nextBusinessDay = new Date(today);

    // Get day of week (0 = Sunday, 6 = Saturday)
    const dayOfWeek = today.getDay();

    // Calculate days to add based on current day
    let daysToAdd = 1; // Default: next day

    if (dayOfWeek === 5) { // Friday
        daysToAdd = 3; // Skip to Monday
    } else if (dayOfWeek === 6) { // Saturday
        daysToAdd = 2; // Skip to Monday
    } else if (dayOfWeek === 0) { // Sunday
        daysToAdd = 1; // Skip to Monday
    }

    nextBusinessDay.setDate(today.getDate() + daysToAdd);
    return nextBusinessDay;
};

export const getMinDateForWork = (): string => {
    return getNextBusinessDay().toISOString().split('T')[0];
};

export const getDefaultWorkStartDate = (): string => {
    return getNextBusinessDay().toISOString().split('T')[0];
};

export const toISODateTime = (dateString: string): string => {
    if (!dateString) return '';
    
    try {
        const date = new Date(dateString);
        
        if (isNaN(date.getTime())) {
            return '';
        }
        
        return date.toISOString().slice(0, 16); // Returns YYYY-MM-DDTHH:MM format
    } catch (error) {
        console.error('Error converting to ISO datetime:', error);
        return '';
    }
};

export const toISODate = (dateString: string | Date): string => {
    if (!dateString) return '';
    
    try {
        const date = new Date(dateString);
        
        if (isNaN(date.getTime())) {
            return '';
        }
        
        return date.toISOString().split('T')[0]; // Returns YYYY-MM-DD format
    } catch (error) {
        console.error('Error converting to ISO date:', error);
        return '';
    }
};

export const formatDuration = (duration: string): string => {
    const durationMap = {
        'short-term': 'Short term (0-3 months)',
        'long-term': 'Long term (6+ months)',
        'indefinite': 'Indefinite contract'
    };
    
    return durationMap[duration as keyof typeof durationMap] || duration;
};

export const calculateFreelancerRate = (workRate: number, agencyRate: number): number => {
    return workRate * (100 - agencyRate) / 100;
};