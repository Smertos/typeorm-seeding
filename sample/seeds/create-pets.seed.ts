import { Factory, Seeder } from '../../src/types';
import { Pet } from '../entities/Pet.entity';

export default class CreatePets implements Seeder {
  public async run(factory: Factory): Promise<void> {
    await factory(Pet)().create();
  }
}
