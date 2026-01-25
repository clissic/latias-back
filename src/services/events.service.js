import { eventsModel } from "../DAO/models/events.model.js";
import crypto from "crypto";

class EventsService {
  async getAll() {
    const events = await eventsModel.getAll();
    return events;
  }

  async getActive() {
    const events = await eventsModel.getActive();
    return events;
  }

  async findById(id) {
    const event = await eventsModel.findById(id);
    return event;
  }

  async findByEventId(eventId) {
    const event = await eventsModel.findByEventId(eventId);
    return event;
  }

  async create(eventData) {
    // Validar que remainingTickets sea igual a availableTickets al crear
    if (eventData.tickets) {
      if (eventData.tickets.remainingTickets === undefined) {
        eventData.tickets.remainingTickets = eventData.tickets.availableTickets || 0;
      }
      if (eventData.tickets.soldTickets === undefined) {
        eventData.tickets.soldTickets = 0;
      }
    }

    // Inicializar peopleRegistered como array vacío si no existe
    if (!eventData.peopleRegistered) {
      eventData.peopleRegistered = [];
    }

    // Calcular active automáticamente basado en la fecha
    if (eventData.date) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const eventDate = new Date(eventData.date);
      eventDate.setHours(0, 0, 0, 0);
      // Si la fecha del evento es posterior o igual a hoy, está activo
      eventData.active = eventDate >= today;
    } else {
      eventData.active = true; // Por defecto activo si no hay fecha
    }

    // Generar eventId automáticamente si no se proporciona o está vacío
    // Intentar crear el evento con un eventId único
    let eventCreated;
    let attempts = 0;
    const maxAttempts = 5;

    // Crear una copia profunda del objeto original para evitar mutaciones
    const baseEventData = JSON.parse(JSON.stringify(eventData));
    
    // Eliminar eventId si viene vacío o undefined
    if (!baseEventData.eventId || (typeof baseEventData.eventId === 'string' && baseEventData.eventId.trim() === "")) {
      delete baseEventData.eventId;
    }

    while (attempts < maxAttempts) {
      try {
        // Crear una nueva copia en cada intento
        const eventDataCopy = JSON.parse(JSON.stringify(baseEventData));

        // Generar un eventId simple: EVT- + string aleatorio
        const randomString = crypto.randomBytes(8).toString('hex').toUpperCase();
        eventDataCopy.eventId = `EVT-${randomString}`;

        eventCreated = await eventsModel.create(eventDataCopy);
        
        // Si se creó exitosamente, salir del loop
        break;
      } catch (error) {
        // Si es un error de duplicado (código 11000) y aún hay intentos, reintentar
        if (error.code === 11000 && attempts < maxAttempts - 1) {
          attempts++;
          // Pequeño delay antes del siguiente intento
          await new Promise(resolve => setTimeout(resolve, 50));
          continue;
        } else {
          // Si no es un error de duplicado o se agotaron los intentos, lanzar el error
          throw error;
        }
      }
    }
    
    if (!eventCreated) {
      throw new Error("No se pudo crear el evento después de múltiples intentos");
    }
    
