import {
  doc,
  getDoc,
  setDoc,
  onSnapshot,
  type Unsubscribe,
} from 'firebase/firestore'
import { signInWithEmailAndPassword } from 'firebase/auth'
import { db, auth } from './firebase'
import { DEFAULT_PASS_DATA, type CardPassData } from '../components/transit/types'
import type { UserProfile } from '../components/Navbar'

/**
 * Generate a unique, deterministic license number for each user based on their UID.
 * Format: 4-digit string (e.g. '4821', '8192')
 */
export function generateUniqueLicenseNumber(uid: string): string {
  if (!uid) return '1001'
  let hash = 0
  for (let i = 0; i < uid.length; i++) {
    hash = (hash * 31 + uid.charCodeAt(i)) >>> 0
  }
  const num = (hash % 9000) + 1000
  return String(num).padStart(4, '0')
}

/**
 * Generate a unique Pass ID for each user
 * Format: 'JT-XXXX-####' (e.g., 'JT-7TM2-4821')
 */
export function generateUniquePassId(uid: string, licenseNumber: string): string {
  const prefix = (uid || 'USER').replace(/[^a-zA-Z0-9]/g, '').slice(0, 4).toUpperCase().padEnd(4, 'X')
  return `JT-${prefix}-${licenseNumber}`
}

/**
 * Map user profile information directly to CardPassData.
 * Ensures the card information matches the profile information.
 */
export function profileToCardData(
  profile: any,
  uid: string,
  fallbackUser?: UserProfile
): CardPassData {
  const licenseNumber =
    profile?.licenseNumber ||
    profile?.card?.licenseNumber ||
    generateUniqueLicenseNumber(uid)

  const passId =
    profile?.pass_id ||
    profile?.card?.passId ||
    generateUniquePassId(uid, licenseNumber)

  const fullName =
    profile?.personal?.full_name ||
    profile?.holderName ||
    fallbackUser?.name ||
    'Alex'

  const firstName = fullName.trim().split(' ')[0].toUpperCase()

  const occupation = (
    profile?.personal?.current_job_title ||
    profile?.occupation ||
    (profile?.personal?.current_employment_status === 'student'
      ? 'STUDENT'
      : profile?.personal?.current_employment_status === 'unemployed'
      ? 'CAREER SEEKER'
      : 'PROFESSIONAL')
  ).toUpperCase()

  const roleTitle =
    profile?.personal?.current_job_title ||
    profile?.roleTitle ||
    profile?.career_preferences?.target_job_roles?.[0] ||
    'Career Navigator'

  const roleBadge = (
    profile?.roleBadge ||
    profile?.personal?.current_job_title ||
    profile?.career_preferences?.target_job_roles?.[0] ||
    'CAREER TRANSIT USER'
  ).toUpperCase()

  const industry =
    profile?.personal?.industry ||
    profile?.industry ||
    profile?.career_preferences?.preferred_industries?.[0] ||
    'Technology & Career'

  const expertise = (
    profile?.expertise ||
    profile?.personal?.industry ||
    profile?.career_preferences?.career_interests?.[0] ||
    roleTitle
  ).toUpperCase()

  // Extract nationality / location from profile
  let nationality = 'MALAYSIA'
  const loc = profile?.personal?.location || profile?.nationality
  if (loc) {
    const parts = loc.split(',')
    nationality = parts[parts.length - 1].trim().toUpperCase()
  }

  // Derive D.O.B from graduation year if available
  let dob = profile?.dob || '15/09/2000'
  if (!profile?.dob && profile?.education?.graduation_year) {
    const birthYear = Number(profile.education.graduation_year) - 22
    dob = `15/09/${birthYear > 1950 && birthYear < 2015 ? birthYear : 2000}`
  }

  // Aggregate real skills from profile safely (skills can be SkillsProfile object or array)
  const profileSkills: string[] = [
    ...(Array.isArray(profile?.skills?.technical_skills) ? profile.skills.technical_skills : []),
    ...(Array.isArray(profile?.skills?.ai_skills) ? profile.skills.ai_skills : []),
    ...(Array.isArray(profile?.skills?.tools_and_technologies) ? profile.skills.tools_and_technologies : []),
    ...(Array.isArray(profile?.skills?.soft_skills) ? profile.skills.soft_skills : []),
    ...(Array.isArray(profile?.skills?.other_skills) ? profile.skills.other_skills : []),
    ...(Array.isArray(profile?.skills) ? profile.skills : []),
  ].filter(Boolean)

  const skills = profileSkills.length > 0
    ? Array.from(new Set(profileSkills)).slice(0, 8)
    : [
        'Career Strategy',
        'Problem Solving',
        'System Architecture',
        'Collaboration',
        'Tech Innovation',
      ]

  const softwareList =
    Array.isArray(profile?.skills?.tools_and_technologies) && profile.skills.tools_and_technologies.length > 0
      ? profile.skills.tools_and_technologies.slice(0, 5)
      : Array.isArray(profile?.softwareList) && profile.softwareList.length > 0
      ? profile.softwareList
      : skills.slice(0, 5)

  const phone = profile?.personal?.phone_number || profile?.phone || ''
  const email = profile?.personal?.email || profile?.email || fallbackUser?.email || ''
  const instagram = profile?.instagram || `@${fullName.toLowerCase().replace(/[^a-z0-9]/g, '_')}`
  const github = profile?.personal?.github_url || profile?.github || ''
  const linkedin = profile?.personal?.linkedin_url || profile?.linkedin || ''

  return {
    ...DEFAULT_PASS_DATA,
    passId,
    licenseNumber,
    holderName: fullName,
    firstName,
    occupation,
    roleTitle,
    roleBadge,
    industry,
    expertise,
    nationality,
    dob,
    email,
    phone,
    instagram,
    github,
    linkedin,
    skills,
    softwareList,
    photoUrl: profile?.photoUrl || '',
    tier: 'Transit Pass ID-1',
    routeLine: `${industry} • ${roleTitle}`,
    subBadgeTitle: profile?.career_preferences?.preferred_work_mode
      ? `${String(profile.career_preferences.preferred_work_mode).toUpperCase()} TRANSIT 🌐`
      : 'CAREER PASS 🌐',
    subBadgeSub: profile?.education?.institution_name || 'JobTransit Verified',
    serialNumber: passId,
    stationsUnlocked: `${skills.length} Skills Verified`,
  }
}

