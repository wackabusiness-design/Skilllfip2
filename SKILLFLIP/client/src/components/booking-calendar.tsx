import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { ChevronLeft, ChevronRight, Clock, Calendar as CalendarIcon } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

interface BookingCalendarProps {
  onDateSelect: (date: Date | undefined) => void;
  onTimeSelect: (time: string) => void;
  selectedDate?: Date;
  selectedTime?: string;
  creatorId: string;
}

export default function BookingCalendar({
  onDateSelect,
  onTimeSelect,
  selectedDate,
  selectedTime,
  creatorId
}: BookingCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);

  const { data: creatorAvailability = [] } = useQuery({
    queryKey: ["/api/creators", creatorId, "availability"],
    enabled: !!creatorId,
  });

  // Generate time slots based on creator availability and selected date
  useEffect(() => {
    if (!selectedDate || !creatorAvailability.length) {
      setAvailableSlots([]);
      return;
    }

    const dayOfWeek = selectedDate.getDay();
    const dayAvailability = creatorAvailability.filter(
      (av: any) => av.dayOfWeek === dayOfWeek && av.isAvailable
    );

    if (!dayAvailability.length) {
      setAvailableSlots([]);
      return;
    }

    // Generate 30-minute slots for each availability window
    const slots: string[] = [];
    dayAvailability.forEach((av: any) => {
      const startTime = av.startTime; // "HH:MM" format
      const endTime = av.endTime;     // "HH:MM" format
      
      const [startHour, startMinute] = startTime.split(':').map(Number);
      const [endHour, endMinute] = endTime.split(':').map(Number);
      
      const startMinutes = startHour * 60 + startMinute;
      const endMinutes = endHour * 60 + endMinute;
      
      for (let minutes = startMinutes; minutes < endMinutes; minutes += 30) {
        const hour = Math.floor(minutes / 60);
        const minute = minutes % 60;
        const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        
        // Check if this slot is in the future (if selected date is today)
        const now = new Date();
        const isToday = selectedDate.toDateString() === now.toDateString();
        const currentMinutes = now.getHours() * 60 + now.getMinutes();
        
        if (!isToday || minutes > currentMinutes + 60) { // 1 hour buffer
          slots.push(timeString);
        }
      }
    });

    setAvailableSlots(slots);
  }, [selectedDate, creatorAvailability]);

  // Mock some unavailable dates (bookings, holidays, etc.)
  const isDateUnavailable = (date: Date) => {
    const today = new Date();
    const dayOfWeek = date.getDay();
    
    // Past dates are unavailable
    if (date < today) return true;
    
    // Check if creator has availability for this day of week
    const hasAvailability = creatorAvailability.some(
      (av: any) => av.dayOfWeek === dayOfWeek && av.isAvailable
    );
    
    return !hasAvailability;
  };

  const formatTimeSlot = (time: string) => {
    const [hour, minute] = time.split(':').map(Number);
    const period = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    return `${displayHour}:${minute.toString().padStart(2, '0')} ${period}`;
  };

  const getTimeSlotStatus = (time: string) => {
    // In a real app, this would check actual bookings
    // For now, randomly mark some slots as booked for demo
    const mockBookedSlots = ['09:00', '14:30', '16:00'];
    return mockBookedSlots.includes(time) ? 'booked' : 'available';
  };

  return (
    <div className="grid md:grid-cols-2 gap-6">
      {/* Calendar */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <CalendarIcon className="h-5 w-5 mr-2" />
              Select Date
            </h3>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const prev = new Date(currentMonth);
                  prev.setMonth(prev.getMonth() - 1);
                  setCurrentMonth(prev);
                }}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm font-medium min-w-[120px] text-center">
                {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const next = new Date(currentMonth);
                  next.setMonth(next.getMonth() + 1);
                  setCurrentMonth(next);
                }}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={onDateSelect}
            month={currentMonth}
            onMonthChange={setCurrentMonth}
            disabled={isDateUnavailable}
            className="rounded-md border"
            classNames={{
              day_disabled: "text-gray-300 cursor-not-allowed",
              day_selected: "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
              day_today: "bg-accent text-accent-foreground",
            }}
          />
          
          <div className="mt-4 space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <div className="w-3 h-3 bg-primary rounded"></div>
              <span>Selected</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <div className="w-3 h-3 bg-accent rounded"></div>
              <span>Today</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <div className="w-3 h-3 bg-gray-300 rounded"></div>
              <span>Unavailable</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Time Slots */}
      <Card>
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Clock className="h-5 w-5 mr-2" />
            Available Times
          </h3>
          
          {!selectedDate ? (
            <div className="text-center py-8">
              <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-500">Please select a date first</p>
            </div>
          ) : availableSlots.length === 0 ? (
            <div className="text-center py-8">
              <Clock className="h-12 w-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-500">No available time slots for this date</p>
              <p className="text-sm text-gray-400 mt-1">Try selecting a different date</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              <div className="text-sm text-gray-600 mb-3">
                {selectedDate.toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </div>
              
              {availableSlots.map((time) => {
                const status = getTimeSlotStatus(time);
                const isSelected = selectedTime === time;
                const isBooked = status === 'booked';
                
                return (
                  <Button
                    key={time}
                    variant={isSelected ? "default" : "outline"}
                    className={`w-full justify-between ${
                      isBooked 
                        ? "opacity-50 cursor-not-allowed" 
                        : isSelected 
                        ? "bg-primary text-primary-foreground" 
                        : "hover:bg-gray-50"
                    }`}
                    disabled={isBooked}
                    onClick={() => !isBooked && onTimeSelect(time)}
                  >
                    <span>{formatTimeSlot(time)}</span>
                    {isBooked ? (
                      <Badge variant="secondary" className="bg-red-100 text-red-800">
                        Booked
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="bg-green-100 text-green-800">
                        Available
                      </Badge>
                    )}
                  </Button>
                );
              })}
            </div>
          )}
          
          {selectedDate && availableSlots.length > 0 && (
            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Note:</strong> Times are shown in your local timezone. 
                The creator will be notified of the booking in their timezone.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
