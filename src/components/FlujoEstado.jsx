import React from 'react'
import { AlertCircle, MailQuestion, Clock, CheckCircle2, XCircle, ArrowRight, ArrowDown } from 'lucide-react'
import { cn } from "@/lib/utils"

const StatusFlow = ({ currentStatus }) => {
  const statuses = [
    { key: 'Pendiente', icon: AlertCircle, label: 'Pendiente' },
    { key: 'Recibido', icon: MailQuestion, label: 'Recibida' },
    { key: 'En curso', icon: Clock, label: 'En curso' },
    { 
      key: 'Final', 
      icon: currentStatus === 'Resuelto' ? CheckCircle2 : XCircle, 
      label: currentStatus === 'Resuelto' ? 'Resuelto' : 'No resuelto'
    }
  ]

  return (
    <div className="flex flex-col items-center justify-center w-full max-w-4xl mx-auto mt-6 px-4">
      <div className="flex flex-col md:flex-col lg:flex-row items-center justify-center w-full">
        {statuses.map((status, index) => (
          <React.Fragment key={status.key}>
            <div className="flex flex-col items-center mb-4 sm:mb-0 md:mb-4 lg:mb-0 p-1">
              <div 
                className={cn(
                  "w-36 h-24 rounded-lg flex flex-col items-center justify-center gap-3 transition-all",
                  currentStatus === status.key || (status.key === 'Final' && currentStatus === 'Resuelto')
                    ? "bg-green-50 border border-green-500"
                    : status.key === 'Final' && currentStatus === 'No resuelto'
                    ? "bg-red-50 border border-red-500" 
                    : "bg-white border border-gray-200 shadow-sm"
                )}
              >
                <status.icon 
                  className={cn(
                    "h-6 w-6",
                    currentStatus === status.key || (status.key === 'Final' && currentStatus === 'Resuelto')
                      ? "text-green-500"
                      : status.key === 'Final' && currentStatus === 'No resuelto'
                      ? "text-red-500"
                      : "text-gray-400"
                  )}
                />
                <span 
                  className={cn(
                    "text-sm text-center",
                    currentStatus === status.key || (status.key === 'Final' && currentStatus === 'Resuelto')
                      ? "text-green-600"
                      : status.key === 'Final' && currentStatus === 'No resuelto'
                      ? "text-red-600"
                      : "text-gray-500"
                  )}
                >
                  {status.label}
                </span>
              </div>
            </div>
            {index < statuses.length - 1 && (
              <>
                <div className="hidden lg:flex items-center justify-center w-8 h-24">
                  <ArrowRight className="w-6 h-6 text-gray-400" />
                </div>
                <div className="flex lg:hidden items-center justify-center w-24 h-8">
                  <ArrowDown className="w-6 h-6 text-gray-400" />
                </div>
              </>
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  )
}

export default StatusFlow

