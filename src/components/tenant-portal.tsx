import * as React from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"

const SPACES = [
  {
    id: "0800",
    building: "VTS Tower",
    floor: "Floor 8",
    suite: "Suite 0800",
    sf: "18,000 sf",
    asking: "$98/sf asking",
    available: "Available Jul 2026",
    details: ["52nd floor views", "Existing TI package", "LEED Gold"],
    tags: ["Available", "Full Floor"],
  },
  {
    id: "0600",
    building: "VTS Tower",
    floor: "Floor 6",
    suite: "Suite 0600",
    sf: "18,000 sf",
    asking: "$94/sf asking",
    available: "Available Now",
    availableNote: "Requires rights clearance",
    details: ["City views", "Column-free floor plate", "Existing buildout"],
    tags: ["Rights Clearance Required", "Available Now"],
  },
]

const TOUR_WEEK = [
  { day: "Mon", date: "Mar 10", slots: ["9:00 AM", "11:00 AM"] },
  { day: "Tue", date: "Mar 11", slots: ["10:00 AM", "2:00 PM", "4:00 PM"] },
  { day: "Wed", date: "Mar 12", slots: ["9:30 AM", "1:00 PM"] },
  { day: "Thu", date: "Mar 13", slots: ["10:00 AM", "3:00 PM", "4:30 PM"] },
  { day: "Fri", date: "Mar 14", slots: ["9:00 AM", "11:30 AM"] },
]

function StarRating({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const [hover, setHover] = React.useState(0)
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map(n => (
        <button
          key={n}
          className={`text-xl leading-none transition-colors ${(hover || value) >= n ? "text-yellow-400" : "text-gray-300"}`}
          onMouseEnter={() => setHover(n)}
          onMouseLeave={() => setHover(0)}
          onClick={() => onChange(n)}
          aria-label={`${n} star${n !== 1 ? "s" : ""}`}
        >
          ★
        </button>
      ))}
    </div>
  )
}

