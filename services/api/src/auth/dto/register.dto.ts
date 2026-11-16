export class RegisterDto {
  fullName!: string;
  email!: string;
  password!: string;
  confirmPassword!: string;
  phoneNumber?: string;
  phone?: string;
  acceptTerms!: boolean;
  acceptedTerms?: boolean;
}
