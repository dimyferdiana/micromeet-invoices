import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import type { CustomerInfo } from "@/lib/types"

interface CustomerInfoFieldsProps {
  customer: CustomerInfo
  onChange: (customer: CustomerInfo) => void
  title?: string
}

export function CustomerInfoFields({
  customer,
  onChange,
  title = "Informasi Pelanggan",
}: CustomerInfoFieldsProps) {
  const updateField = (field: keyof CustomerInfo, value: string) => {
    onChange({ ...customer, [field]: value })
  }

  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-base">{title}</h3>

      <div className="grid gap-4">
        <div className="space-y-2">
          <Label htmlFor="customer-name">Nama *</Label>
          <Input
            id="customer-name"
            placeholder="Nama pelanggan atau perusahaan"
            value={customer.name}
            onChange={(e) => updateField("name", e.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="customer-address">Alamat *</Label>
          <Textarea
            id="customer-address"
            placeholder="Alamat lengkap"
            value={customer.address}
            onChange={(e) => updateField("address", e.target.value)}
            rows={2}
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="customer-phone">Telepon</Label>
            <Input
              id="customer-phone"
              placeholder="08xx-xxxx-xxxx"
              value={customer.phone || ""}
              onChange={(e) => updateField("phone", e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="customer-email">Email</Label>
            <Input
              id="customer-email"
              type="email"
              placeholder="email@contoh.com"
              value={customer.email || ""}
              onChange={(e) => updateField("email", e.target.value)}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
