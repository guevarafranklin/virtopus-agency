export const formatDateUS = (dateString: string | Date): string => {
    if (!dateString) return 'N/A';
    
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'N/A';
    
    return date.toLocaleDateString('en-US', {
        month: '2-digit',
        day: '2-digit',
        year: 'numeric'
    });
};

export const formatDateTimeUS = (dateString: string | Date): string => {
    if (!dateString) return 'N/A';
    
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'N/A';
    
    return date.toLocaleString('en-US', {
        month: '2-digit',
        day: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
    });
};

// Convert from US format (MM/DD/YYYY) to ISO format for input fields
export const toISODate = (usDateString: string): string => {
    if (!usDateString) return '';
    
    // Handle both MM/DD/YYYY and already ISO format
    if (usDateString.includes('-') && usDateString.length === 10) {
        return usDateString; // Already in ISO format
    }
    
    const [month, day, year] = usDateString.split('/');
    if (!month || !day || !year) return '';
    
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
};

// Convert from ISO format to US format for display
export const fromISODate = (isoDateString: string): string => {
    if (!isoDateString) return '';
    
    const date = new Date(isoDateString);
    if (isNaN(date.getTime())) return '';
    
    return formatDateUS(date);
};

// Convert datetime-local input value to ISO format
export const toISODateTime = (dateTimeString: string): string => {
    if (!dateTimeString) return '';
    
    // If already in ISO format, return as is
    if (dateTimeString.includes('T')) {
        return dateTimeString.slice(0, 16); // Remove seconds if present
    }
    
    const date = new Date(dateTimeString);
    if (isNaN(date.getTime())) return '';
    
    // Format for datetime-local input (YYYY-MM-DDTHH:MM)
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    
    return `${year}-${month}-${day}T${hours}:${minutes}`;
};

// Get min date for date inputs (15 days from today)
export const getMinDateForWork = (): string => {
    const minDate = new Date();
    minDate.setDate(minDate.getDate() + 15);
    return minDate.toISOString().split('T')[0];
};