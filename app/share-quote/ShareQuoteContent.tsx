"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"
import jsPDF from "jspdf"

export default function ShareQuoteContent() {
  const [quote, setQuote] = useState<any>(null)
  const searchParams = useSearchParams()

  useEffect(() => {
    const quoteData = searchParams.get("data")
    if (quoteData) {
      try {
        const decodedQuote = JSON.parse(decodeURIComponent(quoteData))
        setQuote(decodedQuote)
      } catch (error) {
        console.error("Error parsing quote data:", error)
      }
    }
  }, [searchParams])

  const generatePDF = () => {
    if (quote) {
      const doc = new jsPDF()

      // Add company info
      doc.setFontSize(18)
      doc.text(quote.companyInfo.name, 20, 20)
      doc.setFontSize(12)
      doc.text(quote.companyInfo.address, 20, 30)
      doc.text(quote.companyInfo.phone, 20, 40)

      // Add quote details
      doc.setFontSize(14)
      doc.text(`Quote for ${quote.customerName}`, 20, 60)
      doc.text(`Project: ${quote.projectName}`, 20, 70)
      doc.text(`Date: ${new Date(quote.date).toLocaleDateString()}`, 20, 80)

      // Add line items
      doc.setFontSize(12)
      let yPos = 100
      quote.lineItems.forEach((item: any, index: number) => {
        doc.text(`${index + 1}. ${item.description}`, 20, yPos)
        doc.text(`${item.length} ${item.lengthUnit} x ${item.width} ${item.widthUnit}`, 100, yPos)
        doc.text(`Qty: ${item.quantity}`, 150, yPos)
        doc.text(`$${item.cost}`, 180, yPos)
        yPos += 10
      })

      // Add total
      doc.setFontSize(14)
      doc.text(`Total: $${quote.total}`, 150, yPos + 20)

      // Save the PDF
      doc.save(`Quote_${quote.projectName}.pdf`)
    }
  }

  if (!quote) {
    return <div>Loading quote...</div>
  }

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <div className="border p-8 rounded-lg bg-white mt-8 shadow-md">
        <div className="flex justify-between items-start mb-8">
          <div>
            <h2 className="text-3xl font-bold mb-2">{quote.companyInfo.name}</h2>
            <p>{quote.companyInfo.address}</p>
            <p>{quote.companyInfo.phone}</p>
          </div>
          <div className="text-right">
            <h3 className="text-xl font-semibold mb-2">Quote</h3>
            <p>Date: {new Date(quote.date).toLocaleDateString()}</p>
          </div>
        </div>

        <div className="mb-8">
          <h3 className="text-xl font-semibold mb-2">Customer Information</h3>
          <p>
            <strong>Name:</strong> {quote.customerName}
          </p>
          {quote.projectName && (
            <p>
              <strong>Project:</strong> {quote.projectName}
            </p>
          )}
        </div>

        <div className="mb-8">
          <h3 className="text-xl font-semibold mb-4">Line Items</h3>
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2">Description</th>
                <th className="text-left py-2">Dimensions</th>
                <th className="text-left py-2">Quantity</th>
                <th className="text-right py-2">Price</th>
              </tr>
            </thead>
            <tbody>
              {quote.lineItems.map((item: any, index: number) => (
                <tr key={index} className="border-b">
                  <td className="py-2">{item.description}</td>
                  <td className="py-2">
                    {item.length} {item.lengthUnit} x {item.width} {item.widthUnit}
                  </td>
                  <td className="py-2">{item.quantity}</td>
                  <td className="text-right py-2">${item.cost}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {Number(quote.totalFormingCost) > 0 && (
          <div className="mb-4">
            <h3 className="text-xl font-semibold mb-2">Additional Costs</h3>
            <p>
              <strong>Total Forming Cost:</strong> ${quote.totalFormingCost}
            </p>
            <p>
              <strong>Forming Cost Method:</strong> {quote.formingCostMethod === "perItem" ? "Per Item" : "Total"}
            </p>
          </div>
        )}
        {quote.laborCost && (
          <div className="mb-4">
            <h3 className="text-xl font-semibold mb-2">Labor Cost</h3>
            <p>
              <strong>Hourly Rate:</strong> ${quote.hourlyRate}
            </p>
            <p>
              <strong>Hours Worked:</strong> {quote.hoursWorked}
            </p>
            <p>
              <strong>Total Labor Cost:</strong> ${quote.laborCost}
            </p>
          </div>
        )}
        {quote.poNumber && (
          <div className="mb-4">
            <p>
              <strong>PO Number:</strong> {quote.poNumber}
            </p>
          </div>
        )}
        <div className="text-right">
          <p className="text-xl font-bold">Total: ${quote.total}</p>
        </div>
        <div className="mt-8 flex justify-end">
          <Button onClick={generatePDF} className="flex items-center">
            <Download className="mr-2 h-4 w-4" />
            Download PDF
          </Button>
        </div>
        <div className="mt-8 text-sm">
          <p>Thank you for your business. If you have any questions about this quote, please contact us.</p>
          <p>This quote is valid for 30 days from the date of issue.</p>
        </div>
      </div>
    </div>
  )
}
