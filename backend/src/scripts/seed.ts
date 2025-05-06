/**
 * Seed script to populate the database with initial data
 *
 * This script adds fitness class categories to the database
 * Run with: npm run seed (after adding the script to package.json)
 */

import prisma from '../config/db'
import bcrypt from 'bcrypt'
import { UserRole } from '@prisma/client'

async function seed() {
  console.log('🌱 Starting database seeding...')

  // Clear existing data
  console.log('Clearing existing data...')
  await prisma.fitnessClassBooking.deleteMany({})
  await prisma.fitnessClass.deleteMany({})
  await prisma.fitnessClassCategory.deleteMany({})
  await prisma.gym.deleteMany({})
  await prisma.user.deleteMany({})

  // Create users
  console.log('Creating users...')
  const passwordHash = await bcrypt.hash('Password123!', 10)

  const admin = await prisma.user.create({
    data: {
      name: 'Admin User',
      email: 'admin@example.com',
      password: passwordHash,
      role: UserRole.ADMIN,
    },
  })
  console.log(`Created admin user with ID: ${admin.id}`)

  const instructor1 = await prisma.user.create({
    data: {
      name: 'John Trainer',
      email: 'instructor1@example.com',
      password: passwordHash,
      role: UserRole.INSTRUCTOR,
      mobile: '555-123-4567',
    },
  })
  console.log(`Created instructor user with ID: ${instructor1.id}`)

  const instructor2 = await prisma.user.create({
    data: {
      name: 'Sarah Coach',
      email: 'instructor2@example.com',
      password: passwordHash,
      role: UserRole.INSTRUCTOR,
      mobile: '555-987-6543',
    },
  })
  console.log(`Created instructor user with ID: ${instructor2.id}`)

  const user1 = await prisma.user.create({
    data: {
      name: 'Regular User',
      email: 'user@example.com',
      password: passwordHash,
      role: UserRole.USER,
    },
  })
  console.log(`Created regular user with ID: ${user1.id}`)

  // Create gym owner
  const gymOwner = await prisma.user.create({
    data: {
      name: 'Gym Owner',
      email: 'gym.owner@example.com',
      password: passwordHash,
      role: UserRole.USER,
      mobile: '555-111-2222',
    },
  })
  console.log(`Created gym owner with ID: ${gymOwner.id}`)

  // Create fitness class categories
  console.log('Creating fitness class categories...')
  const yogaCategory = await prisma.fitnessClassCategory.create({
    data: {
      name: 'Yoga',
      description: 'Relaxing yoga classes for all levels',
    },
  })
  console.log(`Created category: ${yogaCategory.name}`)

  const cardioCategory = await prisma.fitnessClassCategory.create({
    data: {
      name: 'Cardio',
      description: 'High-intensity cardio workouts',
    },
  })
  console.log(`Created category: ${cardioCategory.name}`)

  const strengthCategory = await prisma.fitnessClassCategory.create({
    data: {
      name: 'Strength Training',
      description: 'Build muscle and strength',
    },
  })
  console.log(`Created category: ${strengthCategory.name}`)

  // Create gyms
  console.log('Creating gyms...')
  const gym1 = await prisma.gym.create({
    data: {
      name: 'Fitness Center Downtown',
      address: '123 Main Street, Downtown',
      ownerId: gymOwner.id,
    },
  })
  console.log(`Created gym: ${gym1.name}`)

  const gym2 = await prisma.gym.create({
    data: {
      name: 'Elite Gym & Spa',
      address: '456 Park Avenue, Uptown',
      ownerId: gymOwner.id,
    },
  })
  console.log(`Created gym: ${gym2.name}`)

  // Create some fitness classes
  console.log('Creating fitness classes...')

  // Tomorrow at 10:00 AM
  const tomorrow10AM = new Date()
  tomorrow10AM.setDate(tomorrow10AM.getDate() + 1)
  tomorrow10AM.setHours(10, 0, 0, 0)

  // Tomorrow at 11:30 AM
  const tomorrow11_30AM = new Date(tomorrow10AM)
  tomorrow11_30AM.setHours(11, 30, 0, 0)

  // Tomorrow at 2:00 PM
  const tomorrow2PM = new Date(tomorrow10AM)
  tomorrow2PM.setHours(14, 0, 0, 0)

  // Tomorrow at 3:30 PM
  const tomorrow3_30PM = new Date(tomorrow10AM)
  tomorrow3_30PM.setHours(15, 30, 0, 0)

  // Day after tomorrow at 9:00 AM
  const dayAfterTomorrow9AM = new Date(tomorrow10AM)
  dayAfterTomorrow9AM.setDate(dayAfterTomorrow9AM.getDate() + 1)
  dayAfterTomorrow9AM.setHours(9, 0, 0, 0)

  // Day after tomorrow at 10:30 AM
  const dayAfterTomorrow10_30AM = new Date(dayAfterTomorrow9AM)
  dayAfterTomorrow10_30AM.setHours(10, 30, 0, 0)

  // Yoga class in gym1
  const yogaClass = await prisma.fitnessClass.create({
    data: {
      name: 'Morning Yoga Flow',
      categoryId: yogaCategory.id,
      instructorId: instructor1.id,
      gymId: gym1.id,
      startsAt: tomorrow10AM,
      endsAt: tomorrow11_30AM,
    },
  })
  console.log(`Created class: ${yogaClass.name} at ${gym1.name}`)

  // Cardio class in gym1
  const cardioClass = await prisma.fitnessClass.create({
    data: {
      name: 'High Intensity Cardio',
      categoryId: cardioCategory.id,
      instructorId: instructor2.id,
      gymId: gym1.id,
      startsAt: tomorrow2PM,
      endsAt: tomorrow3_30PM,
    },
  })
  console.log(`Created class: ${cardioClass.name} at ${gym1.name}`)

  // Strength class in gym2
  const strengthClass = await prisma.fitnessClass.create({
    data: {
      name: 'Power Lifting Basics',
      categoryId: strengthCategory.id,
      instructorId: instructor2.id,
      gymId: gym2.id,
      startsAt: dayAfterTomorrow9AM,
      endsAt: dayAfterTomorrow10_30AM,
      capacity: 15,
    },
  })
  console.log(`Created class: ${strengthClass.name} at ${gym2.name}`)

  console.log('✅ Database seeding completed!')
  console.log(`
Created accounts:
- Admin: admin@example.com / Password123!
- Instructor 1: instructor1@example.com / Password123!
- Instructor 2: instructor2@example.com / Password123!
- User: user@example.com / Password123!
- Gym Owner: gym.owner@example.com / Password123!

Created gyms:
- Fitness Center Downtown (ID: ${gym1.id})
- Elite Gym & Spa (ID: ${gym2.id})
  `)
}

// Run the seed function
seed()
  .catch((error) => {
    console.error('Error during seeding:', error)
    process.exit(1)
  })
  .finally(async () => {
    // Close Prisma client connection
    await prisma.$disconnect()
  })
