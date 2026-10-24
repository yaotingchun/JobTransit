import React, { useState, useEffect, useCallback, useMemo } from 'react'
import type {
  FollowUpQuestion,
  QuestionId,
  SessionProgress,
  SessionStatus,
} from '../../types/followUpQuestion'
import type { CareerProfile } from '../../types/careerProfile'
import { followUpApi } from '../../client/followUpApi'
import { MachineShell } from './MachineShell'
import { QuestionPanel } from './QuestionPanel'
import { MockProfileSelector, type CustomProfileInfo } from './MockProfileSelector'
import { ProfileConfirmation } from './ProfileConfirmation'
import { CompletionState } from './CompletionState'
import { LoadingState, ErrorState } from './LoadingState'
import { Navbar, type UserProfile, type NavTab } from '../Navbar'

interface FollowUpPageProps {
  currentUser?: UserProfile | null
  onLogout?: () => void
  onNavigateTab?: (tab: NavTab) => void
  initialMockProfileId?: string
  extractedProfile?: CareerProfile | Partial<CareerProfile> | null
  initialProfile?: CareerProfile | Partial<CareerProfile> | null
}

export const FollowUpPage: React.FC<FollowUpPageProps> = ({
  currentUser = { name: 'Explorer', email: 'explorer@jobtransit.io' },
  onLogout = () => {},
  onNavigateTab,
  initialMockProfileId = 'student_cs',
  extractedProfile = null,
  initialProfile = null,
}) => {
  // Check for extracted CV profile from props or browser session/local storage
  const detectedExtractedProfile = useMemo<Partial<CareerProfile> | null>(() => {
    if (extractedProfile) return extractedProfile
    if (initialProfile) return initialProfile

    if (typeof window !== 'undefined') {
      try {
        const stored =
          sessionStorage.getItem('jobtransit_extracted_cv') ||
          localStorage.getItem('jobtransit_extracted_cv') ||
          sessionStorage.getItem('jobtransit_cv_profile') ||
          localStorage.getItem('jobtransit_cv_profile')
        if (stored) {
          const parsed = JSON.parse(stored)
          if (parsed && typeof parsed === 'object') {
            return parsed
          }
        }
      } catch (e) {
        console.warn('Could not read stored CV extractor profile', e)
      }
    }
    return null
  }, [extractedProfile, initialProfile])

  const [customExtractedProfile] = useState<Partial<CareerProfile> | null>(detectedExtractedProfile)
  const [selectedProfileId, setSelectedProfileId] = useState<string>(() => {
    if (detectedExtractedProfile) return 'extracted_cv'
    return initialMockProfileId
  })

  const [sessionId, setSessionId] = useState<string | null>(null)
  const [status, setStatus] = useState<SessionStatus>('in_progress')
  const [currentQuestion, setCurrentQuestion] = useState<FollowUpQuestion | null>(null)
  const [profile, setProfile] = useState<CareerProfile | null>(null)
  const [progress, setProgress] = useState<SessionProgress | null>(null)
  const [selectedOptionIds, setSelectedOptionIds] = useState<string[]>([])
  const [questionHistory, setQuestionHistory] = useState<QuestionId[]>([])
  const [historyIndex, setHistoryIndex] = useState<number>(-1)
  const [slideDirection, setSlideDirection] = useState<'forward' | 'backward'>('forward')

  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [validationError, setValidationError] = useState<string | null>(null)

  useEffect(() => {
    let active = true

    const loadSession = async () => {
      try {
        let startReq
        if (selectedProfileId === 'extracted_cv' && customExtractedProfile) {
          startReq = {
            initialProfile: customExtractedProfile,
            source: 'cv_extractor' as const,
          }
        } else {
          startReq = {
            mockProfileId: selectedProfileId,
            source: 'mock' as const,
          }
        }

        const startRes = await followUpApi.startSession(startReq)
        if (!active) return
        setSessionId(startRes.sessionId)
        setStatus(startRes.status)
        setCurrentQuestion(startRes.currentQuestion)
        setProfile(startRes.profileSummary)
        setProgress(startRes.progress)
        setErrorMessage(null)
        setValidationError(null)
        setSelectedOptionIds([])
        if (startRes.currentQuestion) {
          setQuestionHistory([startRes.currentQuestion.id])
          setHistoryIndex(0)
        } else {
          setQuestionHistory([])
          setHistoryIndex(-1)
        }
      } catch (err: any) {
        if (active) {
          setErrorMessage(err.message || 'Failed to start follow-up question session.')
        }
      } finally {
        if (active) {
          setIsLoading(false)
        }
      }
    }

    loadSession()
    return () => {
      active = false
    }
  }, [selectedProfileId, customExtractedProfile])

  const handleSelectProfile = useCallback((profileId: string) => {
    setIsLoading(true)
    setSelectedProfileId(profileId)
  }, [])

  // Handle option selection/toggle
  const handleToggleOption = (optionId: string) => {
    if (!currentQuestion) return
    setValidationError(null)

    if (currentQuestion.selectionType === 'single') {
      setSelectedOptionIds([optionId])
    } else {
      // Multiple selection
      if (optionId === 'undecided' || optionId === 'not_sure') {
        // If selecting exclusive exploring option, toggle cleanly
        if (selectedOptionIds.includes(optionId)) {
          setSelectedOptionIds(selectedOptionIds.filter((id) => id !== optionId))
        } else {
          setSelectedOptionIds([optionId])
        }
      } else {
        // Deselect undecided/not_sure when picking concrete choice
        const cleaned = selectedOptionIds.filter((id) => id !== 'undecided' && id !== 'not_sure')
        if (cleaned.includes(optionId)) {
          setSelectedOptionIds(cleaned.filter((id) => id !== optionId))
        } else {
          setSelectedOptionIds([...cleaned, optionId])
        }
      }
    }
  }

  // Handle Continue / Submit Answer
  const handleContinue = async () => {
    if (!sessionId || !currentQuestion) return

    if (currentQuestion.required && selectedOptionIds.length === 0) {
      setValidationError('Please select at least one option before proceeding.')
      return
    }

    setIsSubmitting(true)
    setValidationError(null)
    setSlideDirection('forward')

    try {
      const res = await followUpApi.submitAnswer(sessionId, {
        questionId: currentQuestion.id,
        selectedOptionIds,
        isSkipped: false,
      })

      setStatus(res.status)
      setProfile(res.updatedProfile)
      setProgress(res.progress)

      if (res.currentQuestion) {
        setCurrentQuestion(res.currentQuestion)

        // Maintain strict linear history
        const newHist = [...questionHistory.slice(0, historyIndex + 1), res.currentQuestion.id]
        setQuestionHistory(newHist)
        setHistoryIndex(newHist.length - 1)

        // Pre-fill answer if question was previously visited
        const summary = await followUpApi.getProfileSummary(sessionId)
        const existingAnswer = summary.answers[res.currentQuestion.id]
        setSelectedOptionIds(existingAnswer?.selectedOptionIds || [])
      } else {
        setCurrentQuestion(null)
      }
    } catch (err: any) {
      setValidationError(err.message || 'Submission failed. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Handle Skip
  const handleSkip = async () => {
    if (!sessionId || !currentQuestion) return

    setIsSubmitting(true)
    setValidationError(null)
    setSlideDirection('forward')

    try {
      const res = await followUpApi.submitAnswer(sessionId, {
        questionId: currentQuestion.id,
        selectedOptionIds: [],
        isSkipped: true,
      })

      setStatus(res.status)
      setProfile(res.updatedProfile)
      setProgress(res.progress)

      if (res.currentQuestion) {
        setCurrentQuestion(res.currentQuestion)
        const newHist = [...questionHistory.slice(0, historyIndex + 1), res.currentQuestion.id]
        setQuestionHistory(newHist)
        setHistoryIndex(newHist.length - 1)

        const summary = await followUpApi.getProfileSummary(sessionId)
        const existing = summary.answers[res.currentQuestion.id]
        setSelectedOptionIds(existing?.selectedOptionIds || [])
      } else {
        setCurrentQuestion(null)
      }
    } catch (err: any) {
      setValidationError(err.message || 'Skip failed. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Handle Back
  const handleBack = async () => {
    if (!sessionId || historyIndex <= 0) return

    const prevIndex = historyIndex - 1
    const prevQuestionId = questionHistory[prevIndex]

    setIsLoading(true)
    setValidationError(null)
    setSlideDirection('backward')

    try {
      const navRes = await followUpApi.navigateToQuestion(sessionId, prevQuestionId)
      setCurrentQuestion(navRes.currentQuestion)
      setProgress(navRes.progress)
      setHistoryIndex(prevIndex)
      setStatus('in_progress')

      // Retrieve previous answer for restored view
      const summary = await followUpApi.getProfileSummary(sessionId)
      const existing = summary.answers[prevQuestionId]
      setSelectedOptionIds(existing?.selectedOptionIds || [])
    } catch (err: any) {
      setErrorMessage(err.message || 'Navigation failed.')
    } finally {
      setIsLoading(false)
    }
  }

  // Handle Direct Edit from Review
  const handleEditSection = async (questionId: QuestionId) => {
    if (!sessionId) return
    setIsLoading(true)
    setValidationError(null)
    setSlideDirection('backward')

    try {
      const navRes = await followUpApi.navigateToQuestion(sessionId, questionId)
      setCurrentQuestion(navRes.currentQuestion)
      setProgress(navRes.progress)
      setStatus('in_progress')

      const summary = await followUpApi.getProfileSummary(sessionId)
      const existing = summary.answers[questionId]
      setSelectedOptionIds(existing?.selectedOptionIds || [])

      if (!questionHistory.includes(questionId)) {
        setQuestionHistory([...questionHistory, questionId])
        setHistoryIndex(questionHistory.length)
      } else {
        setHistoryIndex(questionHistory.indexOf(questionId))
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to navigate to question.')
    } finally {
      setIsLoading(false)
    }
  }

  // Handle Back from Review stage to the last question
  const handleBackFromReview = async () => {
    if (!sessionId || questionHistory.length === 0) return
    const lastQIndex = historyIndex >= 0 ? historyIndex : questionHistory.length - 1
    const targetQId = questionHistory[lastQIndex]

    setIsLoading(true)
    try {
      setSlideDirection('backward')
      const navRes = await followUpApi.navigateToQuestion(sessionId, targetQId)
      setCurrentQuestion(navRes.currentQuestion)
      setProgress(navRes.progress)
      setHistoryIndex(lastQIndex)
      setStatus('in_progress')

      const summary = await followUpApi.getProfileSummary(sessionId)
      const existing = summary.answers[targetQId]
      setSelectedOptionIds(existing?.selectedOptionIds || [])
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to navigate back from review.')
    } finally {
      setIsLoading(false)
    }
  }

  // Handle Final Profile Confirmation
  const handleConfirmProfile = async (updatedProfile?: CareerProfile) => {
    if (!sessionId) return
    setIsSubmitting(true)
    setValidationError(null)

    try {
      const completeRes = await followUpApi.completeSession(sessionId)
      const finalProfileToUse = updatedProfile
        ? { ...completeRes.finalProfile, ...updatedProfile }
        : completeRes.finalProfile

      setProfile(finalProfileToUse)
      setStatus('completed')

      // Persist final completed profile to storage so other JobTransit modules can use it
      if (typeof window !== 'undefined') {
        try {
          sessionStorage.setItem('jobtransit_final_profile', JSON.stringify(finalProfileToUse))
          localStorage.setItem('jobtransit_final_profile', JSON.stringify(finalProfileToUse))
        } catch (e) {
          console.warn('Could not store final profile', e)
        }
      }
    } catch (err: any) {
      setValidationError(err.message || 'Profile completion failed.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const customProfileInfo: CustomProfileInfo | null = customExtractedProfile
    ? {
        id: 'extracted_cv',
        name:
          customExtractedProfile.candidateName ||
          (customExtractedProfile as any).name ||
          (customExtractedProfile as any).fullName ||
          'My Uploaded CV',
        subtitle: 'Extracted from CV',
        description: `${(customExtractedProfile.skills || []).length} skills, ${(customExtractedProfile.experience || []).length} work roles parsed directly from your uploaded document.`,
      }
    : null

  // Header instance matching JobTransit site navbar
  const headerNode = (
    <Navbar
      activeTab="follow-up"
      onSelectTab={(tab) => {
        if (onNavigateTab) {
          onNavigateTab(tab)
        } else {
          window.location.href = tab === 'home' ? '/' : `/?tab=${tab}`
        }
      }}
      currentUser={currentUser || { name: 'Explorer', email: 'explorer@jobtransit.io' }}
      onLogout={onLogout}
    />
  )

  return (
    <MachineShell headerNode={headerNode}>
      {/* Dev Profile Switcher with Uploaded CV Support */}
      <MockProfileSelector
        currentProfileId={selectedProfileId}
        onSelectProfile={handleSelectProfile}
        disabled={isSubmitting}
        customProfile={customProfileInfo}
      />

      {/* Main Workspace Display */}
      {isLoading ? (
        <LoadingState />
      ) : errorMessage ? (
        <ErrorState message={errorMessage} onRetry={() => handleSelectProfile(selectedProfileId)} />
      ) : status === 'completed' && profile && sessionId ? (
        <CompletionState
          sessionId={sessionId}
          finalProfile={profile}
          onReset={() => handleSelectProfile(selectedProfileId)}
          onReturnHome={() => {
            if (onNavigateTab) onNavigateTab('home')
            else window.location.href = '/'
          }}
        />
      ) : status === 'review_ready' && profile ? (
        <ProfileConfirmation
          profile={profile}
          onEditSection={handleEditSection}
          onConfirm={handleConfirmProfile}
          onBack={handleBackFromReview}
          isSubmitting={isSubmitting}
          validationError={validationError}
          stepIndicator={progress ? `Step ${progress.totalKnownQuestions} of ${progress.totalKnownQuestions}` : 'Step 4 of 4'}
          onUpdateProfile={(p) => setProfile(p)}
        />
      ) : currentQuestion && progress && profile ? (
        <div className="w-full flex justify-center py-0.5 animate-in fade-in duration-200">
          <QuestionPanel
            question={currentQuestion}
            selectedOptionIds={selectedOptionIds}
            onToggleOption={handleToggleOption}
            onContinue={handleContinue}
            onBack={handleBack}
            onSkip={handleSkip}
            canGoBack={historyIndex > 0}
            isSubmitting={isSubmitting}
            validationError={validationError}
            progress={progress}
            isLastQuestion={progress.estimatedRemaining === 1 || progress.isReviewReady}
            slideDirection={slideDirection}
          />
        </div>
      ) : null}
    </MachineShell>
  )
}
