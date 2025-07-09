import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"

interface Quote {
  id: number
  customerName: string
  projectName: string
  total: string
  date: string
  poNumber: string
}

interface RecentQuotesProps {
  quotes: Quote[]
}

export function RecentQuotes({ quotes }: RecentQuotesProps) {
  return (
    <div className="mt-8">
      <h2 className="text-2xl font-bold mb-4">Recent Quotes</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {quotes.map((quote) => (
          <div key={quote.id} className="border p-4 rounded-lg shadow-sm">
            <h3 className="font-semibold">{quote.customerName}</h3>
            <p className="text-sm text-gray-600">{quote.projectName}</p>
            <p className="text-sm text-gray-600">PO: {quote.poNumber}</p>
            <p className="mt-2 font-bold">${quote.total}</p>
            <p className="text-sm text-gray-600">{new Date(quote.date).toLocaleDateString()}</p>
            <div className="mt-2 flex space-x-2">
              <Link href={`/quotes/${quote.id}`} passHref>
                <Button variant="outline">View Quote</Button>
              </Link>
              <Dialog>
                <DialogTrigger asChild>
                  <Button>Quick View</Button>
                </DialogTrigger>
                <DialogContent className="max-w-3xl">
                  <DialogHeader>
                    <DialogTitle>Quote Details</DialogTitle>
                  </DialogHeader>
                  <div>
                    <h3 className="text-xl font-bold mb-2">{quote.customerName}</h3>
                    <p>
                      <strong>Project:</strong> {quote.projectName}
                    </p>
                    <p>
                      <strong>PO Number:</strong> {quote.poNumber}
                    </p>
                    <p>
                      <strong>Date:</strong> {new Date(quote.date).toLocaleDateString()}
                    </p>
                    <p>
                      <strong>Total:</strong> ${quote.total}
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
