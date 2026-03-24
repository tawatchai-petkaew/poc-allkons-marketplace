export const idCardCheck = (id_card: string) => {
  if (!Number(id_card)) return false;
  if (id_card.substring(0, 1) === '0') return false;
  if (id_card.length !== 13) return false;

  let sum = 0;
  for (let i = 0; i < 12; i++) sum += parseFloat(id_card.charAt(i)) * (13 - i);

  return (11 - (sum % 11)) % 10 === parseFloat(id_card.charAt(12));
};

export const isValidThaiJuristicId = (id: string) => {
  if (!Number(id)) return false;
  if (id.length !== 13) return false;

  let sum = 0;
  for (let i = 0; i < 12; i++) sum += parseFloat(id.charAt(i)) * (13 - i);

  return (11 - (sum % 11)) % 10 === parseFloat(id.charAt(12));
};

export const validateEmail = (email: string): boolean => {
  const emailRegex =
    /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return emailRegex.test(email);
};
