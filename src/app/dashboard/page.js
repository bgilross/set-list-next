"use client"

import React from "react"
import Main from "@/components/Main"
import Calendar from "@/components/Calendar"

export default function DashboardPage() {
  return (
    <div className="w-full flex flex-col items-center py-8">
      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Main />
        </div>
        <aside className="lg:col-span-1">
          <Calendar />
        </aside>
      </div>
    </div>
  )
}
