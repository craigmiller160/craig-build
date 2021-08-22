export const separateGroupAndName = (fullName: string): [string, string] => {
  const nameParts = fullName.split('/');
  const group = nameParts.length === 2 ? nameParts[0].replace(/^@/, '') : '';
  const name = nameParts.length === 2 ? nameParts[1] : nameParts[0];
  return [ group, name ];
};
