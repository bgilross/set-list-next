"use client"

import React from "react"
import Main from "@/components/Main"
import Calendar from "@/components/Calendar"
import TipJar from "@/components/TipJar"

export default function DashboardPage() {
  return (
    <div className="w-full flex flex-col items-center py-8">
  <div className="w-full max-w-6xl grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-0 auto-rows-min">
          {/* Left column (two-thirds): TipJar top, Your Setlists below */}
          <div className="md:col-span-2 md:row-span-1">
            <TipJar />
          </div>

          {/* Right column: Calendar spans two rows; make it height-capped and scrollable so it doesn't push left column down */}
          <aside className="md:col-span-1 md:row-span-2 self-start">
            <div className="sticky top-8 max-h-[60vh] md:max-h-[75vh] overflow-y-auto p-0">
              <Calendar />
            </div>
          </aside>

          {/* Below TipJar in left two-thirds: Your Setlists */}
          <div className="md:col-span-2">
            <div className="p-4 rounded-lg border bg-white/80">
              <h3 className="text-lg font-semibold text-gray-800">Your Setlists</h3>
              <div>
                <Main />
              </div>
            </div>
          </div>
        </div>
    </div>
  )
}
