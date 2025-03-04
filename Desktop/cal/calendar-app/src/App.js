// Dynamic Event Calendar Application
// ==================================

// Imports
import React, { useState, useEffect } from 'react';
import { format, startOfMonth, endOfMonth, startOfWeek, addDays, addMonths, subMonths, isSameDay, isToday } from 'date-fns';
import "./App.css"; // Add your CSS styles here

const Calendar = () => {
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [events, setEvents] = useState(() => {
        const savedEvents = localStorage.getItem('events');
        return savedEvents ? JSON.parse(savedEvents) : [];
    });
    const [modalData, setModalData] = useState({ isOpen: false, event: null });

    // Generate calendar dates
    const generateCalendar = () => {
        const start = startOfWeek(startOfMonth(currentMonth));
        const end = endOfMonth(currentMonth);
        const dates = [];
        let currentDate = start;

        while (currentDate <= end) {
            dates.push(currentDate);
            currentDate = addDays(currentDate, 1);
        }

        return dates;
    };

    const handleDayClick = (date) => {
        setSelectedDate(date);
    };

    const handleAddEvent = (newEvent) => {
        setEvents((prevEvents) => {
            const updatedEvents = [...prevEvents, newEvent];
            localStorage.setItem('events', JSON.stringify(updatedEvents));
            return updatedEvents;
        });
        setModalData({ isOpen: false, event: null });
    };

    const handleDeleteEvent = (eventId) => {
        setEvents((prevEvents) => {
            const updatedEvents = prevEvents.filter((event) => event.id !== eventId);
            localStorage.setItem('events', JSON.stringify(updatedEvents));
            return updatedEvents;
        });
    };

    const eventsForSelectedDate = events.filter((event) => isSameDay(new Date(event.date), selectedDate));

    const openModal = () => setModalData({ isOpen: true, event: null });
    const closeModal = () => setModalData({ isOpen: false, event: null });

    const handleNextMonth = () => {
        setCurrentMonth(addMonths(currentMonth, 1));
    };

    const handlePrevMonth = () => {
        setCurrentMonth(subMonths(currentMonth, 1));
    };

    const renderCalendar = () => {
        const dates = generateCalendar();
        return (
            <div className="calendar-grid">
                {dates.map((date, index) => (
                    <div
                        key={index}
                        className={`calendar-cell ${isSameDay(date, selectedDate) ? 'selected' : ''} ${isToday(date) ? 'today' : ''}`}
                        onClick={() => handleDayClick(date)}
                    >
                        {format(date, 'd')}
                        {events.some((event) => isSameDay(new Date(event.date), date)) && (
                            <span className="event-indicator"></span>
                        )}
                    </div>
                ))}
            </div>
        );
    };

    return (
        <div className="calendar-container">
            <header>
                <button className="nav-button" onClick={handlePrevMonth}>Previous</button>
                <h2>{format(currentMonth, 'MMMM yyyy')}</h2>
                <button className="nav-button" onClick={handleNextMonth}>Next</button>
            </header>

            {renderCalendar()}

            <div className="event-list">
                <h3>Events for {format(selectedDate, 'MMMM d, yyyy')}</h3>
                {eventsForSelectedDate.length > 0 ? (
                    <ul>
                        {eventsForSelectedDate.map((event) => (
                            <li key={event.id}>
                                <strong>{event.name}</strong> ({event.startTime} - {event.endTime})
                                <button className="delete-button" onClick={() => handleDeleteEvent(event.id)}>Delete</button>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p>No events for this day.</p>
                )}
                <button className="add-button" onClick={openModal}>Add Event</button>
            </div>

            {modalData.isOpen && (
                <EventModal
                    closeModal={closeModal}
                    date={selectedDate}
                    addEvent={handleAddEvent}
                />
            )}
        </div>
    );
};

const EventModal = ({ closeModal, date, addEvent }) => {
    const [formData, setFormData] = useState({
        name: '',
        startTime: '',
        endTime: '',
        description: ''
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        addEvent({
            id: Date.now(),
            date,
            ...formData
        });
    };

    return (
        <div className="modal-overlay">
            <div className="modal">
                <form onSubmit={handleSubmit}>
                    <h3>Add Event for {format(date, 'MMMM d, yyyy')}</h3>
                    <input
                        type="text"
                        name="name"
                        placeholder="Event Name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                    />
                    <input
                        type="time"
                        name="startTime"
                        value={formData.startTime}
                        onChange={handleChange}
                        required
                    />
                    <input
                        type="time"
                        name="endTime"
                        value={formData.endTime}
                        onChange={handleChange}
                        required
                    />
                    <textarea
                        name="description"
                        placeholder="Description"
                        value={formData.description}
                        onChange={handleChange}
                    ></textarea>
                    <button className="add-button" type="submit">Add Event</button>
                    <button className="cancel-button" type="button" onClick={closeModal}>Cancel</button>
                </form>
            </div>
        </div>
    );
};

export default Calendar;
