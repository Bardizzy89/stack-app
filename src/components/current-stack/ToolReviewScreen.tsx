'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import type { ParsedTool, ToolFormData } from '@/lib/types/current-stack'
import { TOOL_CATEGORY_LABELS, BILLING_FREQUENCY_LABELS } from '@/lib/types/current-stack'
import { toolFormSchema } from '@/lib/validations/current-stack'
import { Pencil, Trash2, Plus, Check, X, Loader2 } from 'lucide-react'

interface ToolReviewScreenProps {
  initialTools: ParsedTool[]
  onSave: (tools: ParsedTool[]) => void
  isSaving: boolean
}

export function ToolReviewScreen({ initialTools, onSave, isSaving }: ToolReviewScreenProps) {
  const [tools, setTools] = useState<ParsedTool[]>(initialTools)
  const [editingIndex, setEditingIndex] = useState<number | null>(null)

  const form = useForm<ToolFormData>({
    resolver: zodResolver(toolFormSchema),
    defaultValues: {
      tool_name: '',
      category: 'other',
      monthly_cost: '',
      billing_frequency: 'unknown',
      seats: '',
      renewal_date: '',
      notes: '',
    },
  })

  const startEditing = (index: number) => {
    const tool = tools[index]
    form.reset({
      tool_name: tool.tool_name,
      category: tool.category,
      monthly_cost: tool.monthly_cost?.toString() || '',
      billing_frequency: tool.billing_frequency || 'unknown',
      seats: tool.seats?.toString() || '',
      renewal_date: tool.renewal_date || '',
      notes: tool.notes || '',
    })
    setEditingIndex(index)
  }

  const startAdding = () => {
    form.reset({
      tool_name: '',
      category: 'other',
      monthly_cost: '',
      billing_frequency: 'unknown',
      seats: '',
      renewal_date: '',
      notes: '',
    })
    setEditingIndex(-1) // -1 indicates adding new tool
  }

  const cancelEditing = () => {
    setEditingIndex(null)
    form.reset()
  }

  const saveEdit = (data: ToolFormData) => {
    const updatedTool: ParsedTool = {
      tool_name: data.tool_name,
      category: data.category,
      monthly_cost: data.monthly_cost ? parseFloat(data.monthly_cost as unknown as string) : null,
      billing_frequency: data.billing_frequency,
      seats: data.seats ? parseInt(data.seats as unknown as string, 10) : null,
      renewal_date: data.renewal_date || null,
      notes: data.notes || null,
    }

    if (editingIndex === -1) {
      // Adding new tool
      setTools([...tools, updatedTool])
    } else if (editingIndex !== null) {
      // Editing existing tool
      const updated = [...tools]
      updated[editingIndex] = updatedTool
      setTools(updated)
    }

    cancelEditing()
  }

  const deleteTool = (index: number) => {
    setTools(tools.filter((_, i) => i !== index))
    if (editingIndex === index) {
      cancelEditing()
    }
  }

  const handleSave = () => {
    if (tools.length === 0) {
      return
    }
    onSave(tools)
  }

  const isEditing = editingIndex !== null

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="border-blue-200 bg-blue-50/50">
        <CardHeader>
          <CardTitle>Review Your Tech Stack</CardTitle>
          <CardDescription className="text-slate-700">
            Review the parsed tools below. You can edit details, remove incorrect items, or add missing tools.
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Tools List */}
      <div className="space-y-4">
        {tools.map((tool, index) => (
          <Card key={index} className={editingIndex === index ? 'border-blue-500 shadow-lg' : ''}>
            {editingIndex === index ? (
              // Edit Form
              <CardContent className="pt-6">
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(saveEdit)} className="space-y-4">
                    {/* Tool Name */}
                    <FormField
                      control={form.control}
                      name="tool_name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Tool Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Slack" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Category and Monthly Cost */}
                    <div className="grid gap-4 md:grid-cols-2">
                      <FormField
                        control={form.control}
                        name="category"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Category</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {Object.entries(TOOL_CATEGORY_LABELS).map(([value, label]) => (
                                  <SelectItem key={value} value={value}>
                                    {label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="monthly_cost"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Monthly Cost ($)</FormLabel>
                            <FormControl>
                              <Input type="number" step="0.01" placeholder="0.00" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* Billing Frequency and Seats */}
                    <div className="grid gap-4 md:grid-cols-2">
                      <FormField
                        control={form.control}
                        name="billing_frequency"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Billing Frequency</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {Object.entries(BILLING_FREQUENCY_LABELS).map(([value, label]) => (
                                  <SelectItem key={value} value={value}>
                                    {label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="seats"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Number of Seats</FormLabel>
                            <FormControl>
                              <Input type="number" placeholder="1" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* Renewal Date */}
                    <FormField
                      control={form.control}
                      name="renewal_date"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Renewal Date (Optional)</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Notes */}
                    <FormField
                      control={form.control}
                      name="notes"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Notes (Optional)</FormLabel>
                          <FormControl>
                            <Textarea placeholder="Additional information..." className="min-h-[80px]" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Action Buttons */}
                    <div className="flex gap-2 pt-2">
                      <Button type="submit" size="sm" className="bg-green-600 hover:bg-green-700">
                        <Check className="mr-2 h-4 w-4" />
                        Save
                      </Button>
                      <Button type="button" size="sm" variant="outline" onClick={cancelEditing}>
                        <X className="mr-2 h-4 w-4" />
                        Cancel
                      </Button>
                    </div>
                  </form>
                </Form>
              </CardContent>
            ) : (
              // View Mode
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1 space-y-3">
                    <div className="flex items-center gap-3">
                      <h3 className="text-lg font-semibold">{tool.tool_name}</h3>
                      <Badge variant="secondary">{TOOL_CATEGORY_LABELS[tool.category]}</Badge>
                    </div>

                    <div className="grid gap-3 text-sm md:grid-cols-2">
                      {tool.monthly_cost && (
                        <div>
                          <span className="text-slate-500">Monthly Cost:</span>{' '}
                          <span className="font-medium">${tool.monthly_cost.toFixed(2)}</span>
                          {tool.billing_frequency && tool.billing_frequency !== 'unknown' && (
                            <span className="text-slate-500 ml-1">
                              ({BILLING_FREQUENCY_LABELS[tool.billing_frequency]})
                            </span>
                          )}
                        </div>
                      )}

                      {tool.seats && (
                        <div>
                          <span className="text-slate-500">Seats:</span>{' '}
                          <span className="font-medium">{tool.seats}</span>
                        </div>
                      )}

                      {tool.renewal_date && (
                        <div>
                          <span className="text-slate-500">Renewal:</span>{' '}
                          <span className="font-medium">{new Date(tool.renewal_date).toLocaleDateString()}</span>
                        </div>
                      )}

                      {tool.notes && (
                        <div className="md:col-span-2">
                          <span className="text-slate-500">Notes:</span> <span className="font-medium">{tool.notes}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  {!isEditing && (
                    <div className="flex gap-2 ml-4">
                      <Button size="sm" variant="outline" onClick={() => startEditing(index)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => deleteTool(index)}>
                        <Trash2 className="h-4 w-4 text-red-600" />
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            )}
          </Card>
        ))}

        {/* Add New Tool Form */}
        {editingIndex === -1 && (
          <Card className="border-blue-500 shadow-lg">
            <CardContent className="pt-6">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(saveEdit)} className="space-y-4">
                  {/* Same form fields as edit mode */}
                  <FormField
                    control={form.control}
                    name="tool_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tool Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Slack" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid gap-4 md:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="category"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Category</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {Object.entries(TOOL_CATEGORY_LABELS).map(([value, label]) => (
                                <SelectItem key={value} value={value}>
                                  {label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="monthly_cost"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Monthly Cost ($)</FormLabel>
                          <FormControl>
                            <Input type="number" step="0.01" placeholder="0.00" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="billing_frequency"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Billing Frequency</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {Object.entries(BILLING_FREQUENCY_LABELS).map(([value, label]) => (
                                <SelectItem key={value} value={value}>
                                  {label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="seats"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Number of Seats</FormLabel>
                          <FormControl>
                            <Input type="number" placeholder="1" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="renewal_date"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Renewal Date (Optional)</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="notes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Notes (Optional)</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Additional information..." className="min-h-[80px]" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex gap-2 pt-2">
                    <Button type="submit" size="sm" className="bg-green-600 hover:bg-green-700">
                      <Check className="mr-2 h-4 w-4" />
                      Add Tool
                    </Button>
                    <Button type="button" size="sm" variant="outline" onClick={cancelEditing}>
                      <X className="mr-2 h-4 w-4" />
                      Cancel
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        )}

        {/* Add Tool Button */}
        {!isEditing && (
          <Button onClick={startAdding} variant="outline" className="w-full border-dashed">
            <Plus className="mr-2 h-4 w-4" />
            Add Tool Manually
          </Button>
        )}
      </div>

      {/* Save & Continue Button */}
      <div className="flex justify-end pt-4">
        <Button
          onClick={handleSave}
          disabled={tools.length === 0 || isSaving || isEditing}
          className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700"
          size="lg"
        >
          {isSaving ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Saving...
            </>
          ) : (
            'Save & Continue to Payment'
          )}
        </Button>
      </div>
    </div>
  )
}
