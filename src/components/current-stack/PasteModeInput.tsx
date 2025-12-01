'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { parseToolsWithGPT } from '@/app/actions/current-stack'
import type { ParsedTool } from '@/lib/types/current-stack'
import { Loader2, Sparkles } from 'lucide-react'

interface PasteModeInputProps {
  onToolsParsed: (tools: ParsedTool[]) => void
}

export function PasteModeInput({ onToolsParsed }: PasteModeInputProps) {
  const [inputText, setInputText] = useState('')
  const [isParsing, setIsParsing] = useState(false)

  const handleParse = async () => {
    if (!inputText.trim()) {
      toast.error('Please enter at least one tool name')
      return
    }

    setIsParsing(true)

    try {
      const result = await parseToolsWithGPT(inputText)

      if (result.success && result.tools) {
        toast.success(`Successfully parsed ${result.tools.length} tool${result.tools.length > 1 ? 's' : ''}!`)
        onToolsParsed(result.tools)
      } else {
        toast.error(result.error || 'Failed to parse tools')
      }
    } catch (error) {
      toast.error('An unexpected error occurred. Please try again.')
      console.error('Parse error:', error)
    } finally {
      setIsParsing(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Allow Cmd/Ctrl + Enter to submit
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault()
      handleParse()
    }
  }

  return (
    <div className="space-y-6">
      {/* Instructions Card */}
      <Card className="border-blue-200 bg-blue-50/50">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-blue-600" />
            How It Works
          </CardTitle>
          <CardDescription className="text-slate-700">
            Our AI will automatically parse and categorize your tech stack. You can paste in any format:
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="space-y-1 text-sm text-slate-600">
            <p>
              <strong>Simple list:</strong> Slack, HubSpot, QuickBooks, Gusto
            </p>
            <p>
              <strong>With costs:</strong> Slack ($15/month), HubSpot CRM ($50/month, 2 seats)
            </p>
            <p>
              <strong>Natural language:</strong> We use Slack for team chat, paying $200/month for 5 seats
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Main Input Area */}
      <Card>
        <CardHeader>
          <CardTitle>Paste Your Current Tech Stack</CardTitle>
          <CardDescription>
            Enter the software tools your business currently uses. Include any details you have about costs, seats, or
            renewal dates.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Example:&#10;Slack for team communication ($150/month)&#10;HubSpot CRM (2 seats, $100/month)&#10;QuickBooks Online for accounting&#10;Google Workspace&#10;Zoom Pro for video calls"
            className="min-h-[250px] font-mono text-sm"
            disabled={isParsing}
          />

          <div className="flex items-center justify-between pt-2">
            <p className="text-xs text-slate-500">
              Tip: Press <kbd className="px-1.5 py-0.5 bg-slate-100 border rounded text-[10px]">⌘</kbd> +{' '}
              <kbd className="px-1.5 py-0.5 bg-slate-100 border rounded text-[10px]">Enter</kbd> to parse
            </p>

            <Button
              onClick={handleParse}
              disabled={isParsing || !inputText.trim()}
              className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700"
            >
              {isParsing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Parsing with AI...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Parse My Tools
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
