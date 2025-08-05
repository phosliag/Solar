import express from 'express';
import {
  getSolarPanels,
  getSolarPanelsByOwner,
  getSolarPanelById,
  createSolarPanel,
  updateSolarPanelById,
  deleteSolarPanelById
} from '../db/SolarPanel';
import { MongoServerError } from "mongodb";

// Obtener todos los paneles solares
export const getAllSolarPanels = async (req: express.Request, res: express.Response) => {
  try {
    const panels = await getSolarPanels();
    res.status(200).json(panels);
  } catch (error) {
    res.status(500).json({ error: 'Error obteniendo los paneles solares' });
  }
};

// Obtener paneles solares por owner (usuario)
export const getSolarPanelsByUser = async (req: express.Request, res: express.Response) => {
  try {
    const { userId } = req.params;
    const panels = await getSolarPanelsByOwner(userId);
    res.status(200).json(panels);
  } catch (error) {
    res.status(500).json({ error: 'Error obteniendo los paneles solares del usuario' });
  }
};

// Crear un nuevo panel solar
export const createSolarPanelController = async (req: express.Request, res: express.Response) => {
  try {
    const data = req.body;
    const { name, location, reference, price, state, owner, stimatedProduction, paymentFreq, installationYear } = req.body;

    // Validación de campos requeridos según el modelo SolarPanel
    if (!name || !location || !reference || price == null || !state || stimatedProduction == null || !paymentFreq || installationYear == null) {
      res.status(400).json({
        error: "Missing required fields",
        message: "All required solar panel fields must be provided.",
      });
      return;
    }

    // Crear documento SolarPanel
    let panel;

    panel = await createSolarPanel(data).catch((error: MongoServerError) => {
      if (error.code === 11000) {
        res.status(400).json({
          error: "Duplicate reference",
          message: "A solar panel with this reference already exists.",
        });
        return;
      }
    });

    res.status(201).json({panel});
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Solar panel creation failed",
      message: "An unexpected error occurred while creating the solar panel.",
    });
  }

};

// Actualizar un panel solar
export const updateSolarPanelController = async (req: express.Request, res: express.Response) => {
  try {
    const { id } = req.params;
    const updated = await updateSolarPanelById(id, req.body);
    if (!updated) {
      res.status(404).json({ error: 'Panel solar no encontrado' });
      return;
    }
    res.status(200).json(updated);
  } catch (error) {
    res.status(400).json({ error: 'Error actualizando el panel solar' });
  }
};

// Eliminar un panel solar
export const deleteSolarPanelController = async (req: express.Request, res: express.Response) => {
  try {
    const { id } = req.params;
    const deleted = await deleteSolarPanelById(id);
    if (!deleted) {
      res.status(404).json({ error: 'Panel solar no encontrado' });
      return;
    }
    res.status(200).json({ message: 'Panel solar eliminado' });
  } catch (error) {
    res.status(400).json({ error: 'Error eliminando el panel solar' });
  }
}; 