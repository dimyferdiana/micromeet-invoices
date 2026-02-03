import { useState, useEffect } from "react"
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
import { Checkbox } from "@/components/ui/checkbox"
import type { CustomerInfo } from "@/lib/types"
import { IconUser, IconPlus, IconEdit } from "@tabler/icons-react"

interface CustomerSelectorProps {
  value: CustomerInfo
  onChange: (customer: CustomerInfo) => void
  label?: string
  placeholder?: string
  saveNewCustomer?: boolean
  onSaveNewCustomerChange?: (save: boolean) => void
}

export function CustomerSelector({
  value,
  onChange,
  label = "Pilih Pelanggan",
  placeholder = "Cari atau pilih pelanggan...",
  saveNewCustomer = false,
  onSaveNewCustomerChange,
}: CustomerSelectorProps) {
  const customers = useQuery(api.customers.list)
  const [isNewMode, setIsNewMode] = useState(false)

  const handleSelect = (selectedValue: string | null) => {
    if (!selectedValue || selectedValue === "new") {
      // Enable new customer mode
      setIsNewMode(true)
      onChange({
        name: "",
        address: "",
        phone: "",
        email: "",
      })
      return
    }

    // Selecting existing customer exits new mode
    setIsNewMode(false)
    onSaveNewCustomerChange?.(false)
    const customer = customers?.find((c) => c._id === selectedValue)
    if (customer) {
      onChange({
        name: customer.name,
        address: customer.address,
        phone: customer.phone || "",
        email: customer.email || "",
      })
    }
  }

  // Find current customer ID if it matches an existing customer
  const currentCustomerId = customers?.find(
    (c) => c.name === value.name && c.address === value.address
  )?._id

  // Check if user entered a new customer (has data but not in database)
  const isNewCustomer = !currentCustomerId && value.name.trim() !== ""

  // When entering new customer data, auto-check the save checkbox
  useEffect(() => {
    if (isNewCustomer && !saveNewCustomer) {
      onSaveNewCustomerChange?.(true)
    }
  }, [isNewCustomer, saveNewCustomer, onSaveNewCustomerChange])

  // Check if currently in new mode (no matching customer and isNewMode is true)
  const showNewModeIndicator = isNewMode || (!currentCustomerId && !value.name)

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <Combobox
        value={currentCustomerId || ""}
        onValueChange={handleSelect}
      >
        <ComboboxInput
          placeholder={placeholder}
          className="w-full"
          showClear
        />
        <ComboboxContent>
          <ComboboxList>
            <ComboboxEmpty>Tidak ada pelanggan ditemukan</ComboboxEmpty>

            {/* Option to enter new customer */}
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
                  <p className="text-xs text-muted-foreground truncate">
                    {customer.address}
                  </p>
                </div>
              </ComboboxItem>
            ))}
          </ComboboxList>
        </ComboboxContent>
      </Combobox>

      {/* Show new mode indicator */}
      {showNewModeIndicator && !value.name && (
        <div className="flex items-center gap-2 text-xs text-primary bg-primary/10 p-2 rounded border border-primary/20">
          <IconEdit className="h-4 w-4" />
          <span>Mode data baru aktif. Silakan isi detail di bawah ini.</span>
        </div>
      )}

      {/* Show selected customer info */}
      {value.name && (
        <div className="text-xs text-muted-foreground bg-muted/50 p-2 rounded">
          <p className="font-medium">{value.name}</p>
          <p>{value.address}</p>
          {value.phone && <p>Tel: {value.phone}</p>}
          {value.email && <p>Email: {value.email}</p>}
        </div>
      )}

      {/* Show save new customer checkbox */}
      {isNewCustomer && onSaveNewCustomerChange && (
        <div className="flex items-center gap-2 text-sm">
          <Checkbox
            id="save-customer"
            checked={saveNewCustomer}
            onCheckedChange={(checked) => onSaveNewCustomerChange(checked === true)}
          />
          <label
            htmlFor="save-customer"
            className="text-sm cursor-pointer select-none"
          >
            Simpan ke daftar pelanggan
          </label>
        </div>
      )}
    </div>
  )
}
