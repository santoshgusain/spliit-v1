// MongoDB Seed Script
import { PrismaClient } from '../prisma/mongodb/client'

const mongoPrisma = new PrismaClient()

async function main() {
  console.log('Seeding MongoDB database...')
  
  // Seed categories
  await seedCategories()
  
  console.log('Seeding completed successfully!')
}

async function seedCategories() {
  console.log('Seeding categories...')
  
  // Clear existing categories
  await mongoPrisma.category.deleteMany({})
  
  // Define categories based on the PostgreSQL seed data
  const categories = [
    { grouping: 'Uncategorized', name: 'General' },
    { grouping: 'Uncategorized', name: 'Payment' },
    { grouping: 'Entertainment', name: 'Entertainment' },
    { grouping: 'Entertainment', name: 'Games' },
    { grouping: 'Entertainment', name: 'Movies' },
    { grouping: 'Entertainment', name: 'Music' },
    { grouping: 'Entertainment', name: 'Sports' },
    { grouping: 'Food and Drink', name: 'Food and Drink' },
    { grouping: 'Food and Drink', name: 'Dining Out' },
    { grouping: 'Food and Drink', name: 'Groceries' },
    { grouping: 'Food and Drink', name: 'Liquor' },
    { grouping: 'Home', name: 'Home' },
    { grouping: 'Home', name: 'Electronics' },
    { grouping: 'Home', name: 'Furniture' },
    { grouping: 'Home', name: 'Household Supplies' },
    { grouping: 'Home', name: 'Maintenance' },
    { grouping: 'Home', name: 'Mortgage' },
    { grouping: 'Home', name: 'Pets' },
    { grouping: 'Home', name: 'Rent' },
    { grouping: 'Home', name: 'Services' },
    { grouping: 'Life', name: 'Childcare' },
    { grouping: 'Life', name: 'Clothing' },
    { grouping: 'Life', name: 'Education' },
    { grouping: 'Life', name: 'Gifts' },
    { grouping: 'Life', name: 'Insurance' },
    { grouping: 'Life', name: 'Medical Expenses' },
    { grouping: 'Life', name: 'Taxes' },
    { grouping: 'Transportation', name: 'Transportation' },
    { grouping: 'Transportation', name: 'Bicycle' },
    { grouping: 'Transportation', name: 'Bus/Train' },
    { grouping: 'Transportation', name: 'Car' },
    { grouping: 'Transportation', name: 'Gas/Fuel' },
    { grouping: 'Transportation', name: 'Hotel' },
    { grouping: 'Transportation', name: 'Parking' },
    { grouping: 'Transportation', name: 'Plane' },
    { grouping: 'Transportation', name: 'Taxi' },
    { grouping: 'Utilities', name: 'Utilities' },
    { grouping: 'Utilities', name: 'Cleaning' },
    { grouping: 'Utilities', name: 'Electricity' },
    { grouping: 'Utilities', name: 'Heat/Gas' },
    { grouping: 'Utilities', name: 'Internet' },
    { grouping: 'Utilities', name: 'Phone' },
    { grouping: 'Utilities', name: 'Trash' },
    { grouping: 'Utilities', name: 'TV' },
    { grouping: 'Utilities', name: 'Water' }
  ]
  
  // Insert categories
  for (const category of categories) {
    await mongoPrisma.category.create({
      data: category
    })
  }
  
  console.log(`Seeded ${categories.length} categories`)
}

// Add a seed script for sample groups if needed
async function seedSampleGroups() {
  console.log('Seeding sample groups...')
  
  // Sample group data
  const sampleGroups = [
    {
      name: 'Trip to Paris',
      information: 'Expenses for our Paris trip in October',
      currency: 'EUR',
      participants: [
        { id: 'p1', name: 'Alice' },
        { id: 'p2', name: 'Bob' },
        { id: 'p3', name: 'Charlie' }
      ],
      expenses: [],
      activities: []
    }
  ]
  
  // Insert sample groups
  for (const group of sampleGroups) {
    await mongoPrisma.group.create({
      data: {
        name: group.name,
        information: group.information,
        currency: group.currency,
        participants: group.participants,
        expenses: [],
        activities: []
      }
    })
  }
  
  console.log(`Seeded ${sampleGroups.length} sample groups`)
}

// Execute the main function
main()
  .then(async () => {
    await mongoPrisma.$disconnect()
  })
  .catch(async (e) => {
    console.error('Error seeding database:', e)
    await mongoPrisma.$disconnect()
    process.exit(1)
  })