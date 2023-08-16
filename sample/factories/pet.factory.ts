import { Faker } from '@faker-js/faker';
import { define, factory } from '../../src/typeorm-seeding';
import { Pet } from '../entities/Pet.entity';
import { User } from '../entities/User.entity';

define(Pet, (faker: Faker) => {
  const gender = faker.datatype.number(1) > 0.5 ? 'male' : 'female';
  const name = faker.name.firstName(gender);

  const pet = new Pet();

  pet.name = name;
  pet.age = faker.datatype.number();
  pet.user = factory(User)({ roles: ['admin'] }) as any;

  return pet;
});
