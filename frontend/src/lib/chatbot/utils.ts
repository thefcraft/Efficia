// Function to categorize timestamp
export type ICategorizeTimestamp = (
    "Yesterday" | "Previous 7 Days" | "Previous 30 Days" | "January" | "February" | "March" | "April" | "May" | "June" | "July" | 
    "August" | "September" | "October" | "November" | "December" | string
);
export function categorizeTimestamp(timestampStr: string): string {
    const now = new Date();
    const timestamp = new Date(timestampStr);

    // Check if the timestamp is from yesterday
    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    yesterday.setHours(0, 0, 0, 0);  // Set the time to midnight to check the entire day
    const tomorrow = new Date(yesterday);
    tomorrow.setDate(yesterday.getDate() + 1);  // Set to the beginning of the next day

    if (timestamp >= yesterday && timestamp < tomorrow) {
        return "Yesterday";
    }

    // Check if the timestamp is within the previous 7 days
    const sevenDaysAgo = new Date(now);
    sevenDaysAgo.setDate(now.getDate() - 7);
    if (timestamp >= sevenDaysAgo && timestamp <= now) {
        return "Previous 7 Days";
    }

    // Check if the timestamp is within the previous 30 days
    const thirtyDaysAgo = new Date(now);
    thirtyDaysAgo.setDate(now.getDate() - 30);
    if (timestamp >= thirtyDaysAgo && timestamp <= now) {
        return "Previous 30 Days";
    }

    // Check if the timestamp is from the current year and return month names
    if (timestamp.getFullYear() === now.getFullYear()) {
        switch (timestamp.getMonth()) {
            case 0: return "January";
            case 1: return "February";
            case 2: return "March";
            case 3: return "April";
            case 4: return "May";
            case 5: return "June";
            case 6: return "July";
            case 7: return "August";
            case 8: return "September";
            case 9: return "October";
            case 10: return "November";
            case 11: return "December";
        }
    }

    // If the timestamp is from a different year, return the year
    return timestamp.getFullYear().toString();
}