/**
 * Ensure user is authenticated with Firebase Auth.
 * If not already signed in, signs in to the pre-seeded demo user (alex@gmail.com).
 */
export async function ensureFirebaseAuth(): Promise<string> {
  if (auth.currentUser) {
    return auth.currentUser.uid
  }

  try {
    const cred = await signInWithEmailAndPassword(auth, 'alex@gmail.com', '123456')
    return cred.user.uid
  } catch (err) {
    console.warn('Firebase auto-auth warning:', err)
    return (auth as any).currentUser?.uid ?? '7tm22YRiXNbWaqTeJcTAgXtM6Um2'
  }
}

/**
 * Save complete card data to Cloud Firestore
 */
export async function saveCardDataToFirebase(
  uid: string,
  cardData: CardPassData
): Promise<void> {
  try {
    const cardRef = doc(db, 'users', uid, 'card', 'main')
    const cleanData = JSON.parse(JSON.stringify(cardData))
    await setDoc(cardRef, {
      ...cleanData,
      updated_at: new Date().toISOString(),
    })

    // Also update local storage as instant offline cache
    try {
      localStorage.setItem(`jobtransit_card_${uid}`, JSON.stringify(cleanData))
    } catch {
      // ignore
    }
  } catch (error) {
    console.error('Failed to save card data to Firebase:', error)
    throw error
  }
}

/**
 * Fetch card data from Firebase Firestore.
 * Automatically synchronizes with the user's profile information so the card information
 * matches the profile information.
 */
export async function getCardDataFromFirebase(
  uid: string,
  fallbackUser?: UserProfile
): Promise<CardPassData | null> {
  try {
    // 1. Fetch user profile from Firestore users/{uid}/profile/main
    let profileData: any = null
    try {
      const profileRef = doc(db, 'users', uid, 'profile', 'main')
      const profileSnap = await getDoc(profileRef)
      if (profileSnap.exists()) {
        profileData = profileSnap.data()
      }
    } catch (e) {
      console.warn('Could not read profile from Firestore:', e)
    }

    // Fallback profile from local storage if not found in Firestore
    if (!profileData) {
      try {
        const savedProfile = localStorage.getItem(`jobtransit_profile_${uid}`)
        if (savedProfile) {
          profileData = JSON.parse(savedProfile)
        }
      } catch {
        // ignore
      }
    }

    // 2. Fetch existing card document from Firestore users/{uid}/card/main
    let cardDocData: any = null
    try {
      const cardRef = doc(db, 'users', uid, 'card', 'main')
      const cardSnap = await getDoc(cardRef)
      if (cardSnap.exists()) {
        cardDocData = cardSnap.data()
      }
    } catch (e) {
      console.warn('Could not read card from Firestore:', e)
    }

    // 3. Construct unified card data matching the profile information
    const baseSource = profileData ? { ...profileData, ...(cardDocData || {}) } : (cardDocData || {})
    const unifiedCard = profileToCardData(baseSource, uid, fallbackUser)

    // Ensure unique license number for every user
    if (!unifiedCard.licenseNumber || unifiedCard.licenseNumber === '0051') {
      unifiedCard.licenseNumber = generateUniqueLicenseNumber(uid)
      unifiedCard.passId = generateUniquePassId(uid, unifiedCard.licenseNumber)
      unifiedCard.serialNumber = unifiedCard.passId
    }

    return unifiedCard
  } catch (error) {
    console.warn('Could not fetch card from Firestore:', error)
  }

  // Fallback to local storage if available
  try {
    const saved = localStorage.getItem(`jobtransit_card_${uid}`)
    if (saved) return JSON.parse(saved)
  } catch {
    // ignore
  }

  return profileToCardData({}, uid, fallbackUser)
}

/**
 * Subscribe to real-time changes of card data in Firebase Firestore
 */
export function subscribeCardDataFromFirebase(
  uid: string,
  callback: (data: CardPassData) => void,
  fallbackUser?: UserProfile
): Unsubscribe {
  const cardRef = doc(db, 'users', uid, 'card', 'main')
  return onSnapshot(
    cardRef,
    (snap) => {
      if (snap.exists()) {
        const snapData = snap.data()
        const mapped = profileToCardData(snapData, uid, fallbackUser)
        callback(mapped)
      }
    },
    (err) => {
      console.warn('Realtime card listener warning:', err)
    }
  )
}
