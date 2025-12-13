export type AgeGroup = 'teen' | 'twenties' | 'thirties' | 'forties' | 'fifties' | 'sixties_plus';

export class RegisterUserDto {
  name!: string;
  nickname!: string;
  ageGroup!: AgeGroup;
  phone!: string;
  email!: string;
  password!: string;
  regionId?: string;
}