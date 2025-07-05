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

export const getMinDateForWork = (): string => {
    const today = new Date();
    const minDate = new Date(today);
    minDate.setDate(today.getDate() + 15); // 15 days from today
    return minDate.toISOString().split('T')[0];
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