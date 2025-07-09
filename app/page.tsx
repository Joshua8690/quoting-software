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
}

interface SheetSize {
  length: number
  width: number
  unit: "inches" | "feet"
  custom?: boolean
}

interface SavedCompany {
  name: string
  phone: string
  address: string
}

const materialTypes = ["Mild Steel", "Stainless Steel", "Aluminum", "Galvanized"]

export default function InvoicePage() {
  const [companyInfo, setCompanyInfo] = useState({
    name: "",
    phone: "",
    address: "",
  })
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

  // Saved data states
  const [savedCompanies, setSavedCompanies] = useState<SavedCompany[]>([])
  const [savedCustomerNames, setSavedCustomerNames] = useState<string[]>([])
  const [savedProjectNames, setSavedProjectNames] = useState<string[]>([])
  const [savedCustomerEmails, setSavedCustomerEmails] = useState<string[]>([])
  const [savedPoNumbers, setSavedPoNumbers] = useState<string[]>([])

  // Load saved data on component mount
  useEffect(() => {
    const loadSavedData = () => {
      const companies = localStorage.getItem("savedCompanies")
      const customerNames = localStorage.getItem("savedCustomerNames")
      const projectNames = localStorage.getItem("savedProjectNames")
      const customerEmails = localStorage.getItem("savedCustomerEmails")
      const poNumbers = localStorage.getItem("savedPoNumbers")

      if (companies) setSavedCompanies(JSON.parse(companies))
      if (customerNames) setSavedCustomerNames(JSON.parse(customerNames))
      if (projectNames) setSavedProjectNames(JSON.parse(projectNames))
      if (customerEmails) setSavedCustomerEmails(JSON.parse(customerEmails))
      if (poNumbers) setSavedPoNumbers(JSON.parse(poNumbers))
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

  // Add unique company
  const addUniqueCompany = (companies: SavedCompany[], company: SavedCompany): SavedCompany[] => {
    if (!company.name.trim()) return companies
    const filtered = companies.filter((existing) => existing.name !== company.name)
    return [company, ...filtered].slice(0, 10) // Keep only 10 most recent
  }

  // Generate sequential invoice number
  const generateInvoiceNumber = () => {
    const storedCounter = localStorage.getItem("invoiceCounter")
    const currentCounter = storedCounter ? Number.parseInt(storedCounter) + 1 : 1
    localStorage.setItem("invoiceCounter", currentCounter.toString())
    return currentCounter.toString()
  }

  const clearInvoice = () => {
    setCompanyInfo({ name: "", phone: "", address: "" })
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

  const updateCompanyInfo = (field: string, value: string) => {
    setCompanyInfo((prev) => ({ ...prev, [field]: value }))
  }

  // Handle company selection from dropdown
  const handleCompanySelect = (companyName: string) => {
    const selectedCompany = savedCompanies.find((company) => company.name === companyName)
    if (selectedCompany) {
      setCompanyInfo(selectedCompany)
    } else {
      setCompanyInfo((prev) => ({ ...prev, name: companyName }))
    }
  }

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
    const sheetArea =
      sheetSize.unit === "feet"
        ? sheetSize.length * sheetSize.width * 144 // sheet size in square inches
        : sheetSize.length * sheetSize.width // sheet size already in square inches
    const sheetCostValue = Number.parseFloat(sheetCost) || 0
    const partLength = item.lengthUnit === "feet" ? Number.parseFloat(item.length) * 12 : Number.parseFloat(item.length)
    const partWidth = item.widthUnit === "feet" ? Number.parseFloat(item.width) * 12 : Number.parseFloat(item.width)
    const partArea = partLength * partWidth
    const partsPerSheet = Math.floor(sheetArea / partArea) || 1 // Prevent division by zero
    const costPerPart = sheetCostValue / partsPerSheet
    return costPerPart * Number.parseFloat(item.quantity)
  }

  const calculatePlasmaCuttingCost = () => {
    const minutes = Number.parseFloat(plasmaCuttingMinutes) || 0
    const costPerMinute = Number.parseFloat(plasmaCostPerMinute) || 0
    return minutes * costPerMinute
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

  const calculateLaborCost = () => {
    const rate = Number.parseFloat(hourlyRate)
    const hours = Number.parseFloat(hoursWorked)
    return !isNaN(rate) && !isNaN(hours) ? rate * hours : 0
  }

  const generateInvoice = () => {
    try {
      console.group("%cInvoice Generation Started", "color: #0070f3; font-size: 14px; font-weight: bold;")
      console.time("Invoice Generation Time")

      // Save current entries to localStorage
      if (companyInfo.name.trim()) {
        const updatedCompanies = addUniqueCompany(savedCompanies, companyInfo)
        setSavedCompanies(updatedCompanies)
        saveToLocalStorage("savedCompanies", updatedCompanies)
      }

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
        invoiceNumber,
        companyInfo,
        customerName,
        projectName,
        sheetSize,
        materialType,
        lineItems: lineItems.map((item) => ({
          ...item,
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

      // Set up colors and fonts
      const primaryColor = [0, 112, 243] // Blue
      const darkGray = [64, 64, 64]
      const lightGray = [128, 128, 128]

      // Header Section
      doc.setFillColor(...primaryColor)
      doc.rect(0, 0, 210, 40, "F")

      // Company Name
      doc.setTextColor(255, 255, 255)
      doc.setFontSize(24)
      doc.setFont("helvetica", "bold")
      doc.text(generatedInvoice.companyInfo.name, 20, 25)

      // Invoice Title
      doc.setFontSize(16)
      doc.text("INVOICE", 170, 25)

      // Company Details
      doc.setTextColor(...darkGray)
      doc.setFontSize(10)
      doc.setFont("helvetica", "normal")
      doc.text(generatedInvoice.companyInfo.address, 20, 50)
      doc.text(generatedInvoice.companyInfo.phone, 20, 58)

      // Invoice Details (Right side)
      doc.setFont("helvetica", "bold")
      doc.text("Invoice #:", 140, 50)
      doc.text("Date:", 140, 58)
      doc.text("Due Date:", 140, 66)

      doc.setFont("helvetica", "normal")
      doc.text(generatedInvoice.invoiceNumber, 165, 50)
      doc.text(new Date(generatedInvoice.date).toLocaleDateString(), 165, 58)
      doc.text(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString(), 165, 66)

      // Customer Information
      doc.setFont("helvetica", "bold")
      doc.setFontSize(12)
      doc.text("Bill To:", 20, 85)

      doc.setFont("helvetica", "normal")
      doc.setFontSize(10)
      let customerYPos = 95
      doc.text(generatedInvoice.customerName, 20, customerYPos)
      customerYPos += 8

      // Only show project if it exists
      if (generatedInvoice.projectName && generatedInvoice.projectName.trim()) {
        doc.text(`Project: ${generatedInvoice.projectName}`, 20, customerYPos)
        customerYPos += 8
      }

      if (generatedInvoice.customerEmail) {
        doc.text(`Email: ${generatedInvoice.customerEmail}`, 20, customerYPos)
        customerYPos += 8
      }
      if (generatedInvoice.poNumber) {
        doc.text(`PO Number: ${generatedInvoice.poNumber}`, 20, customerYPos)
        customerYPos += 8
      }

      // Line Items Table (start after customer info)
      let yPos = Math.max(customerYPos + 20, 140)

      // Table Header
      doc.setFillColor(240, 240, 240)
      doc.rect(20, yPos - 8, 170, 12, "F")

      doc.setFont("helvetica", "bold")
      doc.setFontSize(9)
      doc.text("#", 25, yPos)
      doc.text("Description", 35, yPos)
      doc.text("Dimensions", 90, yPos)
      doc.text("Qty", 130, yPos)
      doc.text("Unit Price", 145, yPos)
      doc.text("Total", 175, yPos)

      // Table Lines
      doc.setDrawColor(...lightGray)
      doc.line(20, yPos + 2, 190, yPos + 2)

      yPos += 15

      // Line Items
      doc.setFont("helvetica", "normal")
      doc.setFontSize(8)

      let subtotal = 0
      generatedInvoice.lineItems.forEach((item: any, index: number) => {
        const unitPrice = (Number.parseFloat(item.cost) / Number.parseFloat(item.quantity)).toFixed(2)
        subtotal += Number.parseFloat(item.cost)

        doc.text((index + 1).toString(), 25, yPos)
        doc.text(item.description || "Custom Part", 35, yPos)
        doc.text(`${item.length} ${item.lengthUnit} × ${item.width} ${item.widthUnit}`, 90, yPos)
        doc.text(item.quantity, 130, yPos)
        doc.text(`$${unitPrice}`, 145, yPos)
        doc.text(`$${item.cost}`, 175, yPos)

        yPos += 10

        // Add new page if needed
        if (yPos > 250) {
          doc.addPage()
          yPos = 30
        }
      })

      // Table bottom line
      doc.line(20, yPos, 190, yPos)
      yPos += 20

      // Cost Breakdown - Large centered section with dark styling
      yPos += 10

      // Calculate the width and position for a large centered box
      const boxWidth = 120
      const boxX = (210 - boxWidth) / 2 // Center horizontally
      const boxHeight = 90 // Larger height

      // Draw main border with dark styling
      doc.setFillColor(45, 55, 72) // Dark blue-gray background
      doc.rect(boxX, yPos, boxWidth, boxHeight, "F")

      // Draw border outline
      doc.setDrawColor(30, 41, 59) // Even darker border
      doc.setLineWidth(2)
      doc.rect(boxX, yPos, boxWidth, boxHeight, "S")

      // Title
      doc.setTextColor(255, 255, 255) // White text
      doc.setFont("helvetica", "bold")
      doc.setFontSize(14)
      doc.text("COST BREAKDOWN", boxX + boxWidth / 2, yPos + 15, { align: "center" })

      // Draw line under title
      doc.setDrawColor(255, 255, 255)
      doc.setLineWidth(1)
      doc.line(boxX + 10, yPos + 18, boxX + boxWidth - 10, yPos + 18)

      doc.setFont("helvetica", "normal")
      doc.setFontSize(10)
      let itemYPos = yPos + 28

      // Subtotal
      const subtotalWithMarkup = lineItems.reduce((total, item) => {
        const itemCost = calculatePartCost(item)
        return isNaN(itemCost) ? total : total + itemCost
      }, 0)
      doc.text("Subtotal (Materials):", boxX + 10, itemYPos)
      doc.text(`$${subtotalWithMarkup.toFixed(2)}`, boxX + boxWidth - 10, itemYPos, { align: "right" })
      itemYPos += 8

      // Labor Cost (including markup)
      if (generatedInvoice.laborCost) {
        const markupAmount = subtotalWithMarkup * (Number.parseFloat(markupPercentage) / 100 || 0)
        const laborAmount = Number.parseFloat(generatedInvoice.laborCost || "0")
        const totalLaborWithMarkup = laborAmount + markupAmount

        doc.text("Labor:", boxX + 10, itemYPos)
        doc.text(`$${totalLaborWithMarkup.toFixed(2)}`, boxX + boxWidth - 10, itemYPos, { align: "right" })
        itemYPos += 8
      }

      // Total section with special styling
      doc.setDrawColor(255, 255, 255)
      doc.setLineWidth(2)
      doc.line(boxX + 10, itemYPos + 5, boxX + boxWidth - 10, itemYPos + 5)

      doc.setFont("helvetica", "bold")
      doc.setFontSize(16)
      doc.text("TOTAL:", boxX + 10, itemYPos + 18)
      doc.text(`$${generatedInvoice.total}`, boxX + boxWidth - 10, itemYPos + 18, { align: "right" })

      // Update yPos to continue after the box
      yPos = yPos + boxHeight + 20

      // Payment Terms with border
      yPos += 25
      doc.setFont("helvetica", "bold")
      doc.setFontSize(12)
      doc.text("Payment Terms:", 20, yPos)

      // Draw border around payment terms
      doc.setDrawColor(...lightGray)
      doc.rect(20, yPos + 5, 170, 35, "S")

      doc.setFont("helvetica", "normal")
      doc.setFontSize(9)
      yPos += 15
      const terms = [
        "• Net 30 days from invoice date",
        "• 2% discount if paid within 10 days",
        "• 1.5% monthly service charge on overdue accounts",
        "• All work performed and materials furnished according to specifications",
        "• Thank you for your business!",
      ]

      terms.forEach((term) => {
        doc.text(term, 25, yPos)
        yPos += 6
      })

      // Footer
      yPos += 15
      doc.setFillColor(...darkGray)
      doc.rect(0, yPos, 210, 25, "F")

      doc.setTextColor(255, 255, 255)
      doc.setFont("helvetica", "normal")
      doc.setFontSize(9)
      doc.text(
        `Thank you for choosing ${generatedInvoice.companyInfo.name}. We appreciate your business!`,
        20,
        yPos + 10,
      )
      doc.text(
        `For questions about this invoice, please contact us at ${generatedInvoice.companyInfo.phone}`,
        20,
        yPos + 18,
      )

      // Save the PDF
      doc.save(`Invoice_${generatedInvoice.invoiceNumber}.pdf`)
      toast.success("Professional invoice PDF generated and downloaded!")
    }
  }

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Invoice Generator</h1>
          <TimestampClock />
        </div>
        <Button onClick={clearInvoice}>New Invoice</Button>
      </div>

      {/* Company Information with Dropdowns */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-4">Company Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="companyName">Company Name</Label>
            <Select value={companyInfo.name} onValueChange={handleCompanySelect}>
              <SelectTrigger>
                <SelectValue placeholder="Select or type company name" />
              </SelectTrigger>
              <SelectContent>
                {savedCompanies.map((company, index) => (
                  <SelectItem key={index} value={company.name}>
                    {company.name} ({company.phone})
                  </SelectItem>
                ))}
                <SelectItem value="__custom__">Type new company...</SelectItem>
              </SelectContent>
            </Select>
            {(companyInfo.name === "__custom__" || !savedCompanies.find((c) => c.name === companyInfo.name)) && (
              <Input
                className="mt-2"
                value={companyInfo.name === "__custom__" ? "" : companyInfo.name}
                onChange={(e) => updateCompanyInfo("name", e.target.value)}
                placeholder="Enter company name"
              />
            )}
          </div>
          <div>
            <Label htmlFor="companyPhone">Phone Number</Label>
            <Input
              id="companyPhone"
              value={companyInfo.phone}
              onChange={(e) => updateCompanyInfo("phone", e.target.value)}
              placeholder="Enter phone number"
            />
          </div>
          <div>
            <Label htmlFor="companyAddress">Address</Label>
            <Input
              id="companyAddress"
              value={companyInfo.address}
              onChange={(e) => updateCompanyInfo("address", e.target.value)}
              placeholder="Enter company address"
            />
          </div>
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
        <h2 className="text-xl font-semibold mb-4">Invoice Details</h2>
        <div className="grid grid-cols-2 gap-4">
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
          <div key={index} className="flex items-end gap-2 mb-2">
            <div className="flex-grow">
              <Label htmlFor={`description-${index}`}>Description</Label>
              <Input
                id={`description-${index}`}
                value={item.description}
                onChange={(e) => updateLineItem(index, "description", e.target.value)}
                placeholder="Item description"
              />
            </div>
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
            <Button variant="destructive" size="icon" onClick={() => removeLineItem(index)}>
              <Trash2 className="h-4 w-4" />
            </Button>
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
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="plasmaCuttingMinutes">Runtime (Minutes)</Label>
            <Input
              id="plasmaCuttingMinutes"
              type="number"
              value={plasmaCuttingMinutes}
              onChange={(e) => setPlasmaCuttingMinutes(e.target.value)}
              min="0"
              step="0.1"
              placeholder="0.0"
            />
          </div>
          <div>
            <Label htmlFor="plasmaCostPerMinute">Cost per Minute ($)</Label>
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
        </div>
      </div>

      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-4">Labor Costs</h2>
        <div className="grid grid-cols-2 gap-4">
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
            <Label htmlFor="hoursWorked">Hours Worked</Label>
            <Input
              id="hoursWorked"
              type="number"
              value={hoursWorked}
              onChange={(e) => setHoursWorked(e.target.value)}
              min="0"
              step="0.1"
              placeholder="0.0"
            />
          </div>
        </div>
      </div>

      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-4">Invoice Summary</h2>
        <p className="text-lg">Subtotal: ${calculateTotal()}</p>
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
            : formingCost}
        </p>
        {calculatePlasmaCuttingCost() > 0 && (
          <p className="text-lg">Plasma Cutting Cost: ${calculatePlasmaCuttingCost().toFixed(2)}</p>
        )}
        {calculateLaborCost() > 0 && <p className="text-lg">Labor Cost: ${calculateLaborCost().toFixed(2)}</p>}
        <p className="text-2xl font-bold">Total: ${calculateTotal()}</p>
      </div>

      <div className="flex justify-end mb-6">
        <Button
          onClick={() => {
            console.log("Generate Invoice button clicked")
            generateInvoice()
          }}
        >
          Generate Invoice
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
                <div className="bg-blue-600 text-white px-4 py-2 rounded-lg mb-3">
                  <h2 className="text-2xl font-bold">INVOICE</h2>
                </div>
                <div className="text-sm text-gray-600 space-y-1">
                  <p>
                    <span className="font-medium">Invoice #:</span> {generatedInvoice.invoiceNumber}
                  </p>
                  <p>
                    <span className="font-medium">Date:</span> {new Date(generatedInvoice.date).toLocaleDateString()}
                  </p>
                  <p>
                    <span className="font-medium">Due Date:</span>{" "}
                    {new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString()}
                  </p>
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
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Itemized Invoice</h3>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-gray-300">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border border-gray-300 px-3 py-4 text-left font-semibold text-gray-700 w-12">#</th>
                    <th className="border border-gray-300 px-4 py-4 text-left font-semibold text-gray-700 min-w-[200px]">
                      Description
                    </th>
                    <th className="border border-gray-300 px-4 py-4 text-center font-semibold text-gray-700 min-w-[120px]">
                      Dimensions
                    </th>
                    <th className="border border-gray-300 px-3 py-4 text-center font-semibold text-gray-700 w-16">
                      Qty
                    </th>
                    <th className="border border-gray-300 px-4 py-4 text-right font-semibold text-gray-700 min-w-[100px]">
                      Unit Price
                    </th>
                    <th className="border border-gray-300 px-4 py-4 text-right font-semibold text-gray-700 min-w-[100px]">
                      Total
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
                        {item.length} {item.lengthUnit} × {item.width} {item.widthUnit}
                      </td>
                      <td className="border border-gray-300 px-3 py-4 text-center">{item.quantity}</td>
                      <td className="border border-gray-300 px-4 py-4 text-right font-mono">
                        ${(Number.parseFloat(item.cost) / Number.parseFloat(item.quantity)).toFixed(2)}
                      </td>
                      <td className="border border-gray-300 px-4 py-4 text-right font-medium font-mono">
                        ${item.cost}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Cost Breakdown */}
          <div className="px-6 pb-6">
            <div className="flex justify-end">
              <div className="w-full max-w-lg">
                <div className="bg-gray-50 p-6 rounded-lg border">
                  <h4 className="font-semibold text-gray-800 mb-4 border-b border-gray-300 pb-2">Cost Breakdown</h4>

                  {/* Subtotal */}
                  <div className="flex justify-between py-3 text-gray-700 border-b border-gray-200">
                    <span className="font-medium">Subtotal (Materials):</span>
                    <span className="font-mono">
                      $
                      {lineItems
                        .reduce((total, item) => {
                          const itemCost = calculatePartCost(item)
                          return isNaN(itemCost) ? total : total + itemCost
                        }, 0)
                        .toFixed(2)}
                    </span>
                  </div>

                  {/* Markup */}
                  <div className="flex justify-between py-3 text-gray-700 border-b border-gray-200">
                    <span className="font-medium">Markup ({markupPercentage}%):</span>
                    <span className="font-mono">
                      $
                      {(
                        lineItems.reduce((total, item) => {
                          const itemCost = calculatePartCost(item)
                          return isNaN(itemCost) ? total : total + itemCost
                        }, 0) * (Number.parseFloat(markupPercentage) / 100 || 0)
                      ).toFixed(2)}
                    </span>
                  </div>

                  {/* Forming Cost */}
                  {Number(generatedInvoice.totalFormingCost) > 0 && (
                    <div className="flex justify-between items-start py-3 text-gray-700 border-b border-gray-200">
                      <div className="flex flex-col pr-4">
                        <span className="font-medium">Forming Cost:</span>
                        <span className="text-sm text-gray-500 break-words">
                          ({generatedInvoice.formingCostMethod === "perItem" ? "Per Item" : "Total"})
                        </span>
                      </div>
                      <span className="font-mono text-right">${generatedInvoice.totalFormingCost}</span>
                    </div>
                  )}

                  {/* Plasma Cutting Cost */}
                  {generatedInvoice.plasmaCuttingCost && (
                    <div className="flex justify-between items-start py-3 text-gray-700 border-b border-gray-200">
                      <div className="flex flex-col pr-4">
                        <span className="font-medium">Plasma Cutting:</span>
                        <span className="text-sm text-gray-500 break-words">
                          ({generatedInvoice.plasmaCuttingMinutes}min @ ${generatedInvoice.plasmaCostPerMinute}/min)
                        </span>
                      </div>
                      <span className="font-mono text-right">${generatedInvoice.plasmaCuttingCost}</span>
                    </div>
                  )}

                  {/* Labor Cost */}
                  {generatedInvoice.laborCost && (
                    <div className="flex justify-between items-start py-3 text-gray-700 border-b border-gray-200">
                      <div className="flex flex-col pr-4">
                        <span className="font-medium">Labor:</span>
                        <span className="text-sm text-gray-500 break-words">
                          ({generatedInvoice.hoursWorked}hrs @ ${generatedInvoice.hourlyRate}/hr)
                        </span>
                      </div>
                      <span className="font-mono text-right">${generatedInvoice.laborCost}</span>
                    </div>
                  )}

                  {/* Total */}
                  <div className="border-t-2 border-gray-400 mt-4 pt-4">
                    <div className="flex justify-between py-2 text-xl font-bold text-gray-800">
                      <span>TOTAL:</span>
                      <span className="font-mono text-2xl">${generatedInvoice.total}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Terms and Actions */}
          <div className="bg-gray-50 p-6 border-t border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-gray-800 mb-2">Payment Terms:</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Payment due within 30 days of invoice date</li>
                  <li>• Late payments subject to 1.5% monthly service charge</li>
                  <li>• Please include invoice number with payment</li>
                  <li>• Thank you for your business!</li>
                </ul>
              </div>
              <div className="flex flex-col justify-center">
                <div className="flex justify-end space-x-4">
                  <Button onClick={handleShare} className="flex items-center bg-blue-600 hover:bg-blue-700">
                    <Share2 className="mr-2 h-4 w-4" />
                    Share Invoice
                  </Button>
                  <Button onClick={generatePDF} className="flex items-center bg-green-600 hover:bg-green-700">
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

      <RecentQuotes quotes={recentInvoices} />
    </div>
  )
}
