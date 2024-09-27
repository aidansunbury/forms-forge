// Function to generate a prefixed UUID
export const generatePrefixedUUID = (prefix: string) => {
    const uuid = crypto.randomUUID();
    return `${prefix}_${uuid}`;
};
