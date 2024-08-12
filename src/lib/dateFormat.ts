export function formatTimestamp(timestamp: string) {
	// Create a Date object from the timestamp
	const date = new Date(timestamp);

	// Use Intl.DateTimeFormat to format the date and time
	const formatter = new Intl.DateTimeFormat("en-US", {
		year: "numeric",
		month: "long",
		day: "numeric",
		hour: "numeric",
		minute: "2-digit",
		hour12: true,
		// timeZone: "auto", // This uses the user's system timezone
	});

	return formatter.format(date);
}
