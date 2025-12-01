import { redirect } from 'next/navigation'
import { getBusinessProfile } from '@/app/actions/business-profile'
import { getUserStack } from '@/app/actions/current-stack'
import { getComparisonSummary } from '@/app/actions/comparison'
import { getLatestScore } from '@/app/actions/scoring'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import {
  ArrowLeft,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  DollarSign,
  Zap,
  Target,
  BarChart3,
} from 'lucide-react'
import type { ComparisonSummary } from '@/lib/types/comparison'
import {
  GAP_SEVERITY_COLORS,
  REDUNDANCY_SEVERITY_COLORS,
  ISSUE_TYPE_COLORS,
  ISSUE_TYPE_LABELS,
} from '@/lib/types/comparison'
import {
  getScoreInterpretationText,
  getScoreColor,
  getScoreBgColor,
} from '@/lib/types/scores'

export default async function ResultsPage() {
  const businessProfile = await getBusinessProfile()

  if (!businessProfile) {
    redirect('/profile')
  }

  const stackResult = await getUserStack()

  if (!stackResult.success || !stackResult.data) {
    redirect('/current-stack')
  }

  const stack = stackResult.data

  // Get comparison summary and latest score
  const [comparisonResult, scoreResult] = await Promise.all([
    getComparisonSummary(stack.id),
    getLatestScore(stack.id),
  ])

  if (!comparisonResult.success || !comparisonResult.data) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 px-6 py-12">
        <div className="max-w-4xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>Analysis In Progress</CardTitle>
              <CardDescription>
                Your tech stack comparison is being generated. This usually takes 30-60 seconds.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
                <p className="text-sm text-slate-600">Analyzing your stack...</p>
              </div>
              <Button className="mt-6" asChild>
                <Link href="/dashboard">Return to Dashboard</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  const comparison: ComparisonSummary = comparisonResult.data.comparison_json as ComparisonSummary
  const scoreRecord = scoreResult.success ? scoreResult.data : null

  // Determine health color using Epic 6 scoring system
  const healthColor = getScoreColor(comparison.tech_health_score)
  const healthInterpretation = getScoreInterpretationText(comparison.tech_health_score)
  const healthBadgeColor = getScoreBgColor(comparison.tech_health_score)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 px-6 py-12">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Button variant="outline" size="sm" asChild>
            <Link href="/dashboard">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Link>
          </Button>
        </div>

        {/* Hero Section - Tech Health Score + Savings */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Tech Health Score */}
          <Card className="bg-gradient-to-br from-white to-slate-50 border-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Tech Stack Health Score
              </CardTitle>
              <CardDescription>Overall assessment of your technology stack</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center mb-4">
                <div className="text-center">
                  <div className={`text-7xl font-bold ${healthColor}`}>
                    {comparison.tech_health_score}
                  </div>
                  <div className="text-2xl text-slate-400">/100</div>
                  <Badge className={`mt-3 ${healthBadgeColor}`}>{healthInterpretation}</Badge>
                </div>
              </div>

              {/* Epic 6: Component Score Breakdown */}
              {scoreRecord && (
                <div className="mt-6 space-y-4 pt-6 border-t">
                  <div className="flex items-center gap-2 mb-4">
                    <BarChart3 className="h-4 w-4 text-slate-600" />
                    <h4 className="text-sm font-semibold text-slate-700">Score Breakdown</h4>
                  </div>

                  {/* Gap Score */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600">Category Coverage</span>
                      <span className="font-semibold">{scoreRecord.gap_score}/20</span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2">
                      <div
                        className="bg-blue-500 h-2 rounded-full transition-all"
                        style={{ width: `${(scoreRecord.gap_score / 20) * 100}%` }}
                      />
                    </div>
                  </div>

                  {/* Redundancy Score */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600">Tool Efficiency</span>
                      <span className="font-semibold">{scoreRecord.redundancy_score}/20</span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2">
                      <div
                        className="bg-purple-500 h-2 rounded-full transition-all"
                        style={{ width: `${(scoreRecord.redundancy_score / 20) * 100}%` }}
                      />
                    </div>
                  </div>

                  {/* Outdated Score */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600">Stack Modernity</span>
                      <span className="font-semibold">{scoreRecord.outdated_score}/20</span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2">
                      <div
                        className="bg-orange-500 h-2 rounded-full transition-all"
                        style={{ width: `${(scoreRecord.outdated_score / 20) * 100}%` }}
                      />
                    </div>
                  </div>

                  {/* Cost Efficiency Score */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600">Cost Efficiency</span>
                      <span className="font-semibold">{scoreRecord.cost_efficiency_score}/40</span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2">
                      <div
                        className="bg-green-500 h-2 rounded-full transition-all"
                        style={{ width: `${(scoreRecord.cost_efficiency_score / 40) * 100}%` }}
                      />
                    </div>
                  </div>

                  <div className="text-xs text-slate-500 pt-2">
                    Score formula: Gap (20%) + Efficiency (20%) + Modernity (20%) + Cost (40%)
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Savings Summary */}
          <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-900">
                <DollarSign className="h-5 w-5" />
                Estimated Savings
              </CardTitle>
              <CardDescription className="text-green-700">Potential cost optimization</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="text-sm text-green-700 mb-1">Monthly Savings</div>
                  <div className="text-5xl font-bold text-green-600">
                    ${comparison.total_monthly_savings.toFixed(0)}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-green-700 mb-1">Annual Savings</div>
                  <div className="text-3xl font-bold text-green-600">
                    ${comparison.total_annual_savings.toLocaleString()}
                  </div>
                </div>
                <div className="pt-4 border-t border-green-200 space-y-1 text-sm">
                  <div className="flex justify-between text-green-800">
                    <span>Redundancy:</span>
                    <span className="font-semibold">
                      ${comparison.savings_breakdown.redundancy_savings.toFixed(0)}
                    </span>
                  </div>
                  <div className="flex justify-between text-green-800">
                    <span>Outdated Tools:</span>
                    <span className="font-semibold">
                      ${comparison.savings_breakdown.outdated_savings.toFixed(0)}
                    </span>
                  </div>
                  <div className="flex justify-between text-green-800">
                    <span>Overpriced:</span>
                    <span className="font-semibold">
                      ${comparison.savings_breakdown.overpriced_savings.toFixed(0)}
                    </span>
                  </div>
                  <div className="flex justify-between text-green-800">
                    <span>Free Alternatives:</span>
                    <span className="font-semibold">
                      ${comparison.savings_breakdown.free_tier_savings.toFixed(0)}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Executive Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Executive Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-slate-700 leading-relaxed whitespace-pre-line">
              {comparison.narrative_summary}
            </p>
          </CardContent>
        </Card>

        {/* Key Findings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-yellow-600" />
              Key Findings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {comparison.key_findings.map((finding, idx) => (
                <li key={idx} className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <span className="text-slate-700">{finding}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* Smart Recommendations */}
        {comparison.action_items.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-green-600" />
                Smart Recommendations
              </CardTitle>
              <CardDescription>
                Prioritized actions to optimize your tech stack (sorted by savings potential)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {comparison.action_items.slice(0, 10).map((action, idx) => (
                  <div
                    key={action.id}
                    className="flex items-start justify-between gap-4 p-4 rounded-lg border bg-slate-50"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge
                          variant={action.priority === 'high' ? 'default' : 'secondary'}
                          className={
                            action.priority === 'high'
                              ? 'bg-red-600'
                              : action.priority === 'medium'
                              ? 'bg-yellow-600'
                              : 'bg-slate-600'
                          }
                        >
                          {action.priority.toUpperCase()}
                        </Badge>
                        <Badge variant="outline">{action.type}</Badge>
                      </div>
                      <p className="text-sm font-medium text-slate-900">{action.action}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className="text-lg font-bold text-green-600">
                        ${action.monthly_savings.toFixed(0)}/mo
                      </div>
                      <div className="text-xs text-slate-500">
                        ${action.annual_savings.toLocaleString()}/yr
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Missing Categories (Gaps) */}
        {comparison.gaps.missing_categories.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-orange-600" />
                Missing Categories
              </CardTitle>
              <CardDescription>
                Critical software categories not covered by your current stack
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                {comparison.gaps.missing_categories.map((gap, idx) => (
                  <div key={idx} className="p-4 rounded-lg border bg-slate-50">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge className={GAP_SEVERITY_COLORS[gap.severity]}>{gap.severity}</Badge>
                      <span className="font-semibold text-slate-900">{gap.category_name}</span>
                    </div>
                    <p className="text-sm text-slate-600">{gap.reasoning}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Redundant Tools */}
        {comparison.redundancy.items.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-orange-600" />
                Redundant Tools
              </CardTitle>
              <CardDescription>
                Tools with overlapping functionality costing you money
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {comparison.redundancy.items
                  .filter((item) => item.severity === 'wasteful' || item.severity === 'severe')
                  .map((redundancy, idx) => (
                    <div key={idx} className="p-4 rounded-lg border bg-slate-50">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge className={REDUNDANCY_SEVERITY_COLORS[redundancy.severity]}>
                              {redundancy.severity}
                            </Badge>
                            <span className="font-semibold text-slate-900">
                              {redundancy.tools.join(' + ')}
                            </span>
                          </div>
                          <p className="text-sm text-slate-600 mb-2">{redundancy.overlap_reason}</p>
                          <p className="text-sm text-blue-600 font-medium">
                            ✓ {redundancy.recommended_action}
                          </p>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <div className="text-lg font-bold text-red-600">
                            ${redundancy.monthly_waste.toFixed(0)}/mo
                          </div>
                          <div className="text-xs text-slate-500">wasted</div>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Outdated Tools */}
        {comparison.stack_analysis.outdated_tools.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-orange-600" />
                Stack Analysis - Optimization Opportunities
              </CardTitle>
              <CardDescription>
                Tools that can be modernized, optimized, or replaced with better alternatives
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {comparison.stack_analysis.outdated_tools.map((tool, idx) => (
                  <div key={idx} className="p-4 rounded-lg border bg-slate-50">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge className={ISSUE_TYPE_COLORS[tool.issue_type]}>
                            {ISSUE_TYPE_LABELS[tool.issue_type]}
                          </Badge>
                          <span className="font-semibold text-slate-900">{tool.tool}</span>
                        </div>
                        <p className="text-sm text-slate-600 mb-2">{tool.issue}</p>
                        <div className="flex items-center gap-2 text-sm">
                          <span className="text-slate-600">Recommended:</span>
                          <span className="font-semibold text-blue-600">{tool.recommended_replacement}</span>
                          <span className="text-slate-500">
                            (${tool.replacement_cost.toFixed(0)}/mo)
                          </span>
                        </div>
                        {tool.additional_benefits && tool.additional_benefits.length > 0 && (
                          <div className="mt-2 flex flex-wrap gap-1">
                            {tool.additional_benefits.map((benefit, bidx) => (
                              <Badge key={bidx} variant="outline" className="text-xs">
                                {benefit}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="text-right flex-shrink-0">
                        <div className="text-lg font-bold text-green-600">
                          ${tool.monthly_savings.toFixed(0)}/mo
                        </div>
                        <div className="text-xs text-slate-500">
                          ${tool.annual_savings.toLocaleString()}/yr
                        </div>
                        <Badge variant="secondary" className="mt-1">
                          {tool.confidence} confidence
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Actions */}
        <Card className="bg-gradient-to-r from-blue-50 to-cyan-50">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div>
                <h3 className="font-semibold text-slate-900 mb-1">Ready to optimize your stack?</h3>
                <p className="text-sm text-slate-600">
                  Download your full report or schedule a consultation with our team.
                </p>
              </div>
              <div className="flex gap-3">
                <Button variant="outline">Download PDF Report</Button>
                <Button className="bg-gradient-to-r from-blue-600 to-cyan-600">
                  Schedule Consultation
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
