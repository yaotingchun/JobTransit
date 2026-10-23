// Seed script — creates Firebase Auth user for Alex
// Run with: node scripts/seed-users.mjs
import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, resolve } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))

// Dynamic import to handle ESM/CJS interop with firebase-admin
const adminModule = await import('firebase-admin')
const admin = adminModule.default ?? adminModule

const serviceAccount = JSON.parse(
  readFileSync(resolve(__dirname, '../credentials/firebase.json'), 'utf8')
)

if (!admin.apps || admin.apps.length === 0) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  })
}

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
      const existing = await admin.auth().getUserByEmail(user.email).catch(() => null)
      if (existing) {
        console.log(`✅  User already exists: ${user.email} (uid: ${existing.uid})`)
        continue
      }

      const created = await admin.auth().createUser(user)
      console.log(`🎉  Created user: ${created.email}  (uid: ${created.uid})`)
    } catch (err) {
      console.error(`❌  Failed to create ${user.email}:`, err.message)
    }
  }

  console.log('\nDone.')
  process.exit(0)
}

seedUsers()
