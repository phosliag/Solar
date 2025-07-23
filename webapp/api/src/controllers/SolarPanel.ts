import express from 'express';
import {
  getSolarPanels,
  getSolarPanelsByOwner,
  getSolarPanelById,
  createSolarPanel,
  updateSolarPanelById,
  deleteSolarPanelById
} from '../db/SolarPanel';

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
    const panel = await createSolarPanel(req.body);
    res.status(201).json(panel);
  } catch (error) {
    res.status(400).json({ error: 'Error creando el panel solar' });
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