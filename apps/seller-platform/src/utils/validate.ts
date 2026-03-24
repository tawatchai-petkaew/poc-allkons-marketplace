export const validateEmail = (email: string): boolean => {
  const emailRegex =
    /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return emailRegex.test(email);
};

export const idCardCheck = (id: string): boolean => {
  if (id.length !== 13) return false;
  let sum = 0;
  for (let i = 0; i < 12; i++) {
    sum += parseFloat(id.charAt(i)) * (13 - i);
  }
  if ((11 - (sum % 11)) % 10 !== parseFloat(id.charAt(12))) return false;
  return true;
};

export const isValidThaiJuristicId = (id: string): boolean => {
  if (id.length !== 13) return false;
  return /^[0-9]+$/.test(id);
};
