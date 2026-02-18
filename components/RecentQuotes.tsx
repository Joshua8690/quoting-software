"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Trash2, Pencil, Search } from "lucide-react"

interface Invoice {
  id: number
  invoiceNumber: string
  customerName: string
  projectName: string
  total: string
  date: string
  poNumber?: string
  companyInfo: {
    name: string
    phone: string
    address: string
  }
  lineItems: {
    description: string
    length: string
    width: string
    quantity: string
    lengthUnit: string
    widthUnit: string
    sqft?: string
    inputMethod?: string
  }[]
  customerEmail?: string
  sheetSize?: any
  materialType?: string
  sheetCost?: string
  markupPercentage?: string
  formingCost?: string
  formingCostMethod?: string
  hourlyRate?: string
  hoursWorked?: string
  plasmaCuttingMinutes?: string
  plasmaCostPerMinute?: string
}

interface RecentQuotesProps {
  quotes: Invoice[]
  onEdit?: (invoice: Invoice) => void
  onDelete?: (invoiceId: number) => void
}

export function RecentQuotes({ quotes, onEdit, onDelete }: RecentQuotesProps) {
  const [searchQuery, setSearchQuery] = useState("")

  const filteredQuotes = quotes.filter((invoice) => {
    if (!searchQuery.trim()) return true
    const query = searchQuery.toLowerCase()
    return (
      invoice.customerName?.toLowerCase().includes(query) ||
      invoice.invoiceNumber?.toLowerCase().includes(query) ||
      invoice.projectName?.toLowerCase().includes(query) ||
      invoice.poNumber?.toLowerCase().includes(query)
    )
  })

  return (
    <div className="mt-8">
      <h2 className="text-2xl font-bold mb-4">Saved Invoices</h2>

      {/* Search Bar */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by customer name, invoice #, project, or PO..."
          className="pl-10"
        />
      </div>

      {filteredQuotes.length === 0 ? (
        <p className="text-gray-500">
          {quotes.length === 0
            ? "No saved invoices found. Generate an invoice to see it here."
            : `No invoices found matching "${searchQuery}".`}
        </p>
      ) : (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredQuotes.map((invoice) => (
          <div key={invoice.id} className="border border-gray-200 p-4 rounded-lg shadow-sm bg-white hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-semibold text-gray-800">{invoice.customerName}</h3>
              <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded font-medium">
                #{invoice.invoiceNumber}
              </span>
            </div>
            {invoice.projectName && (
              <p className="text-sm text-gray-600">{invoice.projectName}</p>
            )}
            {invoice.poNumber && (
              <p className="text-sm text-gray-600">PO: {invoice.poNumber}</p>
            )}
            <p className="mt-2 text-xl font-bold text-gray-900">${invoice.total}</p>
            <p className="text-sm text-gray-500">{new Date(invoice.date).toLocaleDateString()}</p>
            <div className="mt-3 flex gap-2">
              <Dialog>
                <DialogTrigger asChild>
                  <Button className="flex-1" variant="outline">View</Button>
                </DialogTrigger>
                <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Invoice #{invoice.invoiceNumber}</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-semibold text-gray-700 mb-1">Company</h4>
                        <p className="text-sm">{invoice.companyInfo.name}</p>
                        <p className="text-sm text-gray-600">{invoice.companyInfo.phone}</p>
                        <p className="text-sm text-gray-600">{invoice.companyInfo.address}</p>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-700 mb-1">Customer</h4>
                        <p className="text-sm">{invoice.customerName}</p>
                        {invoice.projectName && (
                          <p className="text-sm text-gray-600">Project: {invoice.projectName}</p>
                        )}
                        {invoice.customerEmail && (
                          <p className="text-sm text-gray-600">Email: {invoice.customerEmail}</p>
                        )}
                        {invoice.poNumber && (
                          <p className="text-sm text-gray-600">PO: {invoice.poNumber}</p>
                        )}
                      </div>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-700 mb-2">Line Items</h4>
                      <table className="w-full border-collapse border border-gray-200 text-sm">
                        <thead>
                          <tr className="bg-gray-50">
                            <th className="border border-gray-200 px-3 py-2 text-left">#</th>
                            <th className="border border-gray-200 px-3 py-2 text-left">Description</th>
                            <th className="border border-gray-200 px-3 py-2 text-center">Dimensions</th>
                            <th className="border border-gray-200 px-3 py-2 text-center">Qty</th>
                          </tr>
                        </thead>
                        <tbody>
                          {invoice.lineItems.map((item, index) => (
                            <tr key={index}>
                              <td className="border border-gray-200 px-3 py-2">{index + 1}</td>
                              <td className="border border-gray-200 px-3 py-2">{item.description || "Custom Part"}</td>
                              <td className="border border-gray-200 px-3 py-2 text-center">
                                {item.inputMethod === "sqft"
                                  ? `${item.sqft} sq ft`
                                  : `${item.length} ${item.lengthUnit} x ${item.width} ${item.widthUnit}`}
                              </td>
                              <td className="border border-gray-200 px-3 py-2 text-center">{item.quantity}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <div className="bg-gray-900 text-white p-4 rounded-lg flex justify-between items-center">
                      <span className="text-lg font-bold">TOTAL:</span>
                      <span className="text-2xl font-bold">${invoice.total}</span>
                    </div>
                    <p className="text-sm text-gray-500">
                      Date: {new Date(invoice.date).toLocaleDateString()}
                    </p>
                  </div>
                </DialogContent>
              </Dialog>
              {onEdit && (
                <Button onClick={() => onEdit(invoice)} className="flex-1 bg-blue-600 hover:bg-blue-700">
                  <Pencil className="mr-1 h-4 w-4" /> Edit
                </Button>
              )}
              {onDelete && (
                <Button onClick={() => onDelete(invoice.id)} variant="destructive" size="icon">
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>
      )}
    </div>
  )
}
