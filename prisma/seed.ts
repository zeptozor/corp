import { PrismaClient } from '@prisma/client'
import { hash } from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  // Create regulation groups
  const generalGroup = await prisma.regulationGroup.create({
    data: {
      name: 'Общие правила',
      description: 'Общие правила и процедуры компании',
    },
  })

  const hrGroup = await prisma.regulationGroup.create({
    data: {
      name: 'HR политики',
      description: 'Правила, связанные с управлением персоналом',
    },
  })

  // Create regulations
  const codeOfConduct = await prisma.regulation.create({
    data: {
      title: 'Кодекс поведения',
      content: 'Этот кодекс поведения определяет ожидания и обязанности всех сотрудников...',
      keywords: ['поведение', 'этика', 'правила'],
      groupId: generalGroup.id,
    },
  })

  const leavePolicy = await prisma.regulation.create({
    data: {
      title: 'Правила отпуска',
      content: 'Эта политика определяет типы отпусков, доступных сотрудникам, и процедуры их запроса...',
      keywords: ['отпуск', 'выходные', 'отгул'],
      groupId: hrGroup.id,
    },
  })

  // Create positions
  const managerPosition = await prisma.position.create({
    data: {
      title: 'Руководитель отдела',
      description: 'Управляет отделом',
      regulations: {
        connect: [{ id: codeOfConduct.id }, { id: leavePolicy.id }],
      },
    },
  })

  const specialistPosition = await prisma.position.create({
    data: {
      title: 'Специалист',
      description: 'Выполняет специализированные задачи',
      regulations: {
        connect: [{ id: codeOfConduct.id }],
      },
    },
  })

  // Create users with new hierarchy
  const ownerPassword = await hash('owner123', 12)
  const ceoPassword = await hash('ceo123', 12)
  const directorPassword = await hash('director123', 12)
  const leader1Password = await hash('leader1123', 12)
  const leader2Password = await hash('leader2123', 12)
  const memberPassword = await hash('member123', 12)

  // Owner
  await prisma.user.create({
    data: {
      name: 'Владелец Компании',
      email: 'owner@company.com',
      password: ownerPassword,
      role: 'owner',
      birthDate: new Date('1980-01-01'),
      email1: 'owner@gmail.com',
      email2: 'owner@yandex.ru',
      employmentDate: new Date('2020-01-01'),
      photo: 'owner.png',
      telegram: 'owner',
      positions: {
        connect: [{ id: managerPosition.id }],
      },
    },
  })

  // CEO
  await prisma.user.create({
    data: {
      name: 'Генеральный Директор',
      email: 'ceo@company.com',
      password: ceoPassword,
      role: 'ceo',
      birthDate: new Date('1982-02-02'),
      email1: 'ceo@gmail.com',
      email2: 'ceo@yandex.ru',
      employmentDate: new Date('2020-02-01'),
      photo: 'ceo.png',
      telegram: 'ceo',
      positions: {
        connect: [{ id: managerPosition.id }],
      },
    },
  })

  // Director
  await prisma.user.create({
    data: {
      name: 'Директор',
      email: 'director@company.com',
      password: directorPassword,
      role: 'director',
      birthDate: new Date('1985-03-03'),
      email1: 'director@gmail.com',
      email2: 'director@yandex.ru',
      employmentDate: new Date('2020-03-01'),
      photo: 'director.png',
      telegram: 'director',
      positions: {
        connect: [{ id: managerPosition.id }],
      },
    },
  })

  // Group 1 Leader
  await prisma.user.create({
    data: {
      name: 'Руководитель Группы 1',
      email: 'leader1@company.com',
      password: leader1Password,
      role: 'groupLeader',
      groupNumber: 1,
      birthDate: new Date('1988-04-04'),
      email1: 'leader1@gmail.com',
      email2: 'leader1@yandex.ru',
      employmentDate: new Date('2021-01-01'),
      photo: 'leader1.png',
      telegram: 'leader1',
      positions: {
        connect: [{ id: managerPosition.id }],
      },
    },
  })

  // Group 2 Leader
  await prisma.user.create({
    data: {
      name: 'Руководитель Группы 2',
      email: 'leader2@company.com',
      password: leader2Password,
      role: 'groupLeader',
      groupNumber: 2,
      birthDate: new Date('1988-05-05'),
      email1: 'leader2@gmail.com',
      email2: 'leader2@yandex.ru',
      employmentDate: new Date('2021-02-01'),
      photo: 'leader2.png',
      telegram: 'leader2',
      positions: {
        connect: [{ id: managerPosition.id }],
      },
    },
  })

  // Create members for Group 1
  for (let i = 1; i <= 3; i++) {
    await prisma.user.create({
      data: {
        name: `Сотрудник ${i} Группы 1`,
        email: `member${i}g1@company.com`,
        password: memberPassword,
        role: 'member',
        groupNumber: 1,
        birthDate: new Date(`1990-${i}-01`),
        email1: `member${i}g1@gmail.com`,
        email2: `member${i}g1@yandex.ru`,
        employmentDate: new Date(`2022-${i}-01`),
        photo: `member${i}g1.png`,
        telegram: `member${i}g1`,
        positions: {
          connect: [{ id: specialistPosition.id }],
        },
      },
    })
  }

  // Create members for Group 2
  for (let i = 1; i <= 3; i++) {
    await prisma.user.create({
      data: {
        name: `Сотрудник ${i} Группы 2`,
        email: `member${i}g2@company.com`,
        password: memberPassword,
        role: 'member',
        groupNumber: 2,
        birthDate: new Date(`1990-${i}-01`),
        email1: `member${i}g2@gmail.com`,
        email2: `member${i}g2@yandex.ru`,
        employmentDate: new Date(`2022-${i}-01`),
        photo: `member${i}g2.png`,
        telegram: `member${i}g2`,
        positions: {
          connect: [{ id: specialistPosition.id }],
        },
      },
    })
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
