export function formatDate(input: string): string {
  const date = new Date(input);

  const day = ("0" + date.getUTCDate()).slice(-2);
  const month = ("0" + (date.getUTCMonth() + 1)).slice(-2); // Months are zero-based
  const year = date.getUTCFullYear();

  return `${day}-${month}-${year}`;
}
