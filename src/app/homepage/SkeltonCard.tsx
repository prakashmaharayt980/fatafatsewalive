import React from 'react'

function SkeltonCard() {
  return (
      <div  className="w-full bg-white">
        <div className="flex items-center justify-between p-4">
          <div className="h-6 w-32 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-6 w-24 bg-gray-200 rounded animate-pulse"></div>
        </div>
        <hr className="mx-2 border-b-2 border-gray-200" />
        <div className="p-4">
          <div className="flex gap-4 overflow-x-hidden">
            {[...Array(6)].map((_, index) => (
              <div key={index} className="flex-shrink-0 w-[calc(16.666%-6px)]">
                <div className="bg-white rounded-lg p-2">
                  <div className="w-full h-40 bg-gray-200 rounded-lg animate-pulse"></div>
                  <div className="mt-2 h-4 w-3/4 bg-gray-200 rounded animate-pulse"></div>
                  <div className="mt-2 h-4 w-1/2 bg-gray-200 rounded animate-pulse"></div>
                  <div className="mt-2 h-6 w-1/3 bg-gray-200 rounded animate-pulse"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
  )
}

export default SkeltonCard;
