import React, { useEffect, useMemo, useState } from 'react'
import { ArrowRight, BadgeCheck, Plus, Target, TrendingUp, Timer, Wallet } from 'lucide-react'
import { RANK_COLORS } from '../transit/transitData'
import { buildRoleMatches, type FlowProfileSnapshot, type RoleMatch } from './onboardingData'

interface RoleMatchStepProps {
  snapshot: FlowProfileSnapshot
  onContinue: () => void
}

const RING_R = 42
const RING_C = 2 * Math.PI * RING_R

const ScoreRing: React.FC<{ score: number; color: string; animate: boolean }> = ({ score, color, animate }) => (
  <div className="relative w-[104px] h-[104px] shrink-0">
    <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
      <circle cx="50" cy="50" r={RING_R} fill="none" stroke="rgba(28,25,23,0.10)" strokeWidth="9" />
      <circle
        cx="50"
        cy="50"
        r={RING_R}
        fill="none"
        stroke={color}
        strokeWidth="9"
        strokeLinecap="round"
        strokeDasharray={RING_C}
        strokeDashoffset={animate ? RING_C * (1 - score / 100) : RING_C}
        style={{ transition: 'stroke-dashoffset 1100ms cubic-bezier(.2,.8,.2,1)' }}
      />
    </svg>
    <div className="absolute inset-0 flex flex-col items-center justify-center">
      <span className="font-signage text-4xl font-black text-stone-900 leading-none tabular-nums">{score}</span>
      <span className="font-mono-board text-[8px] tracking-widest text-stone-500 font-bold mt-0.5">% MATCH</span>
    </div>
  </div>
)

const Bar: React.FC<{ label: string; value: number; color: string; animate: boolean }> = ({ label, value, color, animate }) => (
  <div>
    <div className="flex items-center justify-between font-mono-board text-[9.5px] tracking-widest font-bold text-stone-600">
      <span>{label}</span>
      <span className="tabular-nums text-stone-900">{value}</span>
    </div>
    <div className="mt-1 h-1.5 rounded-full bg-stone-900/10 overflow-hidden">
      <div
        className="h-full rounded-full"
        style={{ width: animate ? `${value}%` : '0%', background: color, transition: 'width 1000ms cubic-bezier(.2,.8,.2,1)' }}
      />
    </div>
  </div>
)

