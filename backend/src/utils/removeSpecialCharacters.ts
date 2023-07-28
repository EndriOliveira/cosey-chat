export const removeSpecialCharacters = (data: string): string => {
  if (data.includes('-')) return removeSpecialCharacters(data.replace('-', ''));
  if (data.includes('.')) return removeSpecialCharacters(data.replace('.', ''));
  if (data.includes('/')) return removeSpecialCharacters(data.replace('/', ''));
  if (data.includes(' ')) return removeSpecialCharacters(data.replace(' ', ''));
  return data;
};