    return eventCreated;
  }

  async updateOne(eventData) {
    // Si se actualiza la fecha, recalcular active automáticamente
    if (eventData.date) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const eventDate = new Date(eventData.date);
      eventDate.setHours(0, 0, 0, 0);
      // Si la fecha del evento es posterior o igual a hoy, está activo
      eventData.active = eventDate >= today;
    }

    const eventUpdated = await eventsModel.updateOne(eventData);
    return eventUpdated;
  }

  async deleteOne(_id) {
    const result = await eventsModel.deleteOne(_id);
    return result;
  }

  async purchaseTicket(eventId, quantity = 1, userData = null) {
    const event = await eventsModel.findByEventId(eventId);
    if (!event) {
      throw new Error("Evento no encontrado");
    }

    if (!event.active) {
      throw new Error("El evento no está activo");
    }

    // Verificar que la fecha del evento no haya pasado
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const eventDate = new Date(event.date);
    eventDate.setHours(0, 0, 0, 0);

    if (eventDate < today) {
      throw new Error("El evento ya ha pasado");
    }

    // Verificar que hay suficientes tickets disponibles
    if (event.tickets.remainingTickets < quantity) {
      throw new Error("No hay suficientes tickets disponibles");
    }

    // Si se proporciona userData, registrar a la persona
    if (userData && userData.firstName && userData.lastName && userData.ci) {
      // Generar ticketId simple: TKT- + string aleatorio
      const randomString = crypto.randomBytes(8).toString('hex').toUpperCase();
      const ticketId = `TKT-${randomString}`;

      const personData = {
        firstName: userData.firstName,
        lastName: userData.lastName,
        ci: userData.ci,
        ticketId: ticketId,
        available: true, // Ticket disponible por defecto
        registeredAt: new Date()
      };

      // Agregar persona al array y actualizar tickets
      await eventsModel.registerPerson({ _id: event._id, personData, quantity });
      
      return { 
        matchedCount: 1, 
        ticketId: ticketId,
        personData: personData
      };
    } else {
      // Solo actualizar tickets sin registrar persona
      const result = await eventsModel.updateTickets({ _id: event._id, quantity });
      return result;
    }
  }

  async deactivateExpiredEvents() {
    const result = await eventsModel.deactivateExpiredEvents();
    return result;
  }

  async getExpiredEvents() {
    const events = await eventsModel.getExpiredEvents();
    return events;
  }

  async verifyTicket(ticketId) {
    const event = await eventsModel.findByTicketId(ticketId);
    if (!event) {
      return null;
    }

    // Buscar la persona registrada con ese ticketId
    const person = event.peopleRegistered.find(p => p.ticketId === ticketId);
    if (!person) {
      return null;
    }

    return {
      event: {
        eventId: event.eventId,
        title: event.title,
        date: event.date,
        hour: event.hour,
        location: event.location
      },
      person: person,
      isValid: true,
      available: person.available !== undefined ? person.available : true // Estado del ticket
    };
  }

  async verifyTicketCheckin(ticketId, checkinUser) {
    const event = await eventsModel.findByTicketId(ticketId);
    if (!event) {
      // Ticket no existe - crear log de ticket inválido
      const logData = {
        ticketId: ticketId,
        eventId: "S/D",
        eventTitle: "S/D",
        personFirstName: "S/D",
        personLastName: "S/D",
        personCi: "S/D",
        checkedBy: {
          userId: checkinUser.userId,
          firstName: checkinUser.firstName,
          lastName: checkinUser.lastName,
          email: checkinUser.email
        },
        action: 'invalid',
        previousAvailable: null,
        newAvailable: null,
        timestamp: new Date()
      };

      return {
        event: null,
        person: null,
        isValid: false,
        processed: false,
        logData: logData
      };
    }

    // Buscar la persona registrada con ese ticketId
    const personIndex = event.peopleRegistered.findIndex(p => p.ticketId === ticketId);
    if (personIndex === -1) {
      // Ticket no encontrado en el evento - crear log de ticket inválido
      const logData = {
        ticketId: ticketId,
        eventId: event.eventId || "S/D",
        eventTitle: event.title || "S/D",
        personFirstName: "S/D",
        personLastName: "S/D",
        personCi: "S/D",
        checkedBy: {
          userId: checkinUser.userId,
          firstName: checkinUser.firstName,
          lastName: checkinUser.lastName,
          email: checkinUser.email
        },
        action: 'invalid',
        previousAvailable: null,
        newAvailable: null,
        timestamp: new Date()
      };

      return {
        event: {
          eventId: event.eventId,
          title: event.title,
          date: event.date,
          hour: event.hour,
          location: event.location
        },
        person: null,
        isValid: false,
        processed: false,
        logData: logData
      };
    }

    const person = event.peopleRegistered[personIndex];
    const previousAvailable = person.available !== undefined ? person.available : true;
    
    let action = 'validated';
    let newAvailable = previousAvailable;
    let processed = false;

    // Si el ticket está disponible, marcarlo como usado
    if (previousAvailable === true) {
      newAvailable = false;
      processed = true;
      
      // Actualizar el ticket en la base de datos
      await eventsModel.updateTicketAvailability(event._id, ticketId, false);
    } else {
      // Ticket ya fue usado
      action = 'already_used';
    }

    // Preparar datos para el log
    const logData = {
      ticketId: ticketId,
      eventId: event.eventId,
      eventTitle: event.title,
      personFirstName: person.firstName,
      personLastName: person.lastName,
      personCi: person.ci,
      checkedBy: {
        userId: checkinUser.userId,
        firstName: checkinUser.firstName,
        lastName: checkinUser.lastName,
        email: checkinUser.email
      },
      action: action,
      previousAvailable: previousAvailable,
      newAvailable: newAvailable,
      timestamp: new Date()
    };

    const personObj = typeof person?.toObject === "function" ? person.toObject() : { ...person };

    return {
      event: {
        _id: String(event._id), // _id del evento para agregar a eventsAttended
        eventId: event.eventId,
        title: event.title,
        date: event.date,
        hour: event.hour,
        location: event.location
      },
      person: {
        ...personObj,
        available: newAvailable
      },
      isValid: true,
      processed: processed,
      logData: logData
    };
  }

  async updateTicketAvailability(eventId, ticketId, available) {
    await eventsModel.updateTicketAvailability(eventId, ticketId, available);
  }
}

export const eventsService = new EventsService();
