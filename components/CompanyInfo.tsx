import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface CompanyInfoProps {
  name: string
  phone: string
  address: string
  onUpdate: (field: string, value: string) => void
}

export function CompanyInfo({ name, phone, address, onUpdate }: CompanyInfoProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <div>
        <Label htmlFor="companyName">Company Name</Label>
        <Input
          id="companyName"
          value={name}
          onChange={(e) => onUpdate("name", e.target.value)}
          placeholder="Enter company name"
        />
      </div>
      <div>
        <Label htmlFor="companyPhone">Phone Number</Label>
        <Input
          id="companyPhone"
          value={phone}
          onChange={(e) => onUpdate("phone", e.target.value)}
          placeholder="Enter phone number"
        />
      </div>
      <div>
        <Label htmlFor="companyAddress">Address</Label>
        <Input
          id="companyAddress"
          value={address}
          onChange={(e) => onUpdate("address", e.target.value)}
          placeholder="Enter company address"
        />
      </div>
    </div>
  )
}
