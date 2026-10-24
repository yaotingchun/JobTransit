import {
  doc,
  getDoc,
  setDoc,
  onSnapshot,
  type Unsubscribe,
} from 'firebase/firestore'
import { db } from './firebase'
import { DEFAULT_PASS_DATA, type CardPassData } from '../components/transit/types'
import type { UserProfile } from '../components/Navbar'

export const DEMO_UID = '7tm22YRiXNbWaqTeJcTAgXtM6Um2'
export const DEMO_USER: UserProfile = {
  name: 'Alex Chen',
  email: 'alex@gmail.com',
}

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
    'Alexander Mercer'

  const firstName = fullName.trim().split(' ')[0].toUpperCase()

  const occupation = (
    profile?.personal?.current_job_title ||
    profile?.work_experience?.[0]?.job_title ||
    profile?.career_preferences?.target_job_roles?.[0] ||
    profile?.occupation ||
    (profile?.personal?.current_employment_status === 'student'
      ? 'STUDENT'
      : profile?.personal?.current_employment_status === 'unemployed'
      ? 'CAREER SEEKER'
      : 'SOFTWARE ENGINEER')
  ).toUpperCase()

  const roleTitle =
    profile?.career_preferences?.target_job_roles?.[0] ||
    profile?.personal?.current_job_title ||
    profile?.work_experience?.[0]?.job_title ||
    profile?.roleTitle ||
    occupation

  const roleBadge = (
    profile?.career_preferences?.target_job_roles?.[0] ||
    profile?.personal?.current_job_title ||
    profile?.work_experience?.[0]?.job_title ||
    profile?.roleBadge ||
    occupation
  ).toUpperCase()

  const industry =
    profile?.career_preferences?.preferred_industries?.[0] ||
    profile?.personal?.industry ||
    profile?.industry ||
    'Technology & Computing'

  // Extract primary domain of expertise directly from CV skills or career interests
  const topTech = Array.isArray(profile?.skills?.technical_skills) && profile.skills.technical_skills.length > 0
    ? profile.skills.technical_skills.slice(0, 2).join(' & ')
    : null

  const expertise = (
    profile?.expertise ||
    profile?.career_preferences?.career_interests?.[0] ||
    topTech ||
    roleTitle
  ).toUpperCase()

  // Extract nationality / location accurately from CV profile & raw CV text
  let nationality = profile?.nationality || ''
  const cvText = profile?.cv_raw_text || profile?.rawText || ''
  if (!nationality && cvText) {
    const natMatch = cvText.match(/(?:nationality|citizenship)\s*[:\-]?\s*([A-Za-z\s]{3,30})/i)
    if (natMatch && natMatch[1]) {
      const rawNat = natMatch[1].trim().toLowerCase()
      if (rawNat.includes('malaysi')) nationality = 'MALAYSIA'
      else if (rawNat.includes('singapor')) nationality = 'SINGAPORE'
      else if (rawNat.includes('taiwan')) nationality = 'TAIWAN'
      else if (rawNat.includes('indonesi')) nationality = 'INDONESIA'
      else if (rawNat.includes('chin')) nationality = 'CHINA'
      else if (rawNat.includes('vietnam')) nationality = 'VIETNAM'
      else if (rawNat.includes('japan')) nationality = 'JAPAN'
      else if (rawNat.includes('korea')) nationality = 'KOREA'
      else if (rawNat.includes('american') || rawNat.includes('united states') || rawNat.includes('usa')) nationality = 'UNITED STATES'
      else if (rawNat.includes('british') || rawNat.includes('uk')) nationality = 'UNITED KINGDOM'
      else if (rawNat.includes('australi')) nationality = 'AUSTRALIA'
      else if (rawNat.includes('canad')) nationality = 'CANADA'
      else nationality = rawNat.toUpperCase()
    }
  }
  const loc = profile?.personal?.location || ''
  if (!nationality && loc) {
    const parts = loc.split(',')
    const lastPart = parts[parts.length - 1].trim().toUpperCase()
    if (lastPart.includes('MALAYSIA') || lastPart.includes('JOHOR') || lastPart.includes('KUALA LUMPUR')) nationality = 'MALAYSIA'
    else if (lastPart.includes('TAIPEI') || lastPart.includes('TAIWAN')) nationality = 'TAIWAN'
    else if (lastPart.includes('SINGAPORE')) nationality = 'SINGAPORE'
    else nationality = lastPart
  }
  if (!nationality) {
    nationality = 'MALAYSIA'
  }

  // Derive D.O.B from CV raw text or graduation year
  let dob = profile?.dob || profile?.personal?.dob || ''
  if (!dob && cvText) {
    const dobMatch = cvText.match(/(?:date\s*of\s*birth|d\.?o\.?b\.?|birth\s*date|birthday|born)\s*[:\-]?\s*(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4}|\d{4}[\/\-\.]\d{1,2}[\/\-\.]\d{1,2})/i)
    if (dobMatch && dobMatch[1]) {
      const parts = dobMatch[1].trim().split(/[\/\-\.]/)
      if (parts.length === 3) {
        if (parts[0].length === 4) {
          dob = `${parts[2].padStart(2, '0')}/${parts[1].padStart(2, '0')}/${parts[0]}`
        } else {
          const yr = parts[2].length === 2 ? `20${parts[2]}` : parts[2]
          dob = `${parts[0].padStart(2, '0')}/${parts[1].padStart(2, '0')}/${yr}`
        }
      }
    }
  }
  if (!dob && profile?.education?.graduation_year) {
    const gradYear = Number(profile.education.graduation_year)
    if (!isNaN(gradYear) && gradYear > 1960) {
      const birthYear = gradYear - 22
      dob = `15/09/${birthYear > 1950 && birthYear <= new Date().getFullYear() ? birthYear : 2002}`
    }
  }
  if (!dob) dob = '15/09/2002'

  // Aggregate real skills from profile safely (skills can be SkillsProfile object or array)
  const profileSkills: string[] = [
    ...(Array.isArray(profile?.skills?.technical_skills) ? profile.skills.technical_skills : []),
    ...(Array.isArray(profile?.skills?.tools_and_technologies) ? profile.skills.tools_and_technologies : []),
    ...(Array.isArray(profile?.skills?.ai_skills) ? profile.skills.ai_skills : []),
    ...(Array.isArray(profile?.skills?.soft_skills) ? profile.skills.soft_skills : []),
    ...(Array.isArray(profile?.skills?.other_skills) ? profile.skills.other_skills : []),
    ...(Array.isArray(profile?.skills) ? profile.skills : []),
  ].filter(Boolean)

  const skills = profileSkills.length > 0
    ? Array.from(new Set(profileSkills)).slice(0, 8)
    : [
        'System Architecture',
        'Problem Solving',
        'Technical Execution',
        'Strategic Planning',
        'Collaboration',
      ]

  const softwareList =
    Array.isArray(profile?.skills?.tools_and_technologies) && profile.skills.tools_and_technologies.length > 0
      ? profile.skills.tools_and_technologies.slice(0, 6)
      : Array.isArray(profile?.softwareList) && profile.softwareList.length > 0
      ? profile.softwareList
      : skills.slice(0, 6)

  const phone = profile?.personal?.phone_number || profile?.phone || ''
  const email = profile?.personal?.email || profile?.email || fallbackUser?.email || ''
  const instagram = profile?.instagram || `@${fullName.toLowerCase().replace(/[^a-z0-9]/g, '_')}`
  const github = profile?.personal?.github_url || profile?.github || ''
  const linkedin = profile?.personal?.linkedin_url || profile?.linkedin || ''

  // Compute realistic match scores based on extracted CV richness
  const skillCount = profileSkills.length
  const expYears = Number(profile?.personal?.years_of_experience) || 0
  const matchScore = Math.min(99, Math.max(78, 76 + Math.min(18, skillCount * 2) + Math.min(5, Math.round(expYears * 2))))

  const targetRoles = profile?.career_preferences?.target_job_roles || []
  const prefIndustries = profile?.career_preferences?.preferred_industries || []
  const careerPrefScore = Math.min(
    99,
    Math.max(82, 82 + Math.min(10, targetRoles.length * 3) + Math.min(6, prefIndustries.length * 2))
  )

  const hasAiSkills = Array.isArray(profile?.skills?.ai_skills) && profile.skills.ai_skills.length > 0
  const aiMarketScore = Math.min(
    98,
    Math.max(86, 88 + (hasAiSkills ? 6 : 2) + Math.min(4, Math.round(skillCount / 3)))
  )

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
    matchScore,
    careerPrefScore,
    aiMarketScore,
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
 * Authentication has been removed: returns the shared demo account UID directly.
 */
export async function ensureFirebaseAuth(): Promise<string> {
  return DEMO_UID
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
