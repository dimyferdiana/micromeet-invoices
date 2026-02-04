import { useState, useRef, useEffect } from "react"
import { useQuery } from "convex/react"
import { api } from "../../../convex/_generated/api"
import {
  Combobox,
  ComboboxInput,
  ComboboxContent,
  ComboboxList,
  ComboboxItem,
  ComboboxEmpty,
} from "@/components/ui/combobox"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { IconUser, IconPlus, IconEdit } from "@tabler/icons-react"

export interface NewPayerInfo {
  name: string
  address: string
  phone: string
  email: string
}

interface PayerSelectorProps {
  value: string
  onChange: (name: string) => void
  label?: string
  placeholder?: string
  saveNewPayer?: boolean
  onSaveNewPayerChange?: (save: boolean) => void
  newPayerInfo?: NewPayerInfo
  onNewPayerInfoChange?: (info: NewPayerInfo) => void
}

export function PayerSelector({
  value,
  onChange,
  label = "Diterima Dari",
  placeholder = "Cari atau ketik nama...",
  saveNewPayer = false,
  onSaveNewPayerChange,
  newPayerInfo,
  onNewPayerInfoChange,
}: PayerSelectorProps) {
  const customers = useQuery(api.customers.list)
  const [isNewMode, setIsNewMode] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleSelect = (selectedValue: string | null) => {
    if (!selectedValue) {
      return
    }

    if (selectedValue === "new") {
      // Enable new mode and clear the value
      setIsNewMode(true)
      onChange("")
      return
    }

    // Selecting existing customer exits new mode
    setIsNewMode(false)
    onSaveNewPayerChange?.(false)
    const customer = customers?.find((c) => c._id === selectedValue)
    if (customer) {
      onChange(customer.name)
    }
  }

  // Focus the input when entering new mode
  useEffect(() => {
    if (isNewMode && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isNewMode])

  // Find current customer ID if it matches an existing customer name
  const currentCustomerId = customers?.find((c) => c.name === value)?._id

  // Check if user entered a new payer (has value but not in database)
  const isNewPayer = !currentCustomerId && value.trim() !== ""

  // When entering new payer data, auto-check the save checkbox
  useEffect(() => {
    if (isNewPayer && !saveNewPayer) {
      onSaveNewPayerChange?.(true)
    }
  }, [isNewPayer, saveNewPayer, onSaveNewPayerChange])

  // If user is in new mode, show full customer input fields
  if (isNewMode) {
    const handleNewPayerFieldChange = (field: keyof NewPayerInfo, fieldValue: string) => {
      if (field === "name") {
        onChange(fieldValue)
      }
      onNewPayerInfoChange?.({
        name: field === "name" ? fieldValue : value,
        address: newPayerInfo?.address || "",
        phone: newPayerInfo?.phone || "",
        email: newPayerInfo?.email || "",
        [field]: fieldValue,
      })
    }

    return (
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-xs text-primary bg-primary/10 p-2 rounded border border-primary/20">
          <IconEdit className="h-4 w-4" />
          <span>Mode data baru aktif</span>
          <button
            type="button"
            onClick={() => setIsNewMode(false)}
            className="ml-auto text-primary hover:underline"
          >
            Pilih dari daftar
          </button>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>{label} *</Label>
            <Input
              ref={inputRef}
              placeholder="Nama lengkap..."
              value={value}
              onChange={(e) => handleNewPayerFieldChange("name", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>No. Telepon</Label>
            <Input
              placeholder="08xxx..."
              value={newPayerInfo?.phone || ""}
              onChange={(e) => handleNewPayerFieldChange("phone", e.target.value)}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label>Alamat</Label>
          <Input
            placeholder="Alamat lengkap..."
            value={newPayerInfo?.address || ""}
            onChange={(e) => handleNewPayerFieldChange("address", e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label>Email</Label>
          <Input
            type="email"
            placeholder="email@example.com"
            value={newPayerInfo?.email || ""}
            onChange={(e) => handleNewPayerFieldChange("email", e.target.value)}
          />
        </div>

        {/* Show save checkbox for new payers */}
        {isNewPayer && onSaveNewPayerChange && (
          <div className="flex items-center gap-2 text-sm pt-2 border-t">
            <Checkbox
              id="save-payer"
              checked={saveNewPayer}
              onCheckedChange={(checked) => onSaveNewPayerChange(checked === true)}
            />
            <label
              htmlFor="save-payer"
              className="text-sm cursor-pointer select-none"
            >
              Simpan ke daftar pelanggan
            </label>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <Label>{label} *</Label>
      <Combobox
        value={currentCustomerId || ""}
        onValueChange={handleSelect}
      >
        <ComboboxInput
          placeholder={placeholder}
          className="w-full"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
        <ComboboxContent>
          <ComboboxList>
            <ComboboxEmpty>Ketik nama atau pilih dari daftar</ComboboxEmpty>

            {/* Option to enter new payer */}
            <ComboboxItem value="new" className="text-primary">
              <IconPlus className="h-4 w-4 mr-2" />
              Masukkan data baru
            </ComboboxItem>

            {/* Existing customers */}
            {customers?.map((customer) => (
              <ComboboxItem key={customer._id} value={customer._id}>
                <IconUser className="h-4 w-4 mr-2 text-muted-foreground" />
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{customer.name}</p>
                  {customer.phone && (
                    <p className="text-xs text-muted-foreground truncate">
                      {customer.phone}
                    </p>
                  )}
                </div>
              </ComboboxItem>
            ))}
          </ComboboxList>
        </ComboboxContent>
      </Combobox>
    </div>
  )
}
