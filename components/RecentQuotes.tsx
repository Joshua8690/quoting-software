import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"

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
  }[]
  customerEmail?: string
}

interface RecentQuotesProps {
  quotes: Invoice[]
}

export function RecentQuotes({ quotes }: RecentQuotesProps) {
  if (!quotes || quotes.length === 0) {
    return (
      <div className="mt-8">
        <h2 className="text-2xl font-bold mb-4">Recent Invoices</h2>
        <p className="text-gray-500">No recent invoices found. Generate an invoice to see it here.</p>
      </div>
    )
  }

  return (
    <div className="mt-8">
      <h2 className="text-2xl font-bold mb-4">Recent Invoices</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {quotes.map((invoice) => (
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
            <div className="mt-3">
              <Dialog>
                <DialogTrigger asChild>
                  <Button className="w-full">View Details</Button>
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
                                {item.length} {item.lengthUnit} x {item.width} {item.widthUnit}
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
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
