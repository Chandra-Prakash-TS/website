'use client'
import React, { useEffect } from 'react'
import VerticalTimeline from './VerticalTimeline'
import events from '../app/events/events.json'
import UpcomingEvents from './UpcomingEvents'

const EventsTimeline = () => {
  useEffect(() => {
    if (window?.innerWidth >= 768) {
      window?.scrollBy(0, 70)
    }
  }, [])
  return (
    <div className="min-h-screen bg-slate-900 py-4 md:py-10">
      <div>
        <UpcomingEvents />
      </div>
      <div className="mt-10 px-4 py-8 sm:mx-auto">
        <h4 className="mb-10 ml-20 font-sans text-4xl font-semibold text-gray-400">
          Previous Events
        </h4>
        <VerticalTimeline events={events} />
      </div>
    </div>
  )
}

export default EventsTimeline
