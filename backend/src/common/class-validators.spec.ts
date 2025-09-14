import { validate } from 'class-validator';
import { describe, expect, test } from 'vitest';

import { RequireOneOf } from './class-validators';

describe('RequireOneOf', () => {
  @RequireOneOf(['email', 'phone'])
  class ContactDto {
    email?: string;
    phone?: string;
    name?: string;
  }

  test('should pass validation when email is provided', async () => {
    const dto = new ContactDto();
    dto.email = 'test@example.com';
    dto.name = 'John Doe';

    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });

  test('should pass validation when phone is provided', async () => {
    const dto = new ContactDto();
    dto.phone = '+1234567890';
    dto.name = 'John Doe';

    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });

  test('should pass validation when both email and phone are provided', async () => {
    const dto = new ContactDto();
    dto.email = 'test@example.com';
    dto.phone = '+1234567890';
    dto.name = 'John Doe';

    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });

  test('should fail validation when neither email nor phone is provided', async () => {
    const dto = new ContactDto();
    dto.name = 'John Doe';

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
  });

  test('should fail validation when both fields are empty strings', async () => {
    const dto = new ContactDto();
    dto.email = '';
    dto.phone = '';
    dto.name = 'John Doe';

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
  });
});
