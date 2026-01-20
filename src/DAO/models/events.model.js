import { EventsMongoose } from "./mongoose/events.mongoose.js";

class EventsModel {
  async getAll() {
    const events = await EventsMongoose.find(
      {},
      {
        _id: true,
        eventId: true,
        title: true,
        date: true,
        active: true,
        hour: true,
        price: true,
        currency: true,
        description: true,
        image: true,
        tickets: true,
        location: true,
        speaker: true,
        peopleRegistered: true,
        createdAt: true,
        updatedAt: true,
      }
    ).sort({ date: 1 }); // Ordenar por fecha ascendente
    return events;
  }

  async getActive() {
    const events = await EventsMongoose.find(
      { active: true, date: { $gte: new Date() } }, // Solo eventos activos y con fecha futura
      {
        _id: true,
        eventId: true,
        title: true,
        date: true,
        active: true,
        hour: true,
        price: true,
        currency: true,
        description: true,
        image: true,
        tickets: true,
        location: true,
        speaker: true,
        peopleRegistered: true,
        createdAt: true,
        updatedAt: true,
      }
    ).sort({ date: 1 });
    return events;
  }

  async findById(id) {
    const eventFound = await EventsMongoose.findById(id);
    return eventFound;
  }

  async findByEventId(eventId) {
    const event = await EventsMongoose.findOne({ eventId: eventId });
    return event;
  }

  async create(eventData) {
    const eventCreated = await EventsMongoose.create(eventData);
    return eventCreated;
  }

  async updateOne({ _id, ...updateData }) {
    const eventUpdated = await EventsMongoose.updateOne(
      { _id: _id },
      { $set: updateData }
    );
    // Retornar el evento actualizado
    const updatedEvent = await EventsMongoose.findById(_id);
    return updatedEvent;
  }

  async deleteOne(_id) {
    const result = await EventsMongoose.deleteOne({ _id: _id });
    return result;
  }

  async updateTickets({ _id, quantity }) {
    const event = await EventsMongoose.findById(_id);
    if (!event) {
      throw new Error("Evento no encontrado");
    }

    // Validar que hay suficientes tickets disponibles
    if (event.tickets.remainingTickets < quantity) {
      throw new Error("No hay suficientes tickets disponibles");
    }

    const updatedEvent = await EventsMongoose.updateOne(
      { _id: _id },
      {
        $inc: {
          "tickets.soldTickets": quantity,
          "tickets.remainingTickets": -quantity
        }
      }
    );
    return updatedEvent;
  }

  async registerPerson({ _id, personData, quantity }) {
    const event = await EventsMongoose.findById(_id);
    if (!event) {
      throw new Error("Evento no encontrado");
    }

    // Validar que hay suficientes tickets disponibles
    if (event.tickets.remainingTickets < quantity) {
      throw new Error("No hay suficientes tickets disponibles");
    }

    // Agregar persona al array y actualizar tickets en una sola operación
    const updatedEvent = await EventsMongoose.updateOne(
      { _id: _id },
      {
        $push: { peopleRegistered: personData },
        $inc: {
          "tickets.soldTickets": quantity,
          "tickets.remainingTickets": -quantity
        }
      }
    );
    return updatedEvent;
  }

  async findByTicketId(ticketId) {
    const event = await EventsMongoose.findOne({
      "peopleRegistered.ticketId": ticketId
    });
    return event;
  }

  async deactivateExpiredEvents() {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Inicio del día

    const result = await EventsMongoose.updateMany(
      {
        active: true,
        date: { $lt: today } // Fechas anteriores a hoy
      },
      {
        $set: { active: false }
      }
    );
    return result;
  }

  async getExpiredEvents() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const events = await EventsMongoose.find({
      active: true,
      date: { $lt: today }
    });
    return events;
  }
}

export const eventsModel = new EventsModel();
