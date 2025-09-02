import { validate } from 'class-validator';
import { describe, expect, test } from 'vitest';

import { UpdateCarDto } from './cars.dto';

describe('CreateCarDto - TireFormat integration', () => {
  test('should pass validation with valid tire format in DTO', async () => {
    const dto = new UpdateCarDto();
    dto.tires = '205/55 R16 91H';

    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });

  test('should fail validation with invalid tire format in DTO', async () => {
    const dto = new UpdateCarDto();
    dto.tires = 'invalid';

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].constraints).toBeDefined();
  });

  test('should pass validation when tires field is undefined', async () => {
    const dto = new UpdateCarDto();
    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });
});
