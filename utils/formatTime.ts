export const formatTime = (date: Date): string => {
    return new Intl.DateTimeFormat(undefined, {
        year: "numeric",
        month: "long",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
    }).format(date);
};
