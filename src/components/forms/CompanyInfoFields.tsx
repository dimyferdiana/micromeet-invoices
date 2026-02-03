import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import type { CompanyInfo } from "@/lib/types"

interface CompanyInfoFieldsProps {
  company: CompanyInfo
  onChange: (company: CompanyInfo) => void
  title?: string
}

export function CompanyInfoFields({
  company,
  onChange,
  title = "Informasi Perusahaan",
}: CompanyInfoFieldsProps) {
  const updateField = (field: keyof CompanyInfo, value: string) => {
    onChange({ ...company, [field]: value })
  }

  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-base">{title}</h3>

      <div className="grid gap-4">
        <div className="space-y-2">
          <Label htmlFor="company-name">Nama Perusahaan *</Label>
          <Input
            id="company-name"
            placeholder="PT. Contoh Perusahaan"
            value={company.name}
            onChange={(e) => updateField("name", e.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="company-address">Alamat *</Label>
          <Textarea
            id="company-address"
            placeholder="Jl. Contoh No. 123, Jakarta"
            value={company.address}
            onChange={(e) => updateField("address", e.target.value)}
            rows={2}
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="company-phone">Telepon</Label>
            <Input
              id="company-phone"
              placeholder="021-12345678"
              value={company.phone || ""}
              onChange={(e) => updateField("phone", e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="company-email">Email</Label>
            <Input
              id="company-email"
              type="email"
              placeholder="info@perusahaan.com"
              value={company.email || ""}
              onChange={(e) => updateField("email", e.target.value)}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="company-website">Website</Label>
            <Input
              id="company-website"
              placeholder="www.perusahaan.com"
              value={company.website || ""}
              onChange={(e) => updateField("website", e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="company-tax-id">NPWP</Label>
            <Input
              id="company-tax-id"
              placeholder="00.000.000.0-000.000"
              value={company.taxId || ""}
              onChange={(e) => updateField("taxId", e.target.value)}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
