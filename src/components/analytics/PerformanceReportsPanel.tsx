/**
 * Performance Reports Panel Component
 * Provides interface for generating, viewing, and exporting detailed performance reports
 */

'use client';

import React, { useState, useCallback, useMemo } from 'react';
import { format, subDays, subWeeks, startOfWeek, endOfWeek } from 'date-fns';
import { Download, FileText, TrendingUp, Calendar, Settings, Eye } from 'lucide-react';

import type {
  ReportType,
  DateRange,
  WeeklyProgressReport,
  TopicMasteryReport,
  PDFExportOptions,
  ReportMetadata
} from '@/types/performance-reports';

// Mock data for demonstration - in real implementation, these would come from API
const MOCK_REPORTS: ReportMetadata[] = [
  {
    id: 'weekly-2025-01-20',
    type: 'weekly-progress',
    title: 'Weekly Progress Report - Jan 13-19, 2025',
    description: 'Comprehensive weekly performance analysis',
    generatedDate: new Date('2025-01-20'),
    dateRange: {
      start: new Date('2025-01-13'),
      end: new Date('2025-01-19'),
      label: 'Jan 13-19, 2025'
    },
    userId: 'user123',
    format: 'json',
    version: '1.0'
  },
  {
    id: 'mastery-2025-01-20',
    type: 'topic-mastery',
    title: 'Topic Mastery Analysis - January 2025',
    description: 'Detailed skill mastery assessment',
    generatedDate: new Date('2025-01-20'),
    dateRange: {
      start: new Date('2025-01-01'),
      end: new Date('2025-01-20'),
      label: 'January 2025'
    },
    userId: 'user123',
    format: 'json',
    version: '1.0'
  }
];

interface PerformanceReportsPanelProps {
  userId: string;
  className?: string;
}

interface DateRangeOption {
  label: string;
  value: string;
  getRange: () => DateRange;
}

