import {useState} from "react"
import { addDays, format } from "date-fns"
import { Calendar as CalendarIcon } from "lucide-react"
// import { DateRange } from "react-day-picker"
import { es } from 'date-fns/locale'
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

const Descargar = () => {
  const position = [51.505, -0.09]
  // actual date range
  const [date, setDate] = useState({
    from: new Date(),
    to: addDays(new Date(), 20),
  })
  const handleSelectedDate = (date) => {
    // dd-MM-yyyy
    console.log(format(date.from, "dd-MM-yyyy", { locale: es }))
    console.log(format(date.to, "dd-MM-yyyy", { locale: es }))
    setDate(date)
  }

  // const [date, setDate] = useState({
  //   from: new Date(2022, 0, 20),
  //   to: new Date(new Date(2022, 0, 20).getTime() + 20 * 24 * 60 * 60 * 1000),
  // });
  return (
    <>
      <div className={""}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant={"outline"}
            className={cn(
              "w-[300px] justify-start text-left font-normal flex items-center justify-center",
              !date && "text-muted-foreground"
            )}
          >
            <CalendarIcon
              locale={es}
              className="mr-2 h-4 w-4"
            />
            {date?.from ? (
              date.to ? (
                <>
                  {format(date.from, "LLL dd, y", 
                  {locale: es}
                  )} -{" "}
                  {format(date.to, "LLL dd, y",
                  {locale: es}
                  )}
                </>
              ) : (
                format(date.from, "LLL dd, y")
              )
            ) : (
              <span>Pick a date</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={date?.from}
            selected={date}
            onSelect={handleSelectedDate}
            numberOfMonths={2}
            locale = {es}
            
          />
        </PopoverContent>
      </Popover>
    </div>
    </>
  )
}

export default Descargar