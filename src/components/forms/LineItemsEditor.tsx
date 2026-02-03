import { IconPlus, IconTrash } from "@tabler/icons-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { LineItem } from "@/lib/types"
import { formatCurrency } from "@/lib/utils"

interface LineItemsEditorProps {
  items: LineItem[]
  onChange: (items: LineItem[]) => void
}

export function LineItemsEditor({ items, onChange }: LineItemsEditorProps) {
  const addItem = () => {
    onChange([...items, { description: "", quantity: 1, unitPrice: 0, amount: 0 }])
  }

  const removeItem = (index: number) => {
    onChange(items.filter((_, i) => i !== index))
  }

  const updateItem = (index: number, field: keyof LineItem, value: string | number) => {
    const newItems = [...items]
    const item = { ...newItems[index] }

    if (field === "description") {
      item.description = value as string
    } else {
      item[field] = Number(value) || 0
    }

    // Calculate amount
    if (field === "quantity" || field === "unitPrice") {
      item.amount = item.quantity * item.unitPrice
    }

    newItems[index] = item
    onChange(newItems)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label className="text-base font-semibold">Item</Label>
        <Button type="button" variant="outline" size="sm" onClick={addItem}>
          <IconPlus className="h-4 w-4 mr-1" />
          Tambah Item
        </Button>
      </div>

      <div className="border rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-muted/50">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-medium">Deskripsi</th>
              <th className="px-4 py-3 text-center text-sm font-medium w-24">Qty</th>
              <th className="px-4 py-3 text-right text-sm font-medium w-36">Harga Satuan</th>
              <th className="px-4 py-3 text-right text-sm font-medium w-36">Jumlah</th>
              <th className="px-4 py-3 w-12"></th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                  Belum ada item. Klik "Tambah Item" untuk menambahkan.
                </td>
              </tr>
            ) : (
              items.map((item, index) => (
                <tr key={index} className="border-t">
                  <td className="px-4 py-2">
                    <Input
                      placeholder="Deskripsi item..."
                      value={item.description}
                      onChange={(e) => updateItem(index, "description", e.target.value)}
                      className="border-0 shadow-none focus-visible:ring-0 px-0"
                    />
                  </td>
                  <td className="px-4 py-2">
                    <Input
                      type="number"
                      min={1}
                      value={item.quantity}
                      onChange={(e) => updateItem(index, "quantity", e.target.value)}
                      className="text-center border-0 shadow-none focus-visible:ring-0 px-0"
                    />
                  </td>
                  <td className="px-4 py-2">
                    <Input
                      type="number"
                      min={0}
                      value={item.unitPrice}
                      onChange={(e) => updateItem(index, "unitPrice", e.target.value)}
                      className="text-right border-0 shadow-none focus-visible:ring-0 px-0"
                    />
                  </td>
                  <td className="px-4 py-2 text-right font-medium">
                    {formatCurrency(item.amount)}
                  </td>
                  <td className="px-4 py-2">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeItem(index)}
                      className="h-8 w-8 text-destructive hover:text-destructive"
                    >
                      <IconTrash className="h-4 w-4" />
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
