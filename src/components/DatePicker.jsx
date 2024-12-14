import { useState, useEffect } from 'react'
import { format, set } from 'date-fns'
import { es } from 'date-fns/locale'
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { CalendarIcon } from 'lucide-react'

const DatePicker = ({ dateRange, setDateRange, setIsValid }) => {
  const [inputValue, setInputValue] = useState("")

  const handleDateSelect = (range) => {
    
    setDateRange(range)
    if (!range?.to) {
      setInputValue(`${format(range.from, "dd-MM-yyyy", { locale: es })} -`)
      setIsValid(true)
    }
    if (range?.from && range?.to) {
      setInputValue(`${format(range.from, "dd-MM-yyyy", { locale: es })} - ${format(range.to, "dd-MM-yyyy", { locale: es })}`)
      setIsValid(false)
    }
  }

  const handleInputChange = (event) => {
    const val = event.target.value
    setInputValue(val)
    // validate input with regex
    const regex = /^\d{2}-\d{2}-\d{4} - \d{2}-\d{2}-\d{4}$/
    const valid = val === "" ? true : regex.test(val)
    setIsValid(!valid)
  }

  useEffect(() => {
    if (!dateRange || (!dateRange.from && !dateRange.to)) {
      setInputValue("")
    }
  }, [dateRange])

  return (
    <div className="flex p-1 w-full ">
      <input
        onChange={handleInputChange}
        value={inputValue}
        type="text"
        className="border rounded-l px-2 py-1 w-full "
        placeholder="Ej: 01-01-2024 - 31-12-2024"
        pattern="\d{2}-\d{2}-\d{4} - \d{2}-\d{2}-\d{4}"
      />

      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={`font-normal ${!dateRange && "text-muted-foreground"}`}
          >
            <CalendarIcon className="mr-auto h-4 w-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0">
          <Calendar
            mode="range"
            selected={dateRange}
            onSelect={handleDateSelect}
            initialFocus
            numberOfMonths={2}
            locale={es}
            centered
            
          />
        </PopoverContent>
      </Popover>
    </div>
  )
}

export default DatePicker

