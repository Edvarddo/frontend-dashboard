import { RefreshCw } from 'lucide-react'
import React from 'react'

const Spinner = ({text}) => {
    return (
        <div className="flex justify-center items-center">
            <RefreshCw className="w-6 h-6 animate-spin text-green-600 mr-2" />
            {text}
        </div>
    )
}

export default Spinner
