export class CreateUserFromExternalDto {
  phoneNumber: string;
  countryCode: string;
  firstName: string;
  middleName?: string | null;
  lastName: string;
  email?: string | null;
  name?: string | null;
  cisNumber?: string | null;
  createdInAuth?: Date | null;
  uuid?: string | null;

  constructor(partial: Partial<CreateUserFromExternalDto>) {
    Object.assign(this, partial);
  }
}
