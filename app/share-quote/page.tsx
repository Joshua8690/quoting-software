"use client"

import { Suspense } from "react"
import dynamic from "next/dynamic"
// import { Button } from "@/components/ui/button"
// import { Download } from 'lucide-react'
// import jsPDF from "jspdf"

const ShareQuoteContent = dynamic(() => import("./ShareQuoteContent"), { ssr: false })

export default function ShareQuotePage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ShareQuoteContent />
    </Suspense>
  )
}
