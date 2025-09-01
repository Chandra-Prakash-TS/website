'use client'
import React, { useState } from 'react'
import { DateTime } from 'luxon'
import events from '../app/events/events.json'

const UpcomingEvents = () => {
  const [formData, setFormData] = useState({ name: '', email: '' })
  const [formSubmitted, setFormSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const upcomingEvents = events.filter(
    (event) => new Date(event.date) > new Date(),
  )
  const nextEvent =
    upcomingEvents.length > 0
      ? upcomingEvents[0]
      : {
          title: 'Upcoming Event',
          date: new Date().toISOString(),
          location: 'Online',
        }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (submitting) return

    setSubmitting(true)

    const startUtc = DateTime.fromISO(nextEvent.date, { zone: 'utc' })
    const endUtc = startUtc.plus({ hours: 1 }) // 1 hour event

    const formatForGoogleCalendar = (dt) => dt.toFormat("yyyyLLdd'T'HHmmss'Z'")

    const datesParam = `${formatForGoogleCalendar(
      startUtc,
    )}/${formatForGoogleCalendar(endUtc)}`

    const calendarUrl = new URL(
      'https://calendar.google.com/calendar/r/eventedit',
    )
    calendarUrl.searchParams.set('text', nextEvent.title)
    calendarUrl.searchParams.set('dates', datesParam)
    calendarUrl.searchParams.set(
      'details',
      `You have registered for ${nextEvent.title}.`,
    )
    calendarUrl.searchParams.set('location', nextEvent.location || 'Online')

    window.open(calendarUrl.toString(), '_blank', 'noopener,noreferrer')

    // Instantly mark form as submitted without waiting for user confirmation
    setFormSubmitted(true)
    setSubmitting(false)
    setFormData({ name: '', email: '' })
  }

  return (
    <div className="mx-auto flex flex-col items-center justify-center rounded-3xl px-6 py-12 md:flex-row md:gap-20 md:px-24 lg:max-w-7xl">
      {/* Event image with overlay */}
      <div className="relative flex items-center justify-center overflow-hidden rounded-3xl shadow-2xl transition-transform duration-500 hover:scale-[1.03] md:w-1/2">
        <img
          src="https://images.unsplash.com/photo-1666548924551-edd89e2fb152?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTl8fGNvZGlnbiUyMGV2ZW50c3xlbnwwfHwwfHx8MA%3D%3D"
          alt={nextEvent.title}
          className="h-[420px] w-full object-cover"
        />
        <div className="absolute bottom-3 left-3 max-w-[85%] rounded-2xl border border-white/20 bg-gradient-to-br from-sky-800/20 to-cyan-900/90 p-6 text-white shadow-lg backdrop-blur-xl">
          <h3 className="mb-3 text-xl font-extrabold tracking-tight drop-shadow-lg">
            {nextEvent.title}
          </h3>
          <p className="text-md font-light drop-shadow-md">
            <span>
              <strong>Date:</strong>{' '}
              {DateTime.fromISO(nextEvent.date, {
                zone: 'Asia/Kolkata',
                locale: 'en-GB',
              }).toLocaleString(DateTime.DATE_FULL)}{' '}
              (IST)
            </span>
            <br />
            <span>
              <strong>Location:</strong> {nextEvent.location || 'Online'}
            </span>
          </p>
        </div>
      </div>

      {/* Registration form */}
      <div className="flex w-full max-w-[450px] flex-col justify-center rounded-3xl border border-white/20 bg-white/5 px-10 py-12 text-slate-100 shadow-2xl backdrop-blur-xl md:w-1/2">
        <div className="mb-8 text-center">
          <h3 className="mb-2 bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-4xl font-bold text-transparent">
            Join Us
          </h3>
          <p className="text-slate-400">
            Secure your spot at this exclusive event
          </p>
        </div>

        {!formSubmitted ? (
          <form onSubmit={handleSubmit} className="space-y-8">
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-400"
              >
                Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                placeholder="Your full name"
                className="w-full rounded-xl border border-white/40 bg-white/20 px-6 py-3 text-white placeholder-white/40 transition"
              />
            </div>

            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-400"
              >
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                placeholder="Enter your email address"
                className="w-full rounded-xl border border-white/40 bg-white/20 px-6 py-3 text-white placeholder-white/40"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className={`w-full rounded-xl bg-gradient-to-r from-sky-700 to-cyan-700 py-3 text-lg font-extrabold text-white shadow-xl transition hover:brightness-105 ${
                submitting ? 'cursor-not-allowed opacity-70' : ''
              }`}
            >
              {submitting ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white"></div>
                  <span>Processing...</span>
                </div>
              ) : (
                'Register'
              )}
            </button>
          </form>
        ) : (
          <div className="text-center">
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-r from-emerald-500 to-green-600 shadow-lg">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="size-4"
                height={40}
                width={40}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="m4.5 12.75 6 6 9-13.5"
                />
              </svg>
            </div>
            <h3 className="mb-4 text-2xl font-bold text-emerald-400">
              Registration Successful!
            </h3>
            <p className="mb-6 leading-relaxed text-slate-300">
              Thank you for joining us! Check your email for event details and
              exclusive updates.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export default UpcomingEvents
