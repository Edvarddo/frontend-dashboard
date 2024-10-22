import { useEffect, useState } from 'react'
import { format, set } from 'date-fns'
import { es } from 'date-fns/locale'
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { CalendarIcon } from "lucide-react"

const DatePicker = ({selectedDate, setSelectedDate, setIsValid, isValid}) => {
  // i want this format "dd-MM-yyyy"
  const [inputValue, setInputValue] = useState("");
  const handleDateSelect = (date) => {
    console.log(date)
    setSelectedDate(date)
    setInputValue(format(date, "yyyy-MM-dd", { locale: es }))
  }

  const handleInputChange = (event) => {
    const val = event.target.value;
    setInputValue(val); 
    // validate input with regex
    const regex = /^\d{2}-\d{2}-\d{4}$/;
    const valid = val === "" ? true :  regex.test(val);
    console.log(valid)
    setIsValid(!valid);
    


    
  };
  useEffect(() => {
    if(selectedDate === null){
      setInputValue("")

    }
  }, [selectedDate])



  // const fechaVal = selectedDate ? format(selectedDate,"yyyy-MM-dd", {locale: es}).toString() : ""

  return (
    <div className="flex  p-1 w-full">
      <input
      onChange={handleInputChange} 
      value={inputValue} 
      type="text" 
      className="border rounded-l px-2 py-1 w-full md:w-1/2" 
      placeholder="Ej: 31-10-2024" 
      pattern="\d{2}-\d{2}-\d{4}"  

      />

      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={`   font-normal ${!selectedDate && "text-muted-foreground"}`}
          >
            <CalendarIcon className="mr-auto h-4 w-4" />
            {/* {selectedDate ? format(selectedDate, "PPP", { locale: es }) : ""} */}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={handleDateSelect}
            initialFocus
            locale = {es}
          />
        </PopoverContent>
      </Popover>

    </div>

  )
}

export default DatePicker