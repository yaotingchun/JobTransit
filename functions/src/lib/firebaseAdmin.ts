import admin from 'firebase-admin'
import path from 'path'
import fs from 'fs'

let firestoreInstance: admin.firestore.Firestore | null = null

export function getFirestore(): admin.firestore.Firestore | null {
  if (firestoreInstance) return firestoreInstance

  try {
    if (admin.apps.length > 0) {
      firestoreInstance = admin.firestore()
      return firestoreInstance
    }

    // Path to credentials in root credentials/firebase.json
    const credPath = path.resolve(__dirname, '../../../credentials/firebase.json')
    if (fs.existsSync(credPath)) {
      const serviceAccount = JSON.parse(fs.readFileSync(credPath, 'utf8'))
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        projectId: serviceAccount.project_id || 'jobtransit',
      })
      firestoreInstance = admin.firestore()
      firestoreInstance.settings({ ignoreUndefinedProperties: true })
      console.log(`[FirebaseAdmin] Initialized successfully for project "${serviceAccount.project_id}"`)
      return firestoreInstance
    }
  } catch (err) {
    console.warn('[FirebaseAdmin] Could not initialize Firebase Admin SDK:', err)
  }

  return null
}
