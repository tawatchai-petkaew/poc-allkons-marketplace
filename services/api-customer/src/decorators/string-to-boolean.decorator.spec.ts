import { StringToBoolean } from './string-to-boolean.decorator';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';

class TestDto {
  @StringToBoolean()
  isActive: boolean;
}

describe('StringToBoolean', () => {
  it('should transform "true" string to boolean true', async () => {
    const dto = plainToInstance(TestDto, { isActive: 'true' });
    expect(dto.isActive).toBe(true);
    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('should transform "false" string to boolean false', async () => {
    const dto = plainToInstance(TestDto, { isActive: 'false' });
    expect(dto.isActive).toBe(false);
    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('should keep boolean true as true', async () => {
    const dto = plainToInstance(TestDto, { isActive: true });
    expect(dto.isActive).toBe(true);
    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('should keep boolean false as false', async () => {
    const dto = plainToInstance(TestDto, { isActive: false });
    expect(dto.isActive).toBe(false);
    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('should not transform other strings', async () => {
    const dto = plainToInstance(TestDto, { isActive: 'other' });
    expect(dto.isActive).toBe('other');
    // Validation should fail because it is not boolean
    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
  });
});
