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

interface PayerSelectorProps {
  value: string
  onChange: (name: string) => void
  label?: string
  placeholder?: string
  saveNewPayer?: boolean
  onSaveNewPayerChange?: (save: boolean) => void
}

export function PayerSelector({
  value,
  onChange,
  label = "Diterima Dari",
  placeholder = "Cari atau ketik nama...",
  saveNewPayer = false,
  onSaveNewPayerChange,
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

  // If user is in new mode, show a dedicated input
  if (isNewMode) {
    return (
      <div className="space-y-2">
        <Label>{label} *</Label>
        <div className="flex items-center gap-2 text-xs text-primary bg-primary/10 p-2 rounded border border-primary/20 mb-2">
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
        <Input
          ref={inputRef}
          placeholder="Ketik nama pembayar..."
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full"
        />
        {/* Show save checkbox for new payers */}
        {isNewPayer && onSaveNewPayerChange && (
          <div className="flex items-center gap-2 text-sm">
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
