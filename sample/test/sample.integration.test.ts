import {
  useSeeding,
  useRefreshDatabase,
  tearDownDatabase,
  factory,
  setConnectionOptions,
} from '../../src/typeorm-seeding'
import { User } from '../entities/User.entity'
import { DataSource } from 'typeorm'

describe('Sample Integration Test', () => {
  let connection: DataSource;

  beforeAll(async () => {
    setConnectionOptions({
      type: 'sqlite',
      database: ':memory:',
      entities: ['sample/entities/**/*{.ts,.js}'],
      factories: ['sample/factories/**/*{.ts,.js}'],
    })
    connection = await useRefreshDatabase()
    await useSeeding()
  })

  afterAll(async () => {
    await tearDownDatabase()
  })

  test('Should create a user with the entity factory', async () => {
    const createdUser = await factory(User)().create()
    const user = await connection.getRepository(User).findOne({where: {id :createdUser.id}})
    expect(createdUser.firstName).toBe(user.firstName)
  })
})
