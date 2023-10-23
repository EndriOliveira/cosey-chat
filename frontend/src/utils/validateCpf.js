const sumFirstDigit = (cpf, position = 0, sum = 0) => {
  if (position > 9) return 0;
  return (
    sum + sumFirstDigit(cpf, position + 1, Number(cpf[position]) * (cpf.length - 1 - position))
  );
};

const sumSecondDigit = (cpf, position = 0, sum = 0) => {
  if (position > 10) return 0;
  return sum + sumSecondDigit(cpf, position + 1, Number(cpf[position]) * (cpf.length - position));
};

const validateFirstDigit = (cpf) => {
  let firstDigit = (Number(sumFirstDigit(cpf)) * 10) % 11;
  firstDigit = firstDigit === 10 || firstDigit === 11 ? 0 : firstDigit;
  if (firstDigit !== Number(cpf[9])) return false;
  return true;
};

const validateSecondDigit = (cpf) => {
  let secondDigit = (Number(sumSecondDigit(cpf)) * 10) % 11;
  secondDigit = secondDigit === 10 || secondDigit === 11 ? 0 : secondDigit;
  if (secondDigit !== Number(cpf[10])) return false;
  return true;
};

const validateCPF = (cpf) => {
  const digits = cpf.replace(/\.|-/g, '');
  if (!/^(?!([0-9])\1{10}$)\d{11}$/.test(digits)) return false;
  if (!validateFirstDigit(digits)) return false;
  if (!validateSecondDigit(digits)) return false;
  return true;
};

export default validateCPF;
