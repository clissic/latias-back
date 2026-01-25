import { boatsModel } from "../DAO/models/boats.model.js";

class BoatsService {
  async getAll() {
    const boats = await boatsModel.getAll();
    return boats;
  }

  async getActive() {
    const boats = await boatsModel.getActive();
    return boats;
  }

  async findById(id) {
    const boat = await boatsModel.findById(id);
    return boat;
  }

  async findByRegistrationNumber(registrationNumber) {
    const boat = await boatsModel.findByRegistrationNumber(registrationNumber);
    return boat;
  }

  async findByOwner(ownerId) {
    const boats = await boatsModel.findByOwner(ownerId);
    return boats;
  }

  async create(boatData) {
    // Validar que el registrationNumber sea único
    const existingBoat = await boatsModel.findByRegistrationNumber(boatData.registrationNumber);
    if (existingBoat) {
      throw new Error("Ya existe un barco con ese número de registro");
    }

    // Validar que el owner existe (se validará con el populate)
    if (!boatData.owner) {
      throw new Error("El propietario es requerido");
    }

    // Validar campos requeridos
    if (!boatData.name || !boatData.registrationNumber || !boatData.registrationCountry || 
        !boatData.registrationPort || !boatData.boatType || !boatData.lengthOverall || !boatData.beam) {
      throw new Error("Todos los campos requeridos deben estar presentes");
    }

    // Validar que boatType esté en el enum
    const validBoatTypes = ['Yate monocasco', 'Yate catamarán', 'Lancha', 'Velero monocasco', 
                            'Velero catamarán', 'Moto náutica', 'Jet sky', 'Kayak', 'Canoa', 
                            'Bote', 'Semirígido', 'Neumático'];
    if (!validBoatTypes.includes(boatData.boatType)) {
      throw new Error("Tipo de barco inválido");
    }

    // Validar valores numéricos
    if (boatData.lengthOverall < 0 || boatData.beam < 0) {
      throw new Error("Las dimensiones no pueden ser negativas");
    }

    if (boatData.depth !== undefined && boatData.depth < 0) {
      throw new Error("El calado no puede ser negativo");
    }

    if (boatData.displacement !== undefined && boatData.displacement < 0) {
      throw new Error("El desplazamiento no puede ser negativo");
    }

    const boatCreated = await boatsModel.create(boatData);
    return boatCreated;
  }

  async requestRegistration(boatData) {
    // Validar que el registrationNumber sea único
    const existingBoat = await boatsModel.findByRegistrationNumber(boatData.registrationNumber);
    if (existingBoat) {
      throw new Error("Ya existe un barco con ese número de registro");
    }

    // Validar que el owner existe
    if (!boatData.owner) {
      throw new Error("El propietario es requerido");
    }

    // Validar campos requeridos
    if (!boatData.name || !boatData.registrationNumber || !boatData.registrationCountry || 
        !boatData.registrationPort || !boatData.boatType || !boatData.lengthOverall || !boatData.beam) {
      throw new Error("Todos los campos requeridos deben estar presentes");
    }

    // Validar que boatType esté en el enum
    const validBoatTypes = ['Yate monocasco', 'Yate catamarán', 'Lancha', 'Velero monocasco', 
                            'Velero catamarán', 'Moto náutica', 'Jet sky', 'Kayak', 'Canoa', 
                            'Bote', 'Semirígido', 'Neumático', 'Otro'];
    if (!validBoatTypes.includes(boatData.boatType)) {
      throw new Error("Tipo de barco inválido");
    }

    // Validar valores numéricos
    if (boatData.lengthOverall < 0 || boatData.beam < 0) {
      throw new Error("Las dimensiones no pueden ser negativas");
    }

    if (boatData.depth !== undefined && boatData.depth < 0) {
      throw new Error("El calado no puede ser negativo");
    }

    if (boatData.displacement !== undefined && boatData.displacement < 0) {
      throw new Error("El desplazamiento no puede ser negativo");
    }

    // Crear barco con isActive: false
    const boatDataWithStatus = {
      ...boatData,
      isActive: false
    };

    const boatCreated = await boatsModel.create(boatDataWithStatus);
    return boatCreated;
  }

  async updateOne(boatData) {
    const { _id, ...updateData } = boatData;

    if (!_id) {
      throw new Error("ID del barco es requerido");
    }

    // Si se está actualizando el registrationNumber, verificar que no esté duplicado
    if (updateData.registrationNumber) {
      const existingBoat = await boatsModel.findByRegistrationNumber(updateData.registrationNumber);
      if (existingBoat && String(existingBoat._id) !== String(_id)) {
        throw new Error("Ya existe otro barco con ese número de registro");
      }
    }

    // Validar boatType si se está actualizando
    if (updateData.boatType) {
      const validBoatTypes = ['Yate monocasco', 'Yate catamarán', 'Lancha', 'Velero monocasco', 
                              'Velero catamarán', 'Moto náutica', 'Jet sky', 'Kayak', 'Canoa', 
                              'Bote', 'Semirígido', 'Neumático'];
      if (!validBoatTypes.includes(updateData.boatType)) {
        throw new Error("Tipo de barco inválido");
      }
    }

    // Validar valores numéricos si se están actualizando
    if (updateData.lengthOverall !== undefined && updateData.lengthOverall < 0) {
      throw new Error("La eslora no puede ser negativa");
    }

    if (updateData.beam !== undefined && updateData.beam < 0) {
      throw new Error("La manga no puede ser negativa");
    }

    if (updateData.depth !== undefined && updateData.depth < 0) {
      throw new Error("El calado no puede ser negativo");
    }

    if (updateData.displacement !== undefined && updateData.displacement < 0) {
      throw new Error("El desplazamiento no puede ser negativo");
    }

    const boatUpdated = await boatsModel.updateOne({ _id, ...updateData });
    return boatUpdated;
  }

  async deleteOne(_id) {
    const result = await boatsModel.deleteOne(_id);
    return result;
  }

  async toggleActive(_id) {
    const boat = await boatsModel.toggleActive(_id);
    return boat;
  }
}

export const boatsService = new BoatsService();