export default function PerformanceReportsPanel({
  userId,
  className = ''
}: PerformanceReportsPanelProps) {
  const [selectedReportType, setSelectedReportType] = useState<ReportType>('weekly-progress');
  const [selectedDateRange, setSelectedDateRange] = useState<string>('last-week');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedReports, setGeneratedReports] = useState<ReportMetadata[]>(MOCK_REPORTS);
  const [pdfOptions, setPdfOptions] = useState<PDFExportOptions>({
    includeCharts: true,
    includeDetailedData: true,
    colorScheme: 'color',
    pageSize: 'letter',
    orientation: 'portrait',
    includeRawData: false
  });

  // Date range options
  const dateRangeOptions: DateRangeOption[] = useMemo(() => [
    {
      label: 'Last 7 Days',
      value: 'last-week',
      getRange: () => ({
        start: subDays(new Date(), 7),
        end: new Date(),
        label: 'Last 7 days'
      })
    },
    {
      label: 'This Week',
      value: 'this-week',
      getRange: () => ({
        start: startOfWeek(new Date(), { weekStartsOn: 1 }),
        end: endOfWeek(new Date(), { weekStartsOn: 1 }),
        label: 'This week'
      })
    },
    {
      label: 'Last 30 Days',
      value: 'last-month',
      getRange: () => ({
        start: subDays(new Date(), 30),
        end: new Date(),
        label: 'Last 30 days'
      })
    },
    {
      label: 'Last 3 Months',
      value: 'last-quarter',
      getRange: () => ({
        start: subDays(new Date(), 90),
        end: new Date(),
        label: 'Last 3 months'
      })
    }
  ], []);

  const reportTypeOptions = [
    {
      value: 'weekly-progress' as ReportType,
      label: 'Weekly Progress',
      description: 'Comprehensive weekly performance analysis',
      icon: TrendingUp
    },
    {
      value: 'topic-mastery' as ReportType,
      label: 'Topic Mastery',
      description: 'Detailed skill proficiency assessment',
      icon: FileText
    },
    {
      value: 'error-analysis' as ReportType,
      label: 'Error Analysis',
      description: 'Pattern analysis of mistakes and improvements',
      icon: FileText
    },
    {
      value: 'time-allocation' as ReportType,
      label: 'Time Allocation',
      description: 'Study time distribution and optimization',
      icon: Calendar
    },
    {
      value: 'improvement-velocity' as ReportType,
      label: 'Improvement Velocity',
      description: 'Rate of progress and learning acceleration',
      icon: TrendingUp
    },
    {
      value: 'goal-tracking' as ReportType,
      label: 'Goal Tracking',
      description: 'Progress toward defined objectives',
      icon: FileText
    }
  ];

  const handleGenerateReport = useCallback(async () => {
    setIsGenerating(true);

    try {
      // Get selected date range
      const selectedOption = dateRangeOptions.find(option => option.value === selectedDateRange);
      const dateRange = selectedOption?.getRange() || dateRangeOptions[0].getRange();

      // Simulate API call to generate report
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Create new report metadata
      const newReport: ReportMetadata = {
        id: `${selectedReportType}-${Date.now()}`,
        type: selectedReportType,
        title: `${reportTypeOptions.find(opt => opt.value === selectedReportType)?.label} - ${dateRange.label}`,
        description: reportTypeOptions.find(opt => opt.value === selectedReportType)?.description || '',
        generatedDate: new Date(),
        dateRange,
        userId,
        format: 'json',
        version: '1.0'
      };

      // Add to generated reports
      setGeneratedReports(prev => [newReport, ...prev]);

      // Success notification would go here
      console.log('Report generated successfully:', newReport);

    } catch (error) {
      console.error('Error generating report:', error);
      // Error notification would go here
    } finally {
      setIsGenerating(false);
    }
  }, [selectedReportType, selectedDateRange, dateRangeOptions, userId, reportTypeOptions]);

  const handleExportToPDF = useCallback(async (reportId: string) => {
    try {
      console.log('Exporting report to PDF:', reportId, pdfOptions);

      // Simulate PDF export
      await new Promise(resolve => setTimeout(resolve, 1500));

      // In real implementation, this would trigger a download
      const filename = `${reportId}-${format(new Date(), 'yyyy-MM-dd')}.pdf`;
      console.log('PDF would be downloaded as:', filename);

      // Success notification would go here
    } catch (error) {
      console.error('Error exporting PDF:', error);
      // Error notification would go here
    }
  }, [pdfOptions]);

  const handleViewReport = useCallback((reportId: string) => {
    // Navigate to detailed report view
    console.log('Viewing report:', reportId);
    // In real implementation: router.push(`/reports/${reportId}`)
  }, []);

  return (
    <div className={`performance-reports-panel space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Performance Reports</h2>
          <p className="text-gray-600">Generate detailed analytics and export professional reports</p>
        </div>
      </div>

      {/* Report Generation Panel */}
      <div className="bg-white rounded-lg border p-6 space-y-6">
        <div className="flex items-center gap-2">
          <Settings className="h-5 w-5 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900">Generate New Report</h3>
        </div>

        {/* Report Type Selection */}
        <div className="space-y-3">
          <label className="block text-sm font-medium text-gray-700">Report Type</label>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {reportTypeOptions.map((option) => {
              const IconComponent = option.icon;
              return (
                <button
                  key={option.value}
                  onClick={() => setSelectedReportType(option.value)}
                  className={`p-4 rounded-lg border-2 text-left transition-all ${
                    selectedReportType === option.value
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <IconComponent className={`h-5 w-5 ${
                      selectedReportType === option.value ? 'text-blue-600' : 'text-gray-400'
                    }`} />
                    <div>
                      <div className={`font-medium ${
                        selectedReportType === option.value ? 'text-blue-900' : 'text-gray-900'
                      }`}>
                        {option.label}
                      </div>
                      <div className="text-sm text-gray-600 mt-1">
                        {option.description}
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Date Range Selection */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-700">Time Period</label>
            <select
              value={selectedDateRange}
              onChange={(e) => setSelectedDateRange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {dateRangeOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* PDF Export Options */}
          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-700">Export Options</label>
            <div className="space-y-2">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={pdfOptions.includeCharts}
                  onChange={(e) => setPdfOptions(prev => ({
                    ...prev,
                    includeCharts: e.target.checked
                  }))}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-600">Include charts and visualizations</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={pdfOptions.includeDetailedData}
                  onChange={(e) => setPdfOptions(prev => ({
                    ...prev,
                    includeDetailedData: e.target.checked
                  }))}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-600">Include detailed data tables</span>
              </label>
              <div className="flex items-center gap-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="colorScheme"
                    value="color"
                    checked={pdfOptions.colorScheme === 'color'}
                    onChange={(e) => setPdfOptions(prev => ({
                      ...prev,
                      colorScheme: e.target.value as 'color' | 'grayscale'
                    }))}
                    className="text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-600">Color</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="colorScheme"
                    value="grayscale"
                    checked={pdfOptions.colorScheme === 'grayscale'}
                    onChange={(e) => setPdfOptions(prev => ({
                      ...prev,
                      colorScheme: e.target.value as 'color' | 'grayscale'
                    }))}
                    className="text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-600">Grayscale</span>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Generate Button */}
        <div className="flex justify-end">
          <button
            onClick={handleGenerateReport}
            disabled={isGenerating}
            className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isGenerating ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Generating...
              </div>
            ) : (
              'Generate Report'
            )}
          </button>
        </div>
      </div>

      {/* Generated Reports List */}
      <div className="bg-white rounded-lg border">
        <div className="p-6 border-b">
          <h3 className="text-lg font-semibold text-gray-900">Generated Reports</h3>
          <p className="text-sm text-gray-600">Access and export your performance reports</p>
        </div>

        <div className="divide-y divide-gray-200">
          {generatedReports.length === 0 ? (
            <div className="p-8 text-center">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No reports generated yet</p>
              <p className="text-sm text-gray-400">Generate your first report using the panel above</p>
            </div>
          ) : (
            generatedReports.map((report) => {
              const reportTypeOption = reportTypeOptions.find(opt => opt.value === report.type);
              const IconComponent = reportTypeOption?.icon || FileText;

              return (
                <div key={report.id} className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <IconComponent className="h-6 w-6 text-blue-600" />
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">{report.title}</h4>
                        <p className="text-sm text-gray-600 mt-1">{report.description}</p>
                        <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                          <span>Generated {format(report.generatedDate, 'MMM dd, yyyy')}</span>
                          <span>•</span>
                          <span>{report.dateRange.label}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleViewReport(report.id)}
                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="View Report"
                      >
                        <Eye className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleExportToPDF(report.id)}
                        className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                        title="Export to PDF"
                      >
                        <Download className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}