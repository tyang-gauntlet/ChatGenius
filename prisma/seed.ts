import { PrismaClient } from '@prisma/client'
import { hash } from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  // Create test users
  const testUsers = [
    {
      username: 'johndoe',
      email: 'john@example.com',
      password: 'Password123'
    },
    {
      username: 'janedoe',
      email: 'jane@example.com',
      password: 'Password123'
    },
    {
      username: 'testuser',
      email: 'test@example.com',
      password: 'Password123'
    }
  ]

  console.log('Starting to seed users...')

  for (const user of testUsers) {
    const hashedPassword = await hash(user.password, 12)
    const createdUser = await prisma.user.upsert({
      where: { email: user.email },
      update: {},
      create: {
        email: user.email,
        username: user.username,
        password: hashedPassword,
      },
    })
    console.log(`Created user: ${createdUser.email}`)
  }

  console.log('Seed data created successfully')
}

main()
  .catch((e) => {
    console.error('Error while seeding:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  }) 