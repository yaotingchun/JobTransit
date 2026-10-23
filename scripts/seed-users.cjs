// Seed script — creates Firebase Auth user for Alex
// Run with: node scripts/seed-users.cjs
'use strict'

const { initializeApp, cert } = require('firebase-admin/app')
const { getAuth } = require('firebase-admin/auth')
const { readFileSync } = require('fs')
const { resolve } = require('path')

const serviceAccount = JSON.parse(
  readFileSync(resolve(__dirname, '../credentials/firebase.json'), 'utf8')
)

initializeApp({ credential: cert(serviceAccount) })

const authInstance = getAuth()

const usersToSeed = [
  {
    displayName: 'Alex',
    email: 'alex@gmail.com',
    password: '123456',
    emailVerified: true,
  },
]

async function seedUsers() {
  for (const user of usersToSeed) {
    try {
      const existing = await authInstance.getUserByEmail(user.email).catch(() => null)
      if (existing) {
        console.log(`✅  User already exists: ${user.email} (uid: ${existing.uid})`)
        continue
      }
      const created = await authInstance.createUser(user)
      console.log(`🎉  Created user: ${created.email}  (uid: ${created.uid})`)
    } catch (err) {
      console.error(`❌  Failed to create ${user.email}:`, err.message)
    }
  }
  console.log('\nDone.')
  process.exit(0)
}

seedUsers()
