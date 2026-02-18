"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { PlusCircle, Trash2, Share2, Download } from "lucide-react"
import { RecentQuotes } from "@/components/RecentQuotes"
import { TimestampClock } from "@/components/TimestampClock"
import { toast } from "react-hot-toast"
import jsPDF from "jspdf"

interface LineItem {
  description: string
  length: string
  width: string
  quantity: string
  quantityType: "dropdown" | "manual"
  lengthUnit: "inches" | "feet"
  widthUnit: "inches" | "feet"
  sqft: string
  inputMethod: "dimensions" | "sqft"
}

interface SheetSize {
  length: number
  width: number
  unit: "inches" | "feet"
  custom?: boolean
}

const materialTypes = ["Mild Steel", "Stainless Steel", "Aluminum", "Galvanized"]

export default function InvoicePage() {
  const MY_COMPANY = {
    name: "MHB FARMS / METALSHOP",
    phone: "(509) 770-1696",
    address: "21344 RD 18 NE Marlin WA 98832",
  }
  const [companyInfo] = useState(MY_COMPANY)
  const [customerName, setCustomerName] = useState("")
  const [projectName, setProjectName] = useState("")
  const [sheetCost, setSheetCost] = useState("")
  const [markupPercentage, setMarkupPercentage] = useState("30")
  const [lineItems, setLineItems] = useState<LineItem[]>([
    {
      description: "",
      length: "",
      width: "",
      quantity: "1",
      quantityType: "dropdown",
      lengthUnit: "inches",
      widthUnit: "inches",
      sqft: "",
      inputMethod: "dimensions",
    },
  ])
  const [generatedInvoice, setGeneratedInvoice] = useState<any>(null)
  const [sheetSize, setSheetSize] = useState<SheetSize>({ length: 5, width: 10, unit: "feet" })
  const [materialType, setMaterialType] = useState(materialTypes[0])
  const [formingCost, setFormingCost] = useState("")
  const [formingCostMethod, setFormingCostMethod] = useState<"perItem" | "total">("perItem")
  const [poNumber, setPoNumber] = useState("")
  const [recentInvoices, setRecentInvoices] = useState<any[]>([])
  const [customSheetSize, setCustomSheetSize] = useState<SheetSize>({ length: 0, width: 0, unit: "feet" })
  const [hourlyRate, setHourlyRate] = useState("")
  const [hoursWorked, setHoursWorked] = useState("")
  const [customerEmail, setCustomerEmail] = useState("")
  const [plasmaCuttingMinutes, setPlasmaCuttingMinutes] = useState("")
  const [plasmaCostPerMinute, setPlasmaCostPerMinute] = useState("")
  const [plasmaTimeUnit, setPlasmaTimeUnit] = useState<"minutes" | "hours">("minutes")
  const [laborTimeUnit, setLaborTimeUnit] = useState<"hours" | "minutes">("hours")
  const [nextInvoiceNumber, setNextInvoiceNumber] = useState("1")
  const [documentType, setDocumentType] = useState<"invoice" | "quote">("invoice")

  const [savedDrafts, setSavedDrafts] = useState<any[]>([])

  // Saved data states
  const [savedCustomerNames, setSavedCustomerNames] = useState<string[]>([])
  const [savedProjectNames, setSavedProjectNames] = useState<string[]>([])
  const [savedCustomerEmails, setSavedCustomerEmails] = useState<string[]>([])
  const [savedPoNumbers, setSavedPoNumbers] = useState<string[]>([])

  // Load saved data on component mount
  useEffect(() => {
    const loadSavedData = () => {
      const customerNames = localStorage.getItem("savedCustomerNames")
      const projectNames = localStorage.getItem("savedProjectNames")
      const customerEmails = localStorage.getItem("savedCustomerEmails")
      const poNumbers = localStorage.getItem("savedPoNumbers")

      if (customerNames) setSavedCustomerNames(JSON.parse(customerNames))
      if (projectNames) setSavedProjectNames(JSON.parse(projectNames))
      if (customerEmails) setSavedCustomerEmails(JSON.parse(customerEmails))
      if (poNumbers) setSavedPoNumbers(JSON.parse(poNumbers))

      const drafts = localStorage.getItem("savedDrafts")
      if (drafts) setSavedDrafts(JSON.parse(drafts))

      const storedCounter = localStorage.getItem("invoiceCounter")
      setNextInvoiceNumber(storedCounter ? (Number.parseInt(storedCounter) + 1).toString() : "1")
    }

    loadSavedData()
  }, [])

  // Save data to localStorage
  const saveToLocalStorage = (key: string, data: any) => {
    localStorage.setItem(key, JSON.stringify(data))
  }

  // Add unique item to array
  const addUniqueItem = (array: string[], item: string): string[] => {
    if (!item.trim()) return array
    const filtered = array.filter((existing) => existing !== item)
    return [item, ...filtered].slice(0, 10) // Keep only 10 most recent
  }

  // Generate sequential invoice number
  const generateInvoiceNumber = () => {
    const storedCounter = localStorage.getItem("invoiceCounter")
    const currentCounter = storedCounter ? Number.parseInt(storedCounter) + 1 : 1
    localStorage.setItem("invoiceCounter", currentCounter.toString())
    setNextInvoiceNumber((currentCounter + 1).toString())
    return currentCounter.toString()
  }

  const clearInvoice = () => {
    setCustomerName("")
    setProjectName("")
    setSheetCost("")
    setMarkupPercentage("30")
    setLineItems([
      {
        description: "",
        length: "",
        width: "",
        quantity: "1",
        quantityType: "dropdown",
        lengthUnit: "inches",
        widthUnit: "inches",
        sqft: "",
        inputMethod: "dimensions",
      },
    ])
    setSheetSize({ length: 5, width: 10, unit: "feet" })
    setMaterialType(materialTypes[0])
    setFormingCost("")
    setFormingCostMethod("perItem")
    setPoNumber("")
    setGeneratedInvoice(null)
    setCustomSheetSize({ length: 0, width: 0, unit: "feet" })
    setHourlyRate("")
    setHoursWorked("")
    setCustomerEmail("")
    setPlasmaCuttingMinutes("")
    setPlasmaCostPerMinute("")
    setPlasmaTimeUnit("minutes")
    setLaborTimeUnit("hours")
  }

  const saveDraft = () => {
    const draft = {
      id: Date.now(),
      companyInfo: MY_COMPANY,
      customerName,
      projectName,
      sheetCost,
      markupPercentage,
      lineItems,
      sheetSize,
      materialType,
      formingCost,
      formingCostMethod,
      poNumber,
      customSheetSize,
      hourlyRate,
      hoursWorked,
      customerEmail,
      plasmaCuttingMinutes,
      plasmaCostPerMinute,
      plasmaTimeUnit,
      laborTimeUnit,
      documentType,
      savedAt: new Date().toISOString(),
      label: `${customerName || "Untitled"} - ${projectName || "No Project"}`,
    }

    const updatedDrafts = [draft, ...savedDrafts.filter((d) => d.id !== draft.id)].slice(0, 20)
    setSavedDrafts(updatedDrafts)
    localStorage.setItem("savedDrafts", JSON.stringify(updatedDrafts))
    toast.success("Draft saved successfully!")
  }

  const loadDraft = (draft: any) => {
    setCustomerName(draft.customerName || "")
    setProjectName(draft.projectName || "")
    setSheetCost(draft.sheetCost || "")
    setMarkupPercentage(draft.markupPercentage || "30")
    setLineItems(draft.lineItems || [{ description: "", length: "", width: "", quantity: "1", quantityType: "dropdown", lengthUnit: "inches", widthUnit: "inches", sqft: "", inputMethod: "dimensions" }])
    setSheetSize(draft.sheetSize || { length: 5, width: 10, unit: "feet" })
    setMaterialType(draft.materialType || materialTypes[0])
    setFormingCost(draft.formingCost || "")
    setFormingCostMethod(draft.formingCostMethod || "perItem")
    setPoNumber(draft.poNumber || "")
    setCustomSheetSize(draft.customSheetSize || { length: 0, width: 0, unit: "feet" })
    setHourlyRate(draft.hourlyRate || "")
    setHoursWorked(draft.hoursWorked || "")
    setCustomerEmail(draft.customerEmail || "")
    setPlasmaCuttingMinutes(draft.plasmaCuttingMinutes || "")
    setPlasmaCostPerMinute(draft.plasmaCostPerMinute || "")
    setPlasmaTimeUnit(draft.plasmaTimeUnit || "minutes")
    setLaborTimeUnit(draft.laborTimeUnit || "hours")
    setDocumentType(draft.documentType || "invoice")
    setGeneratedInvoice(null)
    toast.success("Draft loaded! You can now edit and generate the invoice.")
  }

  const deleteDraft = (draftId: number) => {
    const updatedDrafts = savedDrafts.filter((d) => d.id !== draftId)
    setSavedDrafts(updatedDrafts)
    localStorage.setItem("savedDrafts", JSON.stringify(updatedDrafts))
    toast.success("Draft deleted.")
  }

  const loadInvoiceForEdit = (invoice: any) => {
    setCustomerName(invoice.customerName || "")
    setProjectName(invoice.projectName || "")
    setSheetCost(invoice.sheetCost || "")
    setMarkupPercentage(invoice.markupPercentage || "30")
    setLineItems(
      invoice.lineItems?.map((item: any) => ({
        description: item.description || "",
        length: item.length || "",
        width: item.width || "",
        quantity: item.quantity || "1",
        quantityType: item.quantityType || "dropdown",
        lengthUnit: item.lengthUnit || "inches",
        widthUnit: item.widthUnit || "inches",
        sqft: item.sqft || "",
        inputMethod: item.inputMethod || "dimensions",
      })) || [{ description: "", length: "", width: "", quantity: "1", quantityType: "dropdown", lengthUnit: "inches", widthUnit: "inches", sqft: "", inputMethod: "dimensions" }]
    )
    setSheetSize(invoice.sheetSize || { length: 5, width: 10, unit: "feet" })
    setMaterialType(invoice.materialType || materialTypes[0])
    setFormingCost(invoice.formingCost || "")
    setFormingCostMethod(invoice.formingCostMethod || "perItem")
    setPoNumber(invoice.poNumber || "")
    setCustomSheetSize(invoice.customSheetSize || { length: 0, width: 0, unit: "feet" })
    setHourlyRate(invoice.hourlyRate || "")
    setHoursWorked(invoice.hoursWorked || "")
    setCustomerEmail(invoice.customerEmail || "")
    setPlasmaCuttingMinutes(invoice.plasmaCuttingMinutes || "")
    setPlasmaCostPerMinute(invoice.plasmaCostPerMinute || "")
    setPlasmaTimeUnit(invoice.plasmaTimeUnit || "minutes")
    setLaborTimeUnit(invoice.laborTimeUnit || "hours")
    setDocumentType(invoice.documentType || "invoice")
    setGeneratedInvoice(null)
    window.scrollTo({ top: 0, behavior: "smooth" })
    toast.success("Invoice loaded for editing! Make your changes and generate a new invoice.")
  }

  const deleteInvoice = (invoiceId: number) => {
    const updatedInvoices = recentInvoices.filter((inv) => inv.id !== invoiceId)
    setRecentInvoices(updatedInvoices)
    localStorage.setItem("recentInvoices", JSON.stringify(updatedInvoices))
    toast.success("Invoice deleted.")
  }

  const fillDemoData = () => {
    setCustomerName("John Smith")
    setProjectName("Barn Steel Panels")
    setCustomerEmail("johnsmith@email.com")
    setPoNumber("PO-2026-001")
    setSheetCost("125.00")
    setMarkupPercentage("30")
    setMaterialType("Mild Steel")
    setSheetSize({ length: 5, width: 10, unit: "feet" })
    setFormingCost("15")
    setFormingCostMethod("perItem")
    setHourlyRate("75")
    setHoursWorked("2.5")
    setLaborTimeUnit("hours")
    setPlasmaCuttingMinutes("45")
    setPlasmaCostPerMinute("1.25")
    setPlasmaTimeUnit("minutes")
    setLineItems([
      {
        description: "Side Panel - Left",
        length: "48",
        width: "24",
        quantity: "4",
        quantityType: "dropdown",
        lengthUnit: "inches",
        widthUnit: "inches",
        sqft: "",
        inputMethod: "dimensions",
      },
      {
        description: "Top Cover Plate",
        length: "36",
        width: "18",
        quantity: "2",
        quantityType: "dropdown",
        lengthUnit: "inches",
        widthUnit: "inches",
        sqft: "",
        inputMethod: "dimensions",
      },
      {
        description: "Floor Base",
        length: "",
        width: "",
        quantity: "1",
        quantityType: "dropdown",
        lengthUnit: "inches",
        widthUnit: "inches",
        sqft: "12",
        inputMethod: "sqft",
      },
    ])
    setGeneratedInvoice(null)
    toast.success("Demo data loaded! Hit Generate to preview.")
  }

  useEffect(() => {
    if (generatedInvoice) {
      console.log("Generated invoice updated:", generatedInvoice)
    }
    const storedInvoices = localStorage.getItem("recentInvoices")
    if (storedInvoices) {
      setRecentInvoices(JSON.parse(storedInvoices))
    }
  }, [generatedInvoice])

  const addLineItem = () => {
    setLineItems([
      ...lineItems,
      {
        description: "",
        length: "",
        width: "",
        quantity: "1",
        quantityType: "dropdown",
        lengthUnit: "inches",
        widthUnit: "inches",
        sqft: "",
        inputMethod: "dimensions",
      },
    ])
  }

  const updateLineItem = (index: number, field: keyof LineItem, value: string) => {
    const updatedItems = lineItems.map((item, i) => {
      if (i === index) {
        return { ...item, [field]: value }
      }
      return item
    })
    setLineItems(updatedItems)
  }

  const removeLineItem = (index: number) => {
    setLineItems(lineItems.filter((_, i) => i !== index))
  }

  const calculatePartCost = (item: LineItem) => {
    const sheetCostValue = Number.parseFloat(sheetCost) || 0

    if (item.inputMethod === "sqft") {
      // Calculate cost based on square footage
      const sheetAreaSqft = sheetSize.unit === "feet"
        ? sheetSize.length * sheetSize.width
        : (sheetSize.length * sheetSize.width) / 144
      const costPerSqft = sheetAreaSqft > 0 ? sheetCostValue / sheetAreaSqft : 0
      const itemSqft = Number.parseFloat(item.sqft) || 0
      return costPerSqft * itemSqft * (Number.parseFloat(item.quantity) || 0)
    }

    // Calculate cost based on dimensions
    const sheetArea =
      sheetSize.unit === "feet"
        ? sheetSize.length * sheetSize.width * 144 // sheet size in square inches
        : sheetSize.length * sheetSize.width // sheet size already in square inches
    const partLength = item.lengthUnit === "feet" ? Number.parseFloat(item.length) * 12 : Number.parseFloat(item.length)
    const partWidth = item.widthUnit === "feet" ? Number.parseFloat(item.width) * 12 : Number.parseFloat(item.width)
    const partArea = partLength * partWidth
    const partsPerSheet = Math.floor(sheetArea / partArea) || 1 // Prevent division by zero
    const costPerPart = sheetCostValue / partsPerSheet
    return costPerPart * (Number.parseFloat(item.quantity) || 0)
  }

  const calculatePlasmaCuttingCost = () => {
    const timeValue = Number.parseFloat(plasmaCuttingMinutes) || 0
    const costPerUnit = Number.parseFloat(plasmaCostPerMinute) || 0
    const minutes = plasmaTimeUnit === "hours" ? timeValue * 60 : timeValue
    return minutes * costPerUnit
  }

  const calculateTotal = () => {
    const subtotal = lineItems.reduce((total, item) => {
      const itemCost = calculatePartCost(item)
      return isNaN(itemCost) ? total : total + itemCost
    }, 0)
    const markup = subtotal * (Number.parseFloat(markupPercentage) / 100 || 0)
    const totalFormingCost =
      formingCostMethod === "perItem"
        ? lineItems.reduce((total, item) => {
            return total + (Number.parseFloat(formingCost) || 0) * (Number.parseFloat(item.quantity) || 0)
          }, 0)
        : Number.parseFloat(formingCost) || 0
    const laborCost = calculateLaborCost()
    const plasmaCost = calculatePlasmaCuttingCost()
    return (subtotal + markup + totalFormingCost + laborCost + plasmaCost).toFixed(2)
  }

  const calculateMaterialCost = () => {
    return lineItems.reduce((total, item) => {
      const itemCost = calculatePartCost(item)
      return isNaN(itemCost) ? total : total + itemCost
    }, 0)
  }

  const calculateNetProfit = () => {
    const totalValue = Number.parseFloat(calculateTotal()) || 0
    const materialCost = calculateMaterialCost()
    return (totalValue - materialCost).toFixed(2)
  }

  const calculateLaborCost = () => {
    const rate = Number.parseFloat(hourlyRate)
    const timeValue = Number.parseFloat(hoursWorked)
    if (isNaN(rate) || isNaN(timeValue)) return 0
    const hours = laborTimeUnit === "minutes" ? timeValue / 60 : timeValue
    return rate * hours
  }

  const generateInvoice = () => {
    try {
      console.group("%cInvoice Generation Started", "color: #0070f3; font-size: 14px; font-weight: bold;")
      console.time("Invoice Generation Time")

      // Save current entries to localStorage
      if (customerName.trim()) {
        const updatedCustomerNames = addUniqueItem(savedCustomerNames, customerName)
        setSavedCustomerNames(updatedCustomerNames)
        saveToLocalStorage("savedCustomerNames", updatedCustomerNames)
      }

      if (projectName.trim()) {
        const updatedProjectNames = addUniqueItem(savedProjectNames, projectName)
        setSavedProjectNames(updatedProjectNames)
        saveToLocalStorage("savedProjectNames", updatedProjectNames)
      }

      if (customerEmail.trim()) {
        const updatedCustomerEmails = addUniqueItem(savedCustomerEmails, customerEmail)
        setSavedCustomerEmails(updatedCustomerEmails)
        saveToLocalStorage("savedCustomerEmails", updatedCustomerEmails)
      }

      if (poNumber.trim()) {
        const updatedPoNumbers = addUniqueItem(savedPoNumbers, poNumber)
        setSavedPoNumbers(updatedPoNumbers)
        saveToLocalStorage("savedPoNumbers", updatedPoNumbers)
      }

      const totalFormingCost =
        formingCostMethod === "perItem"
          ? lineItems.reduce((total, item) => {
              return total + (Number.parseFloat(formingCost) || 0) * (Number.parseFloat(item.quantity) || 0)
            }, 0)
          : Number.parseFloat(formingCost) || 0

      const laborCost = calculateLaborCost()
      const plasmaCost = calculatePlasmaCuttingCost()
      const invoiceNumber = generateInvoiceNumber()

      const invoiceData = {
        id: Date.now(),
        documentType,
        invoiceNumber,
        companyInfo,
        customerName,
        projectName,
        sheetSize,
        materialType,
        lineItems: lineItems.map((item) => ({
          ...item,
          sqft: item.sqft || "",
          inputMethod: item.inputMethod || "dimensions",
          cost: calculatePartCost(item).toFixed(2),
        })),
        formingCost,
        formingCostMethod,
        totalFormingCost: totalFormingCost.toFixed(2),
        hourlyRate: hourlyRate || undefined,
        hoursWorked: hoursWorked || undefined,
        laborCost: laborCost > 0 ? laborCost.toFixed(2) : undefined,
        plasmaCuttingMinutes: plasmaCuttingMinutes || undefined,
        plasmaCostPerMinute: plasmaCostPerMinute || undefined,
        plasmaCuttingCost: plasmaCost > 0 ? plasmaCost.toFixed(2) : undefined,
        total: calculateTotal(),
        poNumber: poNumber || undefined,
        date: new Date().toISOString(),
        customerEmail,
        // Save full form data for editing later
        sheetCost,
        markupPercentage,
        customSheetSize,
        hourlyRate,
        hoursWorked,
        plasmaCuttingMinutes,
        plasmaCostPerMinute,
        plasmaTimeUnit,
        laborTimeUnit,
      }

      // Enhanced console logging
      console.log("%cInvoice Details", "color: #2ecc71; font-weight: bold;")
      console.group("Company Information")
      console.table({
        "Company Name": invoiceData.companyInfo.name,
        Phone: invoiceData.companyInfo.phone,
        Address: invoiceData.companyInfo.address,
      })
      console.groupEnd()

      console.group("Customer Information")
      console.table({
        "Customer Name": invoiceData.customerName,
        "Project Name": invoiceData.projectName,
        Email: invoiceData.customerEmail,
        "PO Number": invoiceData.poNumber || "N/A",
        "Invoice Number": invoiceData.invoiceNumber,
      })
      console.groupEnd()

      console.group("Material Specifications")
      console.table({
        "Material Type": invoiceData.materialType,
        "Sheet Size": `${invoiceData.sheetSize.length} ${invoiceData.sheetSize.unit} x ${invoiceData.sheetSize.width} ${invoiceData.sheetSize.unit}`,
        "Sheet Cost": `$${sheetCost}`,
        Markup: `${markupPercentage}%`,
      })
      console.groupEnd()

      console.group("Line Items")
      console.table(
        invoiceData.lineItems.map((item) => ({
          Description: item.description,
          Dimensions: `${item.length} ${item.lengthUnit} x ${item.width} ${item.widthUnit}`,
          Quantity: item.quantity,
          Cost: `$${item.cost}`,
        })),
      )
      console.groupEnd()

      console.group("Additional Costs")
      console.table({
        "Forming Cost": `$${invoiceData.totalFormingCost}`,
        "Forming Method": invoiceData.formingCostMethod,
        "Labor Rate": invoiceData.hourlyRate ? `$${invoiceData.hourlyRate}/hr` : "N/A",
        "Hours Worked": invoiceData.hoursWorked || "N/A",
        "Labor Cost": invoiceData.laborCost ? `$${invoiceData.laborCost}` : "N/A",
        "Plasma Minutes": invoiceData.plasmaCuttingMinutes || "N/A",
        "Plasma Rate": invoiceData.plasmaCostPerMinute ? `$${invoiceData.plasmaCostPerMinute}/min` : "N/A",
        "Plasma Cost": invoiceData.plasmaCuttingCost ? `$${invoiceData.plasmaCuttingCost}` : "N/A",
      })
      console.groupEnd()

      console.log("%cInvoice Summary", "color: #e67e22; font-weight: bold;")
      console.table({
        Total: `$${invoiceData.total}`,
        "Generated On": new Date().toLocaleString(),
        "Invoice Number": invoiceData.invoiceNumber,
      })

      setGeneratedInvoice(invoiceData)
      setCustomerEmail(invoiceData.customerEmail)

      // Add the new invoice to recent invoices
      const updatedRecentInvoices = [invoiceData, ...recentInvoices.slice(0, 9)]
      setRecentInvoices(updatedRecentInvoices)
      localStorage.setItem("recentInvoices", JSON.stringify(updatedRecentInvoices))

      console.timeEnd("Invoice Generation Time")
      console.groupEnd()

      toast.success("Invoice generated successfully!")
    } catch (error) {
      console.error("%cError in generateInvoice:", "color: #e74c3c; font-weight: bold;", error)
      toast.error(`Failed to generate invoice: ${error instanceof Error ? error.message : String(error)}`)
    }
  }

  const handleShare = async () => {
    if (generatedInvoice) {
      try {
        const shareableLink = generateShareableLink(generatedInvoice)
        const invoiceText = `
Invoice for ${generatedInvoice.customerName}
Project: ${generatedInvoice.projectName}
Invoice #: ${generatedInvoice.invoiceNumber}
Total: $${generatedInvoice.total}

Generated by ${generatedInvoice.companyInfo.name}
Phone: ${generatedInvoice.companyInfo.phone}

View full invoice: ${shareableLink}
      `.trim()

        // Check if Web Share API is supported and available
        if (navigator.share && typeof navigator.share === "function") {
          try {
            await navigator.share({
              title: `Invoice for ${generatedInvoice.customerName}`,
              text: invoiceText,
              url: shareableLink,
            })
            toast.success("Invoice shared successfully!")
          } catch (shareError) {
            console.log("Share API error:", shareError)
            // Fallback to clipboard if share is cancelled or fails
            await fallbackToClipboard(shareableLink)
          }
        } else {
          // If Web Share API is not available, use clipboard
          await fallbackToClipboard(shareableLink)
        }
      } catch (error) {
        console.error("Error in handleShare:", error)
        toast.error("Failed to share invoice. Please try copying the link instead.")
      }
    }
  }

  // Add this new function for clipboard fallback
  const fallbackToClipboard = async (link: string) => {
    try {
      await navigator.clipboard.writeText(link)
      toast.success("Shareable link copied to clipboard!")
    } catch (clipboardError) {
      console.error("Clipboard error:", clipboardError)
      toast.error("Failed to copy link. Please try again.")
    }
  }

  const generateShareableLink = (invoice: any) => {
    const baseUrl = window.location.origin
    const invoiceData = encodeURIComponent(JSON.stringify(invoice))
    return `${baseUrl}/share-quote?data=${invoiceData}`
  }

  const generatePDF = () => {
    if (generatedInvoice) {
      const doc = new jsPDF()
      const pageWidth = 210
      const margin = 15
      const contentWidth = pageWidth - margin * 2

      // ===== HEADER SECTION (matches on-screen gray header) =====
      doc.setFillColor(249, 250, 251) // bg-gray-50
      doc.rect(0, 0, pageWidth, 55, "F")
      doc.setDrawColor(229, 231, 235) // border-gray-200
      doc.setLineWidth(0.5)
      doc.line(0, 55, pageWidth, 55)

      // Company Name (left side)
      doc.setTextColor(31, 41, 55) // text-gray-800
      doc.setFontSize(20)
      doc.setFont("helvetica", "bold")
      doc.text(generatedInvoice.companyInfo.name, margin, 18)

      // Company address & phone
      doc.setTextColor(75, 85, 99) // text-gray-600
      doc.setFontSize(9)
      doc.setFont("helvetica", "normal")
      doc.text(generatedInvoice.companyInfo.address, margin, 28)
      doc.text(generatedInvoice.companyInfo.phone, margin, 35)

      // Document type badge (right side) - small, ink-friendly
      const isQuote = generatedInvoice.documentType === "quote"
      const docLabel = isQuote ? "QUOTE" : "INVOICE"
      if (isQuote) {
        doc.setFillColor(37, 99, 235) // blue
      } else {
        doc.setFillColor(22, 163, 74) // green
      }
      doc.roundedRect(158, 10, 38, 11, 2, 2, "F")
      doc.setTextColor(255, 255, 255)
      doc.setFontSize(11)
      doc.setFont("helvetica", "bold")
      doc.text(docLabel, isQuote ? 165 : 163, 18)

      // Document details box (right side, below badge) - bordered title block
      const detailBoxX = 140
      const detailBoxY = 24
      const detailBoxW = 56
      const detailBoxH = 28
      if (isQuote) {
        doc.setDrawColor(147, 197, 253) // blue-300
      } else {
        doc.setDrawColor(134, 239, 172) // green-300
      }
      doc.setLineWidth(0.8)
      doc.roundedRect(detailBoxX, detailBoxY, detailBoxW, detailBoxH, 2, 2, "S")

      doc.setTextColor(55, 65, 81)
      doc.setFontSize(7)
      doc.setFont("helvetica", "bold")
      doc.text(`${isQuote ? "Quote" : "Invoice"} #:`, detailBoxX + 3, detailBoxY + 6)
      doc.setFont("helvetica", "normal")
      doc.text(generatedInvoice.invoiceNumber, detailBoxX + detailBoxW - 3, detailBoxY + 6, { align: "right" })

      // Divider
      if (isQuote) {
        doc.setDrawColor(191, 219, 254) // blue-200
      } else {
        doc.setDrawColor(187, 247, 208) // green-200
      }
      doc.setLineWidth(0.3)
      doc.line(detailBoxX + 2, detailBoxY + 9, detailBoxX + detailBoxW - 2, detailBoxY + 9)

      doc.setFont("helvetica", "bold")
      doc.text("Date:", detailBoxX + 3, detailBoxY + 15)
      doc.setFont("helvetica", "normal")
      doc.text(new Date(generatedInvoice.date).toLocaleDateString(), detailBoxX + detailBoxW - 3, detailBoxY + 15, { align: "right" })

      // Divider
      doc.line(detailBoxX + 2, detailBoxY + 18, detailBoxX + detailBoxW - 2, detailBoxY + 18)

      const dueDateLabel = isQuote ? "Valid Until:" : "Due Date:"
      const dueDate = isQuote
        ? new Date(new Date(generatedInvoice.date).getTime() + 24 * 60 * 60 * 1000).toLocaleDateString()
        : new Date(new Date(generatedInvoice.date).getTime() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString()
      doc.setFont("helvetica", "bold")
      doc.text(dueDateLabel, detailBoxX + 3, detailBoxY + 24)
      doc.setFont("helvetica", "normal")
      doc.text(dueDate, detailBoxX + detailBoxW - 3, detailBoxY + 24, { align: "right" })

      // ===== BILL TO SECTION =====
      let yPos = 65

      // "Bill To:" header with underline
      doc.setTextColor(31, 41, 55)
      doc.setFontSize(12)
      doc.setFont("helvetica", "bold")
      doc.text("Bill To:", margin, yPos)
      doc.setDrawColor(209, 213, 219) // border-gray-300
      doc.setLineWidth(0.3)
      doc.line(margin, yPos + 2, margin + 30, yPos + 2)
      yPos += 12

      // Customer name
      doc.setTextColor(55, 65, 81) // text-gray-700
      doc.setFontSize(11)
      doc.setFont("helvetica", "bold")
      doc.text(generatedInvoice.customerName, margin, yPos)
      yPos += 7

      doc.setFontSize(9)
      doc.setFont("helvetica", "normal")

      if (generatedInvoice.projectName && generatedInvoice.projectName.trim()) {
        doc.setFont("helvetica", "bold")
        doc.text("Project: ", margin, yPos)
        doc.setFont("helvetica", "normal")
        doc.text(generatedInvoice.projectName, margin + 18, yPos)
        yPos += 6
      }

      if (generatedInvoice.customerEmail) {
        doc.setFont("helvetica", "bold")
        doc.text("Email: ", margin, yPos)
        doc.setFont("helvetica", "normal")
        doc.text(generatedInvoice.customerEmail, margin + 14, yPos)
        yPos += 6
      }

      if (generatedInvoice.poNumber) {
        doc.setFont("helvetica", "bold")
        doc.text("PO Number: ", margin, yPos)
        doc.setFont("helvetica", "normal")
        doc.text(generatedInvoice.poNumber, margin + 24, yPos)
        yPos += 6
      }

      // Divider line
      yPos += 5
      doc.setDrawColor(229, 231, 235)
      doc.setLineWidth(0.5)
      doc.line(margin, yPos, pageWidth - margin, yPos)
      yPos += 10

      // ===== ITEMIZED INVOICE TABLE =====
      doc.setTextColor(31, 41, 55)
      doc.setFontSize(13)
      doc.setFont("helvetica", "bold")
      doc.text(`Itemized ${isQuote ? "Quote" : "Invoice"}`, margin, yPos)
      yPos += 8

      // Table header
      const colX = { num: margin, desc: margin + 12, dim: 120, qty: 175 }
      doc.setFillColor(243, 244, 246) // bg-gray-100
      doc.rect(margin, yPos - 5, contentWidth, 12, "F")

      // Header borders
      doc.setDrawColor(209, 213, 219)
      doc.setLineWidth(0.3)
      doc.rect(margin, yPos - 5, contentWidth, 12, "S")

      doc.setFontSize(9)
      doc.setFont("helvetica", "bold")
      doc.setTextColor(55, 65, 81)
      doc.text("#", colX.num + 2, yPos + 2)
      doc.text("Description", colX.desc + 2, yPos + 2)
      doc.text("Dimensions / Sq Ft", colX.dim, yPos + 2)
      doc.text("Qty", colX.qty + 2, yPos + 2)

      yPos += 12

      // Table rows
      doc.setFont("helvetica", "normal")
      doc.setFontSize(9)
      doc.setTextColor(31, 41, 55)

      generatedInvoice.lineItems.forEach((item: any, index: number) => {
        const rowHeight = 12
        // Row border
        doc.setDrawColor(209, 213, 219)
        doc.rect(margin, yPos - 5, contentWidth, rowHeight, "S")

        doc.text((index + 1).toString(), colX.num + 4, yPos + 2)
        doc.text(item.description || "Custom Part", colX.desc + 2, yPos + 2)
        const dimText = item.inputMethod === "sqft"
          ? `${item.sqft} sq ft`
          : `${item.length} ${item.lengthUnit} x ${item.width} ${item.widthUnit}`
        doc.text(dimText, colX.dim, yPos + 2)
        doc.text(item.quantity, colX.qty + 5, yPos + 2)

        yPos += rowHeight

        if (yPos > 250) {
          doc.addPage()
          yPos = 30
        }
      })

      yPos += 15

      // ===== TOTAL SECTION (dark box, matches on-screen) =====
      const totalBoxHeight = 24
      const totalBoxWidth = contentWidth * 0.55
      const totalBoxX = pageWidth - margin - totalBoxWidth

      doc.setFillColor(17, 24, 39) // bg-gray-900
      doc.roundedRect(totalBoxX, yPos, totalBoxWidth, totalBoxHeight, 3, 3, "F")

      doc.setTextColor(255, 255, 255)
      doc.setFont("helvetica", "bold")
      doc.setFontSize(16)
      doc.text("TOTAL:", totalBoxX + 10, yPos + 16)
      doc.text(`$${generatedInvoice.total}`, totalBoxX + totalBoxWidth - 10, yPos + 16, { align: "right" })

      yPos += totalBoxHeight + 20

      // ===== PAYMENT TERMS (matches on-screen) =====
      // Check if we need a new page
      if (yPos > 230) {
        doc.addPage()
        yPos = 30
      }

      // Gray background for terms section
      doc.setFillColor(249, 250, 251)
      doc.rect(margin, yPos - 5, contentWidth, 45, "F")
      doc.setDrawColor(229, 231, 235)
      doc.rect(margin, yPos - 5, contentWidth, 45, "S")

      doc.setTextColor(31, 41, 55)
      doc.setFontSize(10)
      doc.setFont("helvetica", "bold")
      doc.text(isQuote ? "Terms & Conditions:" : "Payment Terms:", margin + 5, yPos + 3)

      doc.setFont("helvetica", "normal")
      doc.setFontSize(8)
      doc.setTextColor(75, 85, 99)
      const terms = isQuote
        ? [
            "This quote is valid for 24 hours from the date above",
            "Prices are subject to change after expiration",
            `Please reference quote #${generatedInvoice.invoiceNumber} when placing order`,
            "Thank you for your interest!",
          ]
        : [
            "Payment due within 30 days of invoice date",
            "Late payments subject to 1.5% monthly service charge",
            "Please include invoice number with payment",
            "Thank you for your business!",
          ]
      terms.forEach((term, i) => {
        doc.text(`\u2022  ${term}`, margin + 8, yPos + 12 + i * 6)
      })

      yPos += 55

      // ===== FOOTER (dark bar, matches on-screen) =====
      if (yPos > 260) {
        doc.addPage()
        yPos = 260
      }
      const footerY = Math.max(yPos, 270)
      doc.setFillColor(31, 41, 55) // bg-gray-800
      doc.rect(0, footerY, pageWidth, 27, "F")

      doc.setTextColor(255, 255, 255)
      doc.setFont("helvetica", "normal")
      doc.setFontSize(8)
      doc.text(
        `Thank you for choosing ${generatedInvoice.companyInfo.name}. We appreciate your business!`,
        pageWidth / 2,
        footerY + 10,
        { align: "center" },
      )
      doc.setTextColor(209, 213, 219) // text-gray-300
      doc.text(
        `For questions about this invoice, please contact us at ${generatedInvoice.companyInfo.phone}`,
        pageWidth / 2,
        footerY + 18,
        { align: "center" },
      )

      doc.save(`${isQuote ? "Quote" : "Invoice"}_${generatedInvoice.invoiceNumber}.pdf`)
      toast.success(`${isQuote ? "Quote" : "Invoice"} PDF downloaded!`)
    }
  }

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">{documentType === "invoice" ? "Invoice" : "Quote"} Generator</h1>
          <TimestampClock />
        </div>
        <div className="flex gap-2">
          <Button onClick={fillDemoData} variant="outline" className="border-amber-300 text-amber-700 hover:bg-amber-50">Demo</Button>
          <Button onClick={saveDraft} variant="outline">Save Draft</Button>
          <Button onClick={clearInvoice}>New {documentType === "invoice" ? "Invoice" : "Quote"}</Button>
        </div>
      </div>

      {/* Document Type Toggle */}
      <div className="mb-6 flex gap-3">
        <button
          onClick={() => setDocumentType("invoice")}
          className={`px-5 py-2 rounded-md font-semibold text-sm transition-colors ${
            documentType === "invoice"
              ? "bg-green-600 text-white"
              : "bg-gray-100 text-gray-500 border border-gray-200"
          }`}
        >
          Invoice
        </button>
        <button
          onClick={() => setDocumentType("quote")}
          className={`px-5 py-2 rounded-md font-semibold text-sm transition-colors ${
            documentType === "quote"
              ? "bg-blue-600 text-white"
              : "bg-gray-100 text-gray-500 border border-gray-200"
          }`}
        >
          Quote
        </button>
      </div>

      {/* Company Information - Auto-filled */}
      <div className="mb-6 bg-gray-50 border border-gray-200 rounded-lg p-4">
        <h2 className="text-xl font-semibold mb-2">Your Company</h2>
        <div className="flex flex-wrap gap-6 text-gray-700">
          <p className="font-bold text-lg">{MY_COMPANY.name}</p>
          <p>{MY_COMPANY.phone}</p>
          <p>{MY_COMPANY.address}</p>
        </div>
      </div>

      {/* Customer Information with Dropdowns */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-4">Customer Information</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="customerName">Customer Name</Label>
            <Select value={customerName} onValueChange={setCustomerName}>
              <SelectTrigger>
                <SelectValue placeholder="Select or type customer name" />
              </SelectTrigger>
              <SelectContent>
                {savedCustomerNames.map((name, index) => (
                  <SelectItem key={index} value={name}>
                    {name}
                  </SelectItem>
                ))}
                <SelectItem value="__custom__">Type new customer...</SelectItem>
              </SelectContent>
            </Select>
            {(customerName === "__custom__" || !savedCustomerNames.includes(customerName)) && (
              <Input
                className="mt-2"
                value={customerName === "__custom__" ? "" : customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Enter customer name"
              />
            )}
          </div>
          <div>
            <Label htmlFor="projectName">Project Name</Label>
            <Select value={projectName} onValueChange={setProjectName}>
              <SelectTrigger>
                <SelectValue placeholder="Select or type project name" />
              </SelectTrigger>
              <SelectContent>
                {savedProjectNames.map((name, index) => (
                  <SelectItem key={index} value={name}>
                    {name}
                  </SelectItem>
                ))}
                <SelectItem value="__custom__">Type new project...</SelectItem>
              </SelectContent>
            </Select>
            {(projectName === "__custom__" || !savedProjectNames.includes(projectName)) && (
              <Input
                className="mt-2"
                value={projectName === "__custom__" ? "" : projectName}
                onChange={(e) => setProjectName(e.target.value)}
                placeholder="Enter project name"
              />
            )}
          </div>
          <div>
            <Label htmlFor="customerEmail">Customer Email</Label>
            <Select value={customerEmail} onValueChange={setCustomerEmail}>
              <SelectTrigger>
                <SelectValue placeholder="Select or type customer email" />
              </SelectTrigger>
              <SelectContent>
                {savedCustomerEmails.map((email, index) => (
                  <SelectItem key={index} value={email}>
                    {email}
                  </SelectItem>
                ))}
                <SelectItem value="__custom__">Type new email...</SelectItem>
              </SelectContent>
            </Select>
            {(customerEmail === "__custom__" || !savedCustomerEmails.includes(customerEmail)) && (
              <Input
                className="mt-2"
                type="email"
                value={customerEmail === "__custom__" ? "" : customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
                placeholder="Enter customer email"
              />
            )}
          </div>
        </div>
      </div>

      {/* Invoice Details with Dropdown */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-4">{documentType === "invoice" ? "Invoice" : "Quote"} Details</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Next {documentType === "invoice" ? "Invoice" : "Quote"} Number</Label>
            <div className="bg-gray-100 border border-gray-200 rounded-md px-3 py-2 text-lg font-bold text-gray-800">
              #{nextInvoiceNumber}
            </div>
          </div>
          <div>
            <Label htmlFor="poNumber">PO Number</Label>
            <Select value={poNumber} onValueChange={setPoNumber}>
              <SelectTrigger>
                <SelectValue placeholder="Select or type PO number" />
              </SelectTrigger>
              <SelectContent>
                {savedPoNumbers.map((po, index) => (
                  <SelectItem key={index} value={po}>
                    {po}
                  </SelectItem>
                ))}
                <SelectItem value="__custom__">Type new PO number...</SelectItem>
              </SelectContent>
            </Select>
            {(poNumber === "__custom__" || !savedPoNumbers.includes(poNumber)) && (
              <Input
                className="mt-2"
                value={poNumber === "__custom__" ? "" : poNumber}
                onChange={(e) => setPoNumber(e.target.value)}
                placeholder="Enter PO number"
              />
            )}
          </div>
        </div>
      </div>

      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-4">Sheet Specifications</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="sheetSize">Sheet Size</Label>
            <Select
              value={sheetSize.custom ? "custom" : `${sheetSize.length}x${sheetSize.width}`}
              onValueChange={(value) => {
                if (value === "custom") {
                  setSheetSize({ ...customSheetSize, custom: true })
                } else {
                  const [length, width] = value.split("x").map(Number)
                  setSheetSize({ length, width, unit: "feet" })
                }
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select sheet size" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="5x10">5 ft x 10 ft</SelectItem>
                <SelectItem value="4x8">4 ft x 8 ft</SelectItem>
                <SelectItem value="5x12">5 ft x 12 ft</SelectItem>
                <SelectItem value="4x10">4 ft x 10 ft</SelectItem>
                <SelectItem value="4x12">4 ft x 12 ft</SelectItem>
                <SelectItem value="custom">Custom</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {sheetSize.custom && (
            <>
              <div>
                <Label htmlFor="customLength">Custom Length</Label>
                <div className="flex items-center space-x-2">
                  <Input
                    id="customLength"
                    type="number"
                    value={customSheetSize.length || ""}
                    onChange={(e) => {
                      const length = e.target.value === "" ? 0 : Number(e.target.value)
                      setCustomSheetSize((prev) => ({ ...prev, length }))
                      setSheetSize((prev) => ({ ...prev, length }))
                    }}
                    min="0"
                    step="0.01"
                    placeholder="Enter custom length"
                    className="w-24"
                  />
                  <Select
                    value={customSheetSize.unit}
                    onValueChange={(value: "inches" | "feet") => {
                      setCustomSheetSize((prev) => ({ ...prev, unit: value }))
                      setSheetSize((prev) => ({ ...prev, unit: value }))
                    }}
                  >
                    <SelectTrigger className="w-20">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="inches">in</SelectItem>
                      <SelectItem value="feet">ft</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label htmlFor="customWidth">Custom Width</Label>
                <div className="flex items-center space-x-2">
                  <Input
                    id="customWidth"
                    type="number"
                    value={customSheetSize.width || ""}
                    onChange={(e) => {
                      const width = e.target.value === "" ? 0 : Number(e.target.value)
                      setCustomSheetSize((prev) => ({ ...prev, width }))
                      setSheetSize((prev) => ({ ...prev, width }))
                    }}
                    min="0"
                    step="0.01"
                    placeholder="Enter custom width"
                    className="w-24"
                  />
                  <Select
                    value={customSheetSize.unit}
                    onValueChange={(value: "inches" | "feet") => {
                      setCustomSheetSize((prev) => ({ ...prev, unit: value }))
                      setSheetSize((prev) => ({ ...prev, unit: value }))
                    }}
                  >
                    <SelectTrigger className="w-20">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="inches">in</SelectItem>
                      <SelectItem value="feet">ft</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </>
          )}
          <div>
            <Label htmlFor="materialType">Material Type</Label>
            <Select value={materialType} onValueChange={setMaterialType}>
              <SelectTrigger>
                <SelectValue placeholder="Select material type" />
              </SelectTrigger>
              <SelectContent>
                {materialTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="sheetCost">Sheet Cost ($)</Label>
            <Input
              id="sheetCost"
              type="number"
              value={sheetCost}
              onChange={(e) => setSheetCost(e.target.value)}
              min="0"
              step="0.01"
              placeholder="Enter sheet cost"
            />
          </div>
          <div>
            <Label htmlFor="markupPercentage">Markup Percentage (%)</Label>
            <Input
              id="markupPercentage"
              type="number"
              value={markupPercentage}
              onChange={(e) => setMarkupPercentage(e.target.value)}
              min="0"
              max="100"
              step="0.1"
              placeholder="30.0"
            />
          </div>
        </div>
      </div>

      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-4">Line Items</h2>
        {lineItems.map((item, index) => (
          <div key={index} className="border border-gray-200 rounded-lg p-3 mb-3">
            <div className="flex items-end gap-2 mb-2">
              <div className="flex-grow">
                <Label htmlFor={`description-${index}`}>Description</Label>
                <Input
                  id={`description-${index}`}
                  value={item.description}
                  onChange={(e) => updateLineItem(index, "description", e.target.value)}
                  placeholder="Item description"
                />
              </div>
              <div className="w-28">
                <Label>Size Input</Label>
                <Select
                  value={item.inputMethod}
                  onValueChange={(value) => updateLineItem(index, "inputMethod", value as "dimensions" | "sqft")}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="dimensions">L x W</SelectItem>
                    <SelectItem value="sqft">Sq Ft</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button variant="destructive" size="icon" onClick={() => removeLineItem(index)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex items-end gap-2">
              {item.inputMethod === "dimensions" ? (
                <>
                  <div className="w-32 flex flex-col">
                    <Label htmlFor={`length-${index}`}>Length</Label>
                    <div className="flex">
                      <Input
                        id={`length-${index}`}
                        type="number"
                        value={item.length}
                        onChange={(e) => updateLineItem(index, "length", e.target.value)}
                        min="0"
                        step="0.001"
                        placeholder="0.000"
                        className="w-20"
                      />
                      <Select
                        value={item.lengthUnit}
                        onValueChange={(value) => updateLineItem(index, "lengthUnit", value as "inches" | "feet")}
                      >
                        <SelectTrigger className="w-16 ml-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="inches">in</SelectItem>
                          <SelectItem value="feet">ft</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="w-32 flex flex-col">
                    <Label htmlFor={`width-${index}`}>Width</Label>
                    <div className="flex">
                      <Input
                        id={`width-${index}`}
                        type="number"
                        value={item.width}
                        onChange={(e) => updateLineItem(index, "width", e.target.value)}
                        min="0"
                        step="0.001"
                        placeholder="0.000"
                        className="w-20"
                      />
                      <Select
                        value={item.widthUnit}
                        onValueChange={(value) => updateLineItem(index, "widthUnit", value as "inches" | "feet")}
                      >
                        <SelectTrigger className="w-16 ml-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="inches">in</SelectItem>
                          <SelectItem value="feet">ft</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </>
              ) : (
                <div className="w-40 flex flex-col">
                  <Label htmlFor={`sqft-${index}`}>Square Feet</Label>
                  <Input
                    id={`sqft-${index}`}
                    type="number"
                    value={item.sqft}
                    onChange={(e) => updateLineItem(index, "sqft", e.target.value)}
                    min="0"
                    step="0.01"
                    placeholder="Enter sq ft"
                  />
                </div>
              )}
              <div className="w-32">
                <Label htmlFor={`quantity-${index}`}>Quantity</Label>
                <div className="flex">
                  {item.quantityType === "dropdown" ? (
                    <Select value={item.quantity} onValueChange={(value) => updateLineItem(index, "quantity", value)}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select quantity" />
                      </SelectTrigger>
                      <SelectContent>
                        {[...Array(100)].map((_, i) => (
                          <SelectItem key={i + 1} value={(i + 1).toString()}>
                            {i + 1}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <Input
                      id={`quantity-${index}`}
                      type="number"
                      value={item.quantity}
                      onChange={(e) => updateLineItem(index, "quantity", e.target.value)}
                      min="1"
                      step="1"
                      placeholder="Enter quantity"
                    />
                  )}
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() =>
                      updateLineItem(index, "quantityType", item.quantityType === "dropdown" ? "manual" : "dropdown")
                    }
                    className="ml-2"
                  >
                    {item.quantityType === "dropdown" ? "✎" : "▼"}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ))}
        <Button onClick={addLineItem} className="mt-2">
          <PlusCircle className="mr-2 h-4 w-4" /> Add Line Item
        </Button>
      </div>

      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-4">Additional Costs</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="formingCost">Forming Cost ($)</Label>
            <Input
              id="formingCost"
              type="number"
              value={formingCost}
              onChange={(e) => setFormingCost(e.target.value)}
              min="0"
              step="0.01"
              placeholder="0.00"
            />
          </div>
          <div>
            <Label htmlFor="formingCostMethod">Forming Cost Application</Label>
            <Select
              value={formingCostMethod}
              onValueChange={(value) => setFormingCostMethod(value as "perItem" | "total")}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select application method" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="perItem">Per Item</SelectItem>
                <SelectItem value="total">Total</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-4">Plasma Cutting Costs</h2>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <Label htmlFor="plasmaCuttingMinutes">Runtime</Label>
            <div className="flex gap-1">
              <Input
                id="plasmaCuttingMinutes"
                type="number"
                value={plasmaCuttingMinutes}
                onChange={(e) => setPlasmaCuttingMinutes(e.target.value)}
                min="0"
                step="0.1"
                placeholder="0.0"
                className="flex-1"
              />
              <Select value={plasmaTimeUnit} onValueChange={(v) => setPlasmaTimeUnit(v as "minutes" | "hours")}>
                <SelectTrigger className="w-24">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="minutes">Min</SelectItem>
                  <SelectItem value="hours">Hrs</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <Label htmlFor="plasmaCostPerMinute">Cost per {plasmaTimeUnit === "hours" ? "Hour" : "Minute"} ($)</Label>
            <Input
              id="plasmaCostPerMinute"
              type="number"
              value={plasmaCostPerMinute}
              onChange={(e) => setPlasmaCostPerMinute(e.target.value)}
              min="0"
              step="0.01"
              placeholder="0.00"
            />
          </div>
          <div>
            <Label>Plasma Total</Label>
            <div className="bg-gray-100 border border-gray-200 rounded-md px-3 py-2 text-sm font-medium text-gray-700">
              ${calculatePlasmaCuttingCost().toFixed(2)}
            </div>
          </div>
        </div>
      </div>

      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-4">Labor Costs</h2>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <Label htmlFor="hourlyRate">Hourly Rate ($)</Label>
            <Input
              id="hourlyRate"
              type="number"
              value={hourlyRate}
              onChange={(e) => setHourlyRate(e.target.value)}
              min="0"
              step="0.01"
              placeholder="0.00"
            />
          </div>
          <div>
            <Label htmlFor="hoursWorked">Time Worked</Label>
            <div className="flex gap-1">
              <Input
                id="hoursWorked"
                type="number"
                value={hoursWorked}
                onChange={(e) => setHoursWorked(e.target.value)}
                min="0"
                step="0.1"
                placeholder="0.0"
                className="flex-1"
              />
              <Select value={laborTimeUnit} onValueChange={(v) => setLaborTimeUnit(v as "hours" | "minutes")}>
                <SelectTrigger className="w-24">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="hours">Hrs</SelectItem>
                  <SelectItem value="minutes">Min</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <Label>Labor Total</Label>
            <div className="bg-gray-100 border border-gray-200 rounded-md px-3 py-2 text-sm font-medium text-gray-700">
              ${calculateLaborCost().toFixed(2)}
            </div>
          </div>
        </div>
      </div>

      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-4">{documentType === "invoice" ? "Invoice" : "Quote"} Summary</h2>
        <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-2">
          <p className="text-lg">Material Cost: ${calculateMaterialCost().toFixed(2)}</p>
          <p className="text-lg">
            Total Forming Cost: $
            {formingCostMethod === "perItem"
              ? lineItems
                  .reduce(
                    (total, item) =>
                      total + (Number.parseFloat(formingCost) || 0) * (Number.parseFloat(item.quantity) || 0),
                    0,
                  )
                  .toFixed(2)
              : (Number.parseFloat(formingCost) || 0).toFixed(2)}
          </p>
          {calculatePlasmaCuttingCost() > 0 && (
            <p className="text-lg">Plasma Cutting Cost: ${calculatePlasmaCuttingCost().toFixed(2)}</p>
          )}
          {calculateLaborCost() > 0 && <p className="text-lg">Labor Cost: ${calculateLaborCost().toFixed(2)}</p>}
          <div className="border-t border-gray-300 pt-2 mt-2">
            <p className="text-2xl font-bold">Total: ${calculateTotal()}</p>
          </div>
          <div className="border-t-2 border-green-400 pt-3 mt-3 bg-green-50 rounded-lg p-4">
            <p className="text-sm text-green-700 font-medium">For Your Eyes Only - Not Shown on Invoice</p>
            <p className="text-2xl font-bold text-green-700">Net Profit: ${calculateNetProfit()}</p>
          </div>
        </div>
      </div>

      <div className="flex justify-end mb-6">
        <Button
          onClick={() => {
            console.log("Generate Invoice button clicked")
            generateInvoice()
          }}
          className={documentType === "invoice" ? "bg-green-600 hover:bg-green-700" : "bg-blue-600 hover:bg-blue-700"}
        >
          Generate {documentType === "invoice" ? "Invoice" : "Quote"}
        </Button>
      </div>

      {generatedInvoice && (
        <div className="border-2 border-gray-300 rounded-lg bg-white mt-8 shadow-lg max-w-4xl mx-auto">
          {/* Header Section */}
          <div className="bg-gray-50 p-6 border-b border-gray-200">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-4xl font-bold text-gray-800 mb-2">{generatedInvoice.companyInfo.name}</h1>
                <div className="text-gray-600 space-y-1">
                  <p className="flex items-center">
                    <span className="font-medium">📍</span> {generatedInvoice.companyInfo.address}
                  </p>
                  <p className="flex items-center">
                    <span className="font-medium">📞</span> {generatedInvoice.companyInfo.phone}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className={`${generatedInvoice.documentType === "quote" ? "bg-blue-600" : "bg-green-600"} text-white px-3 py-1.5 rounded-md mb-3 inline-block`}>
                  <h2 className="text-lg font-bold">{generatedInvoice.documentType === "quote" ? "QUOTE" : "INVOICE"}</h2>
                </div>
                <div className={`border-2 ${generatedInvoice.documentType === "quote" ? "border-blue-300" : "border-green-300"} rounded-lg p-3 space-y-2`}>
                  <div className="flex justify-between gap-4 text-sm">
                    <span className="font-bold text-gray-700">{generatedInvoice.documentType === "quote" ? "Quote" : "Invoice"} #:</span>
                    <span className="font-mono font-semibold text-gray-900">{generatedInvoice.invoiceNumber}</span>
                  </div>
                  <div className={`border-t ${generatedInvoice.documentType === "quote" ? "border-blue-200" : "border-green-200"}`} />
                  <div className="flex justify-between gap-4 text-sm">
                    <span className="font-bold text-gray-700">Date:</span>
                    <span className="text-gray-900">{new Date(generatedInvoice.date).toLocaleDateString()}</span>
                  </div>
                  <div className={`border-t ${generatedInvoice.documentType === "quote" ? "border-blue-200" : "border-green-200"}`} />
                  <div className="flex justify-between gap-4 text-sm">
                    <span className="font-bold text-gray-700">{generatedInvoice.documentType === "quote" ? "Valid Until:" : "Due Date:"}</span>
                    <span className="text-gray-900">{generatedInvoice.documentType === "quote"
                      ? new Date(new Date(generatedInvoice.date).getTime() + 24 * 60 * 60 * 1000).toLocaleDateString()
                      : new Date(new Date(generatedInvoice.date).getTime() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Customer Information */}
          <div className="p-6 border-b border-gray-200">
            <div className="grid grid-cols-1 gap-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-3 border-b border-gray-300 pb-1">Bill To:</h3>
                <div className="space-y-2 text-gray-700">
                  <p className="font-medium text-lg">{generatedInvoice.customerName}</p>
                  {generatedInvoice.projectName && (
                    <p>
                      <span className="font-medium">Project:</span> {generatedInvoice.projectName}
                    </p>
                  )}
                  {generatedInvoice.customerEmail && (
                    <p>
                      <span className="font-medium">Email:</span> {generatedInvoice.customerEmail}
                    </p>
                  )}
                  {generatedInvoice.poNumber && (
                    <p>
                      <span className="font-medium">PO Number:</span> {generatedInvoice.poNumber}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Line Items Table */}
          <div className="p-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Itemized {generatedInvoice.documentType === "quote" ? "Quote" : "Invoice"}</h3>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-gray-300">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border border-gray-300 px-3 py-4 text-left font-semibold text-gray-700 w-12">#</th>
                    <th className="border border-gray-300 px-4 py-4 text-left font-semibold text-gray-700 min-w-[250px]">
                      Description
                    </th>
                    <th className="border border-gray-300 px-4 py-4 text-center font-semibold text-gray-700 min-w-[150px]">
                      Dimensions / Sq Ft
                    </th>
                    <th className="border border-gray-300 px-3 py-4 text-center font-semibold text-gray-700 w-20">
                      Qty
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {generatedInvoice.lineItems.map((item: any, index: number) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="border border-gray-300 px-3 py-4 text-center font-medium">{index + 1}</td>
                      <td className="border border-gray-300 px-4 py-4 break-words">
                        {item.description || "Custom Part"}
                      </td>
                      <td className="border border-gray-300 px-4 py-4 text-center whitespace-nowrap">
                        {item.inputMethod === "sqft"
                          ? `${item.sqft} sq ft`
                          : `${item.length} ${item.lengthUnit} × ${item.width} ${item.widthUnit}`}
                      </td>
                      <td className="border border-gray-300 px-3 py-4 text-center">{item.quantity}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Total Section */}
          <div className="px-6 pb-6">
            <div className="flex justify-end">
              <div className="w-full max-w-lg">
                <div className="bg-gray-900 text-white p-8 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="text-2xl font-bold">TOTAL:</span>
                    <span className="text-3xl font-bold font-mono">${generatedInvoice.total}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Terms and Actions */}
          <div className="bg-gray-50 p-6 border-t border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-gray-800 mb-2">{generatedInvoice.documentType === "quote" ? "Terms & Conditions:" : "Payment Terms:"}</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  {generatedInvoice.documentType === "quote" ? (
                    <>
                      <li>This quote is valid for 24 hours from the date above</li>
                      <li>Prices are subject to change after expiration</li>
                      <li>Please reference quote #{generatedInvoice.invoiceNumber} when placing order</li>
                      <li>Thank you for your interest!</li>
                    </>
                  ) : (
                    <>
                      <li>Payment due within 30 days of invoice date</li>
                      <li>Late payments subject to 1.5% monthly service charge</li>
                      <li>Please include invoice number with payment</li>
                      <li>Thank you for your business!</li>
                    </>
                  )}
                </ul>
              </div>
              <div className="flex flex-col justify-center">
                <div className="flex justify-end space-x-4">
                  <Button onClick={handleShare} className={`flex items-center ${generatedInvoice.documentType === "quote" ? "bg-blue-600 hover:bg-blue-700" : "bg-green-600 hover:bg-green-700"}`}>
                    <Share2 className="mr-2 h-4 w-4" />
                    Share {generatedInvoice.documentType === "quote" ? "Quote" : "Invoice"}
                  </Button>
                  <Button onClick={generatePDF} className="flex items-center bg-gray-800 hover:bg-gray-900">
                    <Download className="mr-2 h-4 w-4" />
                    Download PDF
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="bg-gray-800 text-white p-4 text-center text-sm rounded-b-lg">
            <p>Thank you for choosing {generatedInvoice.companyInfo.name}. We appreciate your business!</p>
            <p className="mt-1 text-gray-300">
              For questions about this invoice, please contact us at {generatedInvoice.companyInfo.phone}
            </p>
          </div>
        </div>
      )}

      {/* Saved Drafts Section */}
      {savedDrafts.length > 0 && (
        <div className="mt-8">
          <h2 className="text-2xl font-bold mb-4">Saved Drafts</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {savedDrafts.map((draft) => (
              <div key={draft.id} className="border border-amber-200 bg-amber-50 p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-semibold text-gray-800 truncate flex-1">{draft.label}</h3>
                  <span className="text-xs bg-amber-200 text-amber-800 px-2 py-1 rounded font-medium ml-2">Draft</span>
                </div>
                {draft.companyInfo?.name && (
                  <p className="text-sm text-gray-600">Company: {draft.companyInfo.name}</p>
                )}
                <p className="text-sm text-gray-600">Material: {draft.materialType}</p>
                <p className="text-sm text-gray-600">Items: {draft.lineItems?.length || 0}</p>
                <p className="text-sm text-gray-500 mt-1">Saved: {new Date(draft.savedAt).toLocaleDateString()} {new Date(draft.savedAt).toLocaleTimeString()}</p>
                <div className="mt-3 flex gap-2">
                  <Button onClick={() => loadDraft(draft)} className="flex-1 bg-amber-600 hover:bg-amber-700">
                    Load & Edit
                  </Button>
                  <Button onClick={() => deleteDraft(draft.id)} variant="destructive" size="icon">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <RecentQuotes quotes={recentInvoices} onEdit={loadInvoiceForEdit} onDelete={deleteInvoice} />
    </div>
  )
}
