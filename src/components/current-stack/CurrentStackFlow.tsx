'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { PasteModeInput } from './PasteModeInput'
import { ToolReviewScreen } from './ToolReviewScreen'
import { createStackWithItems } from '@/app/actions/current-stack'
import type { ParsedTool } from '@/lib/types/current-stack'

interface CurrentStackFlowProps {
  businessProfileId: string
}

export function CurrentStackFlow({ businessProfileId }: CurrentStackFlowProps) {
  const router = useRouter()
  const [parsedTools, setParsedTools] = useState<ParsedTool[] | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  const handleToolsParsed = (tools: ParsedTool[]) => {
    setParsedTools(tools)
  }

  const handleSave = async (tools: ParsedTool[]) => {
    setIsSaving(true)

    try {
      const result = await createStackWithItems(businessProfileId, tools)

      if (result.success && result.stack_id) {
        toast.success('Tech stack saved successfully!')
        router.push(`/payment?stack_id=${result.stack_id}`)
      } else {
        toast.error(result.error || 'Failed to save tech stack')
        setIsSaving(false)
      }
    } catch (error) {
      toast.error('An unexpected error occurred. Please try again.')
      console.error('Save error:', error)
      setIsSaving(false)
    }
  }

  return (
    <div>
      {!parsedTools ? (
        <PasteModeInput onToolsParsed={handleToolsParsed} />
      ) : (
        <ToolReviewScreen initialTools={parsedTools} onSave={handleSave} isSaving={isSaving} />
      )}
    </div>
  )
}
