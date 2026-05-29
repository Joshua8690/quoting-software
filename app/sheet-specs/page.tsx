"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft, PlusCircle, Trash2, Save } from "lucide-react"
import Link from "next/link"
import { toast } from "react-hot-toast"

interface SheetCostChart {
  thicknesses: string[]
  sizes: string[]
  costs: Record<string, Record<string, string>> // costs[size][thickness] = cost
}

const DEFAULT_SIZES = ["4x8 ft", "4x10 ft", "4x12 ft", "5x10 ft", "5x12 ft"]
const DEFAULT_THICKNESSES = ["16 ga", "14 ga", "12 ga", "11 ga", "10 ga", "7 ga", "3/16\"", "1/4\"", "3/8\"", "1/2\""]

function loadChart(): SheetCostChart {
  if (typeof window === "undefined") {
    return { thicknesses: DEFAULT_THICKNESSES, sizes: DEFAULT_SIZES, costs: {} }
  }
  const stored = localStorage.getItem("sheetCostChart")
  if (stored) {
    try {
      return JSON.parse(stored)
    } catch {
      // fall through
    }
  }
  return { thicknesses: DEFAULT_THICKNESSES, sizes: DEFAULT_SIZES, costs: {} }
}

export default function SheetSpecsPage() {
  const [chart, setChart] = useState<SheetCostChart>(() => loadChart())
  const [newThickness, setNewThickness] = useState("")
  const [newSize, setNewSize] = useState("")
  const [hasChanges, setHasChanges] = useState(false)

  // Persist on save
  const saveChart = () => {
    localStorage.setItem("sheetCostChart", JSON.stringify(chart))
    setHasChanges(false)
    toast.success("Sheet cost chart saved!")
  }

  // Auto-save on unmount if changes exist
  useEffect(() => {
    return () => {
      if (hasChanges) {
        localStorage.setItem("sheetCostChart", JSON.stringify(chart))
      }
    }
  }, [chart, hasChanges])

  const updateCost = (size: string, thickness: string, value: string) => {
    setChart((prev) => {
      const newCosts = { ...prev.costs }
      if (!newCosts[size]) newCosts[size] = {}
      newCosts[size] = { ...newCosts[size], [thickness]: value }
      return { ...prev, costs: newCosts }
    })
    setHasChanges(true)
  }

  const getCost = (size: string, thickness: string): string => {
    return chart.costs[size]?.[thickness] ?? ""
  }

  const addThickness = () => {
    const trimmed = newThickness.trim()
    if (!trimmed) return
    if (chart.thicknesses.includes(trimmed)) {
      toast.error("That thickness already exists.")
      return
    }
    setChart((prev) => ({ ...prev, thicknesses: [...prev.thicknesses, trimmed] }))
    setNewThickness("")
    setHasChanges(true)
  }

  const removeThickness = (thickness: string) => {
    setChart((prev) => {
      const newCosts = { ...prev.costs }
      for (const size of Object.keys(newCosts)) {
        if (newCosts[size]) {
          const sizeCosts = { ...newCosts[size] }
          delete sizeCosts[thickness]
          newCosts[size] = sizeCosts
        }
      }
      return {
        ...prev,
        thicknesses: prev.thicknesses.filter((t) => t !== thickness),
        costs: newCosts,
      }
    })
    setHasChanges(true)
  }

  const addSize = () => {
    const trimmed = newSize.trim()
    if (!trimmed) return
    if (chart.sizes.includes(trimmed)) {
      toast.error("That size already exists.")
      return
    }
    setChart((prev) => ({ ...prev, sizes: [...prev.sizes, trimmed] }))
    setNewSize("")
    setHasChanges(true)
  }

  const removeSize = (size: string) => {
    setChart((prev) => {
      const newCosts = { ...prev.costs }
      delete newCosts[size]
      return {
        ...prev,
        sizes: prev.sizes.filter((s) => s !== size),
        costs: newCosts,
      }
    })
    setHasChanges(true)
  }

  return (
    <div className="container mx-auto p-4 max-w-6xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Link href="/">
            <Button variant="outline" size="icon">
              <ArrowLeft className="h-4 w-4" />
              <span className="sr-only">Back to invoices</span>
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Sheet Specification Chart</h1>
            <p className="text-muted-foreground mt-1">
              Set the cost for each sheet size and thickness combination. These prices will auto-fill when creating invoices.
            </p>
          </div>
        </div>
        <Button onClick={saveChart} className="flex items-center gap-2" disabled={!hasChanges}>
          <Save className="h-4 w-4" />
          Save Chart
        </Button>
      </div>

      {/* Manage Thicknesses */}
      <div className="mb-6 rounded-lg border border-border bg-card p-4">
        <h2 className="text-lg font-semibold text-card-foreground mb-3">Manage Thicknesses</h2>
        <div className="flex flex-wrap gap-2 mb-3">
          {chart.thicknesses.map((t) => (
            <span
              key={t}
              className="inline-flex items-center gap-1 rounded-md bg-secondary px-3 py-1.5 text-sm font-medium text-secondary-foreground"
            >
              {t}
              <button
                onClick={() => removeThickness(t)}
                className="ml-1 rounded-full p-0.5 hover:bg-destructive hover:text-destructive-foreground transition-colors"
                aria-label={`Remove ${t}`}
              >
                <Trash2 className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>
        <div className="flex items-end gap-2">
          <div className="flex-grow max-w-xs">
            <Label htmlFor="newThickness">Add Thickness</Label>
            <Input
              id="newThickness"
              value={newThickness}
              onChange={(e) => setNewThickness(e.target.value)}
              placeholder={'e.g. 3/16" or 18 ga'}
              onKeyDown={(e) => {
                if (e.key === "Enter") addThickness()
              }}
            />
          </div>
          <Button onClick={addThickness} variant="outline" size="sm">
            <PlusCircle className="h-4 w-4 mr-1" /> Add
          </Button>
        </div>
      </div>

      {/* Manage Sizes */}
      <div className="mb-6 rounded-lg border border-border bg-card p-4">
        <h2 className="text-lg font-semibold text-card-foreground mb-3">Manage Sheet Sizes</h2>
        <div className="flex flex-wrap gap-2 mb-3">
          {chart.sizes.map((s) => (
            <span
              key={s}
              className="inline-flex items-center gap-1 rounded-md bg-secondary px-3 py-1.5 text-sm font-medium text-secondary-foreground"
            >
              {s}
              <button
                onClick={() => removeSize(s)}
                className="ml-1 rounded-full p-0.5 hover:bg-destructive hover:text-destructive-foreground transition-colors"
                aria-label={`Remove ${s}`}
              >
                <Trash2 className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>
        <div className="flex items-end gap-2">
          <div className="flex-grow max-w-xs">
            <Label htmlFor="newSize">Add Sheet Size</Label>
            <Input
              id="newSize"
              value={newSize}
              onChange={(e) => setNewSize(e.target.value)}
              placeholder="e.g. 6x12 ft"
              onKeyDown={(e) => {
                if (e.key === "Enter") addSize()
              }}
            />
          </div>
          <Button onClick={addSize} variant="outline" size="sm">
            <PlusCircle className="h-4 w-4 mr-1" /> Add
          </Button>
        </div>
      </div>

      {/* Cost Grid */}
      <div className="rounded-lg border border-border bg-card p-4">
        <h2 className="text-lg font-semibold text-card-foreground mb-4">Cost Chart ($)</h2>
        {chart.sizes.length === 0 || chart.thicknesses.length === 0 ? (
          <p className="text-muted-foreground text-sm">
            Add at least one sheet size and one thickness to start filling in costs.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className="border border-border bg-muted px-3 py-3 text-left text-sm font-semibold text-muted-foreground sticky left-0 z-10 min-w-[120px]">
                    Size \ Thickness
                  </th>
                  {chart.thicknesses.map((t) => (
                    <th
                      key={t}
                      className="border border-border bg-muted px-3 py-3 text-center text-sm font-semibold text-muted-foreground min-w-[100px]"
                    >
                      {t}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {chart.sizes.map((size) => (
                  <tr key={size} className="hover:bg-accent/50 transition-colors">
                    <td className="border border-border bg-muted/50 px-3 py-2 text-sm font-medium text-foreground sticky left-0 z-10">
                      {size}
                    </td>
                    {chart.thicknesses.map((thickness) => (
                      <td key={thickness} className="border border-border px-1 py-1">
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          value={getCost(size, thickness)}
                          onChange={(e) => updateCost(size, thickness, e.target.value)}
                          placeholder="0.00"
                          className="w-full text-center h-9 text-sm border-0 bg-transparent focus:bg-background"
                        />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Unsaved changes reminder */}
      {hasChanges && (
        <div className="fixed bottom-6 right-6 bg-primary text-primary-foreground px-4 py-3 rounded-lg shadow-lg flex items-center gap-3">
          <span className="text-sm font-medium">You have unsaved changes</span>
          <Button onClick={saveChart} variant="secondary" size="sm">
            Save Now
          </Button>
        </div>
      )}
    </div>
  )
}