function SpaceCard({ space }: { space: typeof SPACES[0] }) {
  const [rating, setRating] = React.useState(0)
  const [wouldTour, setWouldTour] = React.useState(false)
  const [feedback, setFeedback] = React.useState("")
  const [submitted, setSubmitted] = React.useState(false)

  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden bg-white">
      <div className="bg-gray-900 h-32 flex items-end p-4 relative">
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
        <div className="relative z-10">
          <p className="text-white/60 text-xs font-medium uppercase tracking-widest mb-0.5">{space.building}</p>
          <h3 className="text-white font-semibold text-lg leading-tight">{space.suite} · {space.floor}</h3>
        </div>
      </div>
      <div className="p-5 space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-semibold text-gray-900">{space.sf}</span>
          <span className="text-gray-400">·</span>
          <span className="text-sm text-blue-600 font-medium">{space.asking}</span>
          <span className="text-gray-400">·</span>
          <span className="text-sm text-gray-600">{space.available}</span>
          {space.availableNote && <span className="text-xs text-orange-600">({space.availableNote})</span>}
        </div>
        <div className="flex flex-wrap gap-1.5">
          {space.tags.map(tag => (
            <Badge key={tag} variant="secondary" className="text-xs bg-gray-100 text-gray-700">{tag}</Badge>
          ))}
        </div>
        <div className="flex flex-wrap gap-2">
          {space.details.map(d => (
            <span key={d} className="text-xs text-gray-500 bg-gray-50 border border-gray-200 rounded-full px-2.5 py-1">{d}</span>
          ))}
        </div>
        <Separator className="bg-gray-100" />
        {submitted ? (
          <div className="text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg px-4 py-3">
            Thanks for your feedback on {space.suite}! Matt will be in touch.
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-sm font-medium text-gray-700">Leave Feedback</p>
            <StarRating value={rating} onChange={setRating} />
            <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
              <input
                type="checkbox"
                checked={wouldTour}
                onChange={e => setWouldTour(e.target.checked)}
                className="rounded border-gray-300 text-blue-600"
              />
              I would tour this space
            </label>
            <textarea
              value={feedback}
              onChange={e => setFeedback(e.target.value)}
              className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 min-h-[80px] resize-none text-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Share your thoughts on this space..."
            />
            <Button
              size="sm"
              className="bg-blue-600 hover:bg-blue-700 text-white"
              onClick={() => setSubmitted(true)}
            >
              Submit Feedback
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}

function TourScheduler() {
  const [selected, setSelected] = React.useState<string | null>(null)
  const [confirmed, setConfirmed] = React.useState(false)

  if (confirmed) {
    return (
      <div className="border border-gray-200 rounded-xl bg-white p-6">
        <div className="text-center space-y-3">
          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto">
            <span className="text-green-600 text-xl">✓</span>
          </div>
          <h3 className="text-lg font-semibold text-gray-900">Tour Request Confirmed</h3>
          <p className="text-sm text-gray-500">Your tour has been requested for <strong>{selected}</strong>. Matt will confirm the details shortly.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="border border-gray-200 rounded-xl bg-white overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-100">
        <h3 className="font-semibold text-gray-900">Request a Tour</h3>
        <p className="text-sm text-gray-500 mt-0.5">Select a time that works for you — week of March 10th</p>
      </div>
      <div className="p-5">
        <div className="grid grid-cols-5 gap-3">
          {TOUR_WEEK.map(day => (
            <div key={day.day} className="flex flex-col gap-2">
              <div className="text-center mb-1">
                <p className="text-xs font-semibold text-gray-900">{day.day}</p>
                <p className="text-xs text-gray-400">{day.date}</p>
              </div>
              {day.slots.map(slot => {
                const key = `${day.date} · ${slot}`
                const isSelected = selected === key
                return (
                  <button
                    key={slot}
                    onClick={() => setSelected(isSelected ? null : key)}
                    className={`text-xs py-1.5 px-1 rounded-lg border text-center transition-all ${
                      isSelected
                        ? "bg-blue-600 text-white border-blue-600 font-medium"
                        : "border-gray-200 text-gray-600 hover:border-blue-300 hover:text-blue-600"
                    }`}
                  >
                    {slot}
                  </button>
                )
              })}
            </div>
          ))}
        </div>
      </div>
      <div className="px-5 pb-5">
        <Button
          className="w-full bg-blue-600 hover:bg-blue-700 text-white"
          disabled={!selected}
          onClick={() => setConfirmed(true)}
        >
          {selected ? `Confirm Tour: ${selected}` : "Select a Time Slot"}
        </Button>
      </div>
    </div>
  )
}

export function TenantPortal() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center rounded-md bg-blue-600 px-2.5 py-1 text-sm font-bold text-white">VTS</span>
            <div>
              <p className="text-sm font-semibold text-gray-900">Shared by Matt Callahan</p>
              <p className="text-xs text-gray-500">Secure space proposal · No login required</p>
            </div>
          </div>
          <Badge variant="outline" className="text-xs text-gray-500 border-gray-300">
            Shared securely
          </Badge>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8 space-y-8">
        {/* Message from Matt */}
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold shrink-0">MC</div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <p className="font-semibold text-gray-900 text-sm">Matt Callahan</p>
                <span className="text-xs text-gray-400">matt.callahan@propertyco.com</span>
              </div>
              <div className="text-sm text-gray-700 leading-relaxed space-y-3">
                <p>Hi Sarah,</p>
                <p>
                  Thank you for reaching out about Amazon's space requirements at VTS Tower. I'm excited to share
                  two spaces that I think are a strong fit for your client's needs.
                </p>
                <p>
                  <strong>Suite 0800 on Floor 8</strong> is our premier option — 18,000 sf of full-floor identity
                  with spectacular views, an existing TI package, and it aligns perfectly with Amazon's Q3 2026
                  target as Morgan Stanley's lease expires in July. <strong>Suite 0600 on Floor 6</strong> offers
                  immediate availability at a sharper price point, with a column-free plate that's ideal for
                  open office or collaborative layouts (pending rights clearance).
                </p>
                <p>
                  I've reserved time slots for tours during the <strong>week of March 10th</strong> — please use
                  the scheduler below to lock in a time. Amazon's team is welcome to tour both spaces in a single
                  visit, which I'd highly recommend.
                </p>
                <p>Looking forward to it,<br /><strong>Matt</strong></p>
              </div>
            </div>
          </div>
        </div>

        {/* Spaces */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Spaces Shared</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {SPACES.map(space => <SpaceCard key={space.id} space={space} />)}
          </div>
        </div>

        {/* Tour scheduler */}
        <TourScheduler />

        {/* Footer */}
        <div className="text-center text-xs text-gray-400 pb-8 space-y-1">
          <p>This page was shared by Matt Callahan.</p>
          <p>Your responses will be sent to matt.callahan@propertyco.com</p>
        </div>
      </div>
    </div>
  )
}
