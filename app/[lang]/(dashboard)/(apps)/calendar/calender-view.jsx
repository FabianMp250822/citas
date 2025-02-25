"use client";
import React, { useState, useEffect } from "react";
import FullCalendar from "@fullcalendar/react"; // must go before plugins
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin, { Draggable } from "@fullcalendar/interaction";
import listPlugin from "@fullcalendar/list";
import EventSheet from "./event-sheet";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import ExternalDraggingevent from "./dragging-events";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Plus } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";

const wait = () => new Promise((resolve) => setTimeout(resolve, 1000));

const CalendarView = ({ events, categories }) => {
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedEventDate, setSelectedEventDate] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);

  // event canvas state
  const [sheetOpen, setSheetOpen] = useState(false);
  const [date, setDate] = React.useState(new Date());

  // Ejemplo de eventos para arrastrar
  const [dragEvents] = useState([
    { title: "Consulta inicial", id: "101", tag: "business" },
    { title: "Reunión con especialista", id: "102", tag: "meeting" },
    { title: "Revisión de exámenes", id: "103", tag: "holiday" },
    { title: "Consulta de seguimiento", id: "104", tag: "etc" },
  ]);

  useEffect(() => {
    // Inicializa las categorías seleccionadas con todas las que vengan
    setSelectedCategory(categories?.map((c) => c.value));
  }, [events, categories]);

  // Inicializar Draggable
  useEffect(() => {
    const draggableEl = document.getElementById("external-events");

    const initDraggable = () => {
      if (draggableEl) {
        new Draggable(draggableEl, {
          itemSelector: ".fc-event",
          eventData: function (eventEl) {
            let title = eventEl.getAttribute("title");
            let id = eventEl.getAttribute("data");
            let event = dragEvents.find((e) => e.id === id);
            let tag = event ? event.tag : "";
            return {
              title: title,
              id: id,
              extendedProps: {
                calendar: tag,
              },
            };
          },
        });
      }
    };

    if (dragEvents.length > 0) {
      initDraggable();
    }

    return () => {
      draggableEl?.removeEventListener("mousedown", initDraggable);
    };
  }, [dragEvents]);

  // Al hacer clic en un evento ya creado
  const handleEventClick = (arg) => {
    setSelectedEventDate(null);
    setSheetOpen(true);
    setSelectedEvent(arg);
    wait().then(() => (document.body.style.pointerEvents = "auto"));
  };

  // Cerrar el modal/canvas
  const handleCloseModal = () => {
    setSheetOpen(false);
    setSelectedEvent(null);
    setSelectedEventDate(null);
  };

  // Al hacer clic en un día del calendario
  const handleDateClick = (arg) => {
    setSheetOpen(true);
    setSelectedEventDate(arg);
    setSelectedEvent(null);
    wait().then(() => (document.body.style.pointerEvents = "auto"));
  };

  // Manejar selección de categoría (filtros)
  const handleCategorySelection = (category) => {
    if (selectedCategory.includes(category)) {
      setSelectedCategory(selectedCategory.filter((c) => c !== category));
    } else {
      setSelectedCategory([...selectedCategory, category]);
    }
  };

  // Asigna la clase CSS a cada evento según su tipo
  const handleClassName = (arg) => {
    if (arg.event.extendedProps.calendar === "holiday") {
      return "destructive";
    } else if (arg.event.extendedProps.calendar === "business") {
      return "primary";
    } else if (arg.event.extendedProps.calendar === "personal") {
      return "success";
    } else if (arg.event.extendedProps.calendar === "family") {
      return "info";
    } else if (arg.event.extendedProps.calendar === "etc") {
      return "info";
    } else if (arg.event.extendedProps.calendar === "meeting") {
      return "warning";
    }
  };

  // Filtra los eventos que se mostrarán según las categorías seleccionadas
const filteredEvents = events?.filter((event) => {
  // Si extendedProps o calendar no existen, será undefined
  const calendarValue = event?.extendedProps?.calendar;
  // Si selectedCategory es null o undefined, este return dará undefined (falsy)
  return selectedCategory?.includes(calendarValue);
});


  return (
    <>
      <div className="grid grid-cols-12 gap-6 divide-x divide-border">
        {/* Panel Izquierdo */}
        <Card className="col-span-12 lg:col-span-4 2xl:col-span-3 pb-5">
          <CardContent className="p-0">
            <CardHeader className="border-none mb-2 pt-5">
              {/* Botón para agendar nueva cita */}
              <Button onClick={handleDateClick}>
                <Plus className="w-4 h-4 text-primary-foreground ltr:mr-1 rtl:ml-1" />
                Agendar cita
              </Button>
            </CardHeader>

            {/* Pequeño calendario de referencia */}
            <div className="px-3">
              <Calendar
                mode="single"
                selected={date}
                onSelect={(s) => {
                  handleDateClick(s);
                }}
                className="rounded-md border w-full p-0 border-none"
              />
            </div>

            {/* Eventos para arrastrar */}
            <div id="external-events" className="space-y-1.5 mt-6 px-4">
              <p className="text-sm font-medium text-default-700 pb-2">
                Arrastra y suelta tu cita o haz clic en el calendario
              </p>
              {dragEvents.map((event) => (
                <ExternalDraggingevent key={event.id} event={event} />
              ))}
            </div>

            {/* Filtros */}
            <div className="py-4 text-default-800 font-semibold text-xs uppercase mt-4 px-4">
              FILTRAR
            </div>
            <ul className="space-y-2 px-4">
              <li className="flex gap-3">
                <Checkbox
                  checked={selectedCategory?.length === categories?.length}
                  onClick={() => {
                    if (selectedCategory?.length === categories?.length) {
                      setSelectedCategory([]);
                    } else {
                      setSelectedCategory(categories.map((c) => c.value));
                    }
                  }}
                />
                <Label>Todas</Label>
              </li>
              {categories?.map((category) => (
                <li className="flex gap-3" key={category.value}>
                  <Checkbox
                    className={category.className}
                    id={category.label}
                    checked={selectedCategory?.includes(category.value)}
                    onClick={() => handleCategorySelection(category.value)}
                  />
                  <Label htmlFor={category.label}>{category.label}</Label>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* Panel Derecho (Calendario principal) */}
        <Card className="col-span-12 lg:col-span-8 2xl:col-span-9 pt-5">
          <CardContent className="dash-tail-calendar">
            <FullCalendar
              plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin, listPlugin]}
              headerToolbar={{
                left: "prev,next today",
                center: "title",
                right: "dayGridMonth,timeGridWeek,timeGridDay,listWeek",
              }}
              events={filteredEvents}
              editable={true}
              rerenderDelay={10}
              eventDurationEditable={false}
              selectable={true}
              selectMirror={true}
              droppable={true}
              dayMaxEvents={2}
              weekends={true}
              eventClassNames={handleClassName}
              dateClick={handleDateClick}
              eventClick={handleEventClick}
              initialView="dayGridMonth"
            />
          </CardContent>
        </Card>
      </div>

      {/* Hoja lateral (modal) para crear/editar citas */}
      <EventSheet
        open={sheetOpen}
        onClose={handleCloseModal}
        categories={categories}
        event={selectedEvent}
        selectedDate={selectedEventDate}
      />
    </>
  );
};

export default CalendarView;
