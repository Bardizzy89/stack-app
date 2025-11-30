'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ExternalLink, Check, X, RefreshCw } from 'lucide-react'
import type {
  OptimalStack,
  ToolRecommendation,
  CategoryRecommendation,
  ToolCategory,
} from '@/lib/types/optimal-stack'
import { ALL_CATEGORIES, CATEGORY_DISPLAY_NAMES } from '@/lib/types/optimal-stack'
import { toast } from 'sonner'

interface OptimalStackDisplayProps {
  optimalStack: OptimalStack
  onRegenerate?: () => Promise<void>
  fromCache?: boolean
}

export function OptimalStackDisplay({
  optimalStack,
  onRegenerate,
  fromCache,
}: OptimalStackDisplayProps) {
  const [isRegenerating, setIsRegenerating] = useState(false)
  const [markedTools, setMarkedTools] = useState<Set<string>>(new Set())
  const [dismissedTools, setDismissedTools] = useState<Set<string>>(new Set())

  const handleRegenerate = async () => {
    if (!onRegenerate) return

    setIsRegenerating(true)
    try {
      await onRegenerate()
      toast.success('Optimal stack refreshed successfully!')
    } catch (error) {
      toast.error('Failed to refresh recommendations')
    } finally {
      setIsRegenerating(false)
    }
  }

  const handleMarkAsUsing = (toolSlug: string) => {
    setMarkedTools((prev) => {
      const next = new Set(prev)
      if (next.has(toolSlug)) {
        next.delete(toolSlug)
      } else {
        next.add(toolSlug)
      }
      return next
    })
  }

  const handleDismiss = (toolSlug: string) => {
    setDismissedTools((prev) => {
      const next = new Set(prev)
      next.add(toolSlug)
      return next
    })
    toast.info('Recommendation dismissed')
  }

  const renderToolCard = (tool: ToolRecommendation, isPrimary: boolean) => {
    if (dismissedTools.has(tool.slug)) return null

    const isMarked = markedTools.has(tool.slug)

    return (
      <Card
        key={tool.slug}
        className={`${isPrimary ? 'border-2 border-blue-500' : 'border-slate-200'} ${
          isMarked ? 'bg-green-50 border-green-300' : ''
        }`}
      >
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <CardTitle className="text-lg">{tool.name}</CardTitle>
                {isPrimary && (
                  <Badge className="bg-gradient-to-r from-blue-600 to-cyan-600">
                    Recommended
                  </Badge>
                )}
                {isMarked && (
                  <Badge variant="outline" className="bg-green-100 text-green-700">
                    <Check className="w-3 h-3 mr-1" />
                    Using
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="secondary">{tool.pricing_tier}</Badge>
                {tool.pricing_hint && (
                  <span className="text-sm text-slate-600">{tool.pricing_hint}</span>
                )}
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleDismiss(tool.slug)}
              className="text-slate-400 hover:text-slate-600"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-slate-600 mb-3">{tool.description}</p>
          <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 mb-4">
            <p className="text-sm text-slate-700">
              <span className="font-semibold">Why for you:</span> {tool.why}
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleMarkAsUsing(tool.slug)}
              className={isMarked ? 'bg-green-100 border-green-300' : ''}
            >
              <Check className="w-4 h-4 mr-1" />
              {isMarked ? 'Already Using' : 'Mark as Using'}
            </Button>
            <Button variant="outline" size="sm" asChild>
              <a href={tool.website} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="w-4 h-4 mr-1" />
                Visit Website
              </a>
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  const renderCategory = (categoryKey: ToolCategory) => {
    const category: CategoryRecommendation = optimalStack.categories[categoryKey]
    if (!category) return null

    return (
      <div key={categoryKey} className="mb-8">
        <div className="mb-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-slate-900">
              {CATEGORY_DISPLAY_NAMES[categoryKey]}
            </h2>
            {category.is_optional && (
              <Badge variant="secondary">Optional</Badge>
            )}
          </div>
        </div>

        <div className="space-y-4">
          {/* Primary Recommendation */}
          {renderToolCard(category.primary, true)}

          {/* Alternatives */}
          {category.alternatives && category.alternatives.length > 0 && (
            <>
              <div className="flex items-center gap-2 mt-6 mb-3">
                <div className="h-px flex-1 bg-slate-200" />
                <span className="text-sm text-slate-500 font-medium">Alternatives</span>
                <div className="h-px flex-1 bg-slate-200" />
              </div>
              {category.alternatives.map((tool) => renderToolCard(tool, false))}
            </>
          )}
        </div>
      </div>
    )
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">
              Your Optimal Tech Stack
            </h1>
            <p className="text-slate-600">
              Personalized recommendations for {optimalStack.industry}
              {' • '}
              {optimalStack.company_size_band}
              {' • '}
              {optimalStack.team_type}
            </p>
          </div>
          {onRegenerate && (
            <Button
              variant="outline"
              onClick={handleRegenerate}
              disabled={isRegenerating}
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${isRegenerating ? 'animate-spin' : ''}`} />
              {isRegenerating ? 'Refreshing...' : 'Refresh Recommendations'}
            </Button>
          )}
        </div>

        {fromCache && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-900">
              <span className="font-semibold">💡 From our recommendations library:</span>{' '}
              These suggestions were previously generated for businesses with similar profiles.
              Use "Refresh" for a freshly generated stack.
            </p>
          </div>
        )}
      </div>

      {/* Categories */}
      <div className="space-y-8">
        {ALL_CATEGORIES.map((categoryKey) => renderCategory(categoryKey))}
      </div>
    </div>
  )
}