const MatchCard: React.FC<{ match: RoleMatch; animate: boolean; delay: number }> = ({ match, animate, delay }) => {
  const rank = RANK_COLORS[(match.rank as 1 | 2 | 3) ?? 1]
  return (
    <article
      className="planner-card rounded-[28px] overflow-hidden flex flex-col onb-fade-up"
      style={{ animationDelay: `${delay}ms` }}
      aria-label={`${match.title} — ${match.score}% match`}
    >
      <div className="h-2.5" style={{ background: match.lineColor }} />

      <div className="p-5 flex flex-col gap-4 flex-1">
        {/* Title + score */}
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-1.5">
              <span
                className="px-2 py-0.5 rounded font-mono-board text-[10px] font-black tracking-widest border"
                style={{ background: rank.bg, color: rank.text, borderColor: rank.border }}
              >
                BEST FIT #{match.rank}
              </span>
              <span className="flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-stone-900 text-white font-mono-board text-[9px] font-bold tracking-widest">
                <span
                  className="w-3.5 h-3.5 rounded-full text-[8px] font-black flex items-center justify-center text-white"
                  style={{ background: match.lineColor }}
                >
                  {match.lineCode}
                </span>
                {match.lineName.toUpperCase()}
              </span>
            </div>
            <h3 className="font-signage text-3xl font-black tracking-wide text-stone-900 uppercase leading-[0.95] mt-2">
              {match.title}
            </h3>
            <div className="font-mono-board text-[10px] tracking-widest text-stone-500 mt-1">STATION {match.code}</div>
          </div>
          <ScoreRing score={match.score} color={match.lineColor} animate={animate} />
        </div>

        <p className="text-[12.5px] text-stone-600 leading-relaxed">{match.blurb}</p>

        {/* Score composition */}
        <div className="grid grid-cols-3 gap-3">
          <Bar label="SKILL FIT" value={match.skillFit} color="#10B981" animate={animate} />
          <Bar label="PREFERENCE" value={match.preference} color="#8B5CF6" animate={animate} />
          <Bar label="MARKET" value={match.market} color="#F59E0B" animate={animate} />
        </div>

        {/* Quick facts */}
        <div className="grid grid-cols-3 gap-2">
          {[
            { icon: Timer, label: 'TIME TO ARRIVE', value: `~${match.months} MO` },
            { icon: Wallet, label: 'SALARY', value: match.salary.replace('RM ', 'RM') },
            { icon: TrendingUp, label: 'DEMAND QoQ', value: `+${match.demandDelta}%` },
          ].map(({ icon: Icon, label, value }) => (
            <div key={label} className="rounded-xl bg-[#F4EEDD] border border-stone-300/70 px-2.5 py-2">
              <Icon className="w-3.5 h-3.5 text-stone-500" />
              <div className="font-signage text-[17px] font-black text-stone-900 leading-tight mt-1 whitespace-nowrap">{value}</div>
              <div className="font-mono-board text-[8px] tracking-widest text-stone-500 font-bold">{label}</div>
            </div>
          ))}
        </div>

        {/* Skills-gap breakdown */}
        <div className="rounded-2xl border-2 border-stone-900/80 bg-white p-3.5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-signage text-lg font-black tracking-wider text-stone-900">SKILLS-GAP BREAKDOWN</span>
            <span className="font-mono-board text-[10px] font-black text-stone-700 tabular-nums">
              {match.have.length}/{match.have.length + match.gap.length} · {match.coverage}%
            </span>
          </div>
          <div className="h-2 rounded-full bg-stone-900/10 overflow-hidden flex">
            <div
              className="h-full bg-emerald-500"
              style={{ width: animate ? `${match.coverage}%` : '0%', transition: 'width 1000ms cubic-bezier(.2,.8,.2,1)' }}
            />
            <div className="h-full flex-1 bg-[repeating-linear-gradient(-45deg,#FDE68A_0_4px,#FBBF24_4px_8px)]" />
          </div>

          <div>
            <div className="font-mono-board text-[9px] tracking-widest font-bold text-emerald-700 mb-1.5">YOU HAVE</div>
            <div className="flex flex-wrap gap-1.5">
              {match.have.map((s) => (
                <span
                  key={s.name}
                  className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-[11px] font-semibold border ${
                    s.verified
                      ? 'bg-emerald-100 border-emerald-400 text-emerald-900'
                      : 'bg-emerald-50 border-emerald-200 text-emerald-800'
                  }`}
                  title={s.verified ? 'Confirmed from your CV / answers' : 'Expected from your current stack'}
                >
                  {s.verified && <BadgeCheck className="w-3 h-3 text-emerald-600" />}
                  {s.name}
                </span>
              ))}
            </div>
          </div>

          <div>
            <div className="font-mono-board text-[9px] tracking-widest font-bold text-amber-700 mb-1.5">
              {match.gap.length > 0 ? 'TO BRIDGE' : 'NO GAPS — READY TO BOARD'}
            </div>
            <div className="flex flex-wrap gap-1.5">
              {match.gap.map((g) => (
                <span
                  key={g}
                  className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-[11px] font-bold bg-amber-50 border border-dashed border-amber-500 text-amber-900"
                >
                  <Plus className="w-3 h-3 text-amber-600" />
                  {g}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Why */}
        {match.reasons.length > 0 && (
          <ul className="space-y-1.5 mt-auto">
            {match.reasons.slice(0, 2).map((r) => (
              <li key={r} className="flex items-start gap-2 text-[12px] text-stone-700 leading-snug">
                <span className="mt-1.5 w-1.5 h-1.5 rounded-full shrink-0" style={{ background: match.lineColor }} />
                {r}
              </li>
            ))}
          </ul>
        )}
      </div>
    </article>
  )
}

export const RoleMatchStep: React.FC<RoleMatchStepProps> = ({ snapshot, onContinue }) => {
  const matches = useMemo(() => buildRoleMatches(snapshot), [snapshot])
  const [animate, setAnimate] = useState(false)

  useEffect(() => {
    const t = window.setTimeout(() => setAnimate(true), 250)
    return () => window.clearTimeout(t)
  }, [])

  return (
    <section className="space-y-6 animate-in fade-in duration-500" aria-labelledby="match-title">
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-5">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-stone-900 text-amber-300 text-[10px] font-mono-board tracking-[0.25em]">
            <Target className="w-3 h-3" /> STATION 07 · BEST-FIT MATCH
          </div>
          <h2
            id="match-title"
            className="font-signage text-5xl sm:text-6xl font-black tracking-tight text-stone-900 leading-[0.9] mt-3"
          >
            YOUR BEST-FIT<span className="text-transparent [-webkit-text-stroke:2px_#1C1917]"> DESTINATIONS</span>
          </h2>
          <p className="text-sm text-stone-700 mt-2 max-w-2xl">
            The system recommends the future roles that fit you best — each with a <strong>match score</strong> and a{' '}
            <strong>skills-gap breakdown</strong> built from your profile, your preferences and live market signals.
          </p>
          {snapshot.targetRoles.length > 0 && (
            <p className="mt-1.5 font-mono-board text-[10px] tracking-widest text-stone-500">
              YOUR STATED TARGETS · {snapshot.targetRoles.slice(0, 4).join(' · ').toUpperCase()}
            </p>
          )}
        </div>

        <div className="hud-card rounded-[24px] p-3.5 pr-5 flex items-center gap-4 self-start lg:self-auto">
          <div className="text-center">
            <div className="font-signage text-3xl font-black text-amber-300 leading-none tabular-nums">
              {matches[0]?.score ?? 0}%
            </div>
            <div className="text-[8.5px] font-mono-board text-stone-500 tracking-widest mt-1">TOP MATCH</div>
          </div>
          <div className="w-px h-9 bg-white/10" />
          <div className="text-center">
            <div className="font-signage text-3xl font-black text-white leading-none tabular-nums">
              {matches.reduce((n, m) => n + m.gap.length, 0)}
            </div>
            <div className="text-[8.5px] font-mono-board text-stone-500 tracking-widest mt-1">SKILLS TO BRIDGE</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-stretch">
        {matches.map((m, i) => (
          <MatchCard key={m.id} match={m} animate={animate} delay={i * 140} />
        ))}
      </div>

      <div className="board-panel rounded-[24px] p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <p className="text-sm text-stone-300 leading-relaxed">
          <span className="font-mono-board text-[10px] tracking-widest text-amber-300 font-bold block mb-0.5">NEXT</span>
          We&apos;ll plot these three destinations onto your personal Career Metro and light up the fastest route to each.
        </p>
        <button
          type="button"
          onClick={onContinue}
          className="group shrink-0 h-14 px-8 rounded-full bg-amber-400 hover:bg-amber-300 text-stone-950 font-mono-board text-sm font-black tracking-wider shadow-md transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-2.5"
        >
          <span>BUILD MY TRANSIT MAP</span>
          <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
        </button>
      </div>
    </section>
  )
}
