import { BadRequestException } from '@nestjs/common';

export const formatPhone = (phone: string) => {
  let regex;
  if (phone.length == 11) regex = /(\d{2})(\d{9})/g;
  if (phone.length == 13) regex = /(\d{2})(\d{2})(\d{9})/g;
  const matches = regex.exec(phone);
  let data = { ddi: null, ddd: null, number: null };

  if (matches.length == 0)
    throw new BadRequestException('Invalid Phone Format');

  if (matches.length == 3) {
    data = {
      ddi: null,
      ddd: matches[1],
      number: matches[2],
    };
  } else if (matches.length == 4) {
    data = {
      ddi: matches[1],
      ddd: matches[2],
      number: matches[3],
    };
  }

  return data;
};
