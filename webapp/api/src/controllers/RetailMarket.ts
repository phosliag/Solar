import express from 'express';
import { getRetailMarkets, getRetailMarketById, createRetailMarket, updateRetailMarketById, deleteRetailMarketById } from '../db/RetailMarket';
import { MongoServerError } from 'mongodb';
import { SolarPanel } from '../db/SolarPanel';

// Obtener todos los paneles solares del mercado
export const getAllRetailMarketItems = async (req: express.Request, res: express.Response) => {
  try {
    const items = await getRetailMarkets().lean();
    // For each retail market item, find the full SolarPanel by reference
    const panels = await Promise.all(
      items.map(async (item: any) => {
        const panel = await SolarPanel.findOne({ reference: item.reference }).lean();
        return panel;
      })
    );
    res.status(200).json(panels.filter(Boolean));
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: 'Internal server error', message: 'Internal server error' });
  }
};

// Obtener panel solar por ID
export const getRetailMarketItem = async (req: express.Request, res: express.Response) => {
  try {
    const { id } = req.params;
    const item = await getRetailMarketById(id);
    if (!item) {
      res.status(404).json({ error: 'Not found', message: 'Panel not found' });
      return;
    }
    res.status(200).json(item);
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: 'Internal server error', message: 'Internal server error' });
  }
};

// Crear un nuevo panel solar en el mercado
export const addRetailMarketItem = async (req: express.Request, res: express.Response) => {
  try {
    const { reference, location, owner } = req.body;
    if (!reference || !location) {
      res.status(400).json({
        error: 'Missing fields',
        message: 'reference and location are required.'
      });
      return;
    }
    const item = await createRetailMarket({ reference, location, owner }).catch((error: MongoServerError) => {
      if (error.code === 11000) {
        res.status(400).json({
          error: 'Duplicate detected',
          message: 'Duplicate reference detected.'
        });
        return;
      }
    });
    res.status(201).json(item);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: 'Panel creation failed',
      message: 'An unexpected error occurred while creating the panel.',
    });
  }
};

// Actualizar un panel solar
export const updateRetailMarketItem = async (req: express.Request, res: express.Response) => {
  const { id } = req.params;
  try {
    const { reference, location, owner } = req.body;
    if (!reference || !location) {
      res.status(400).json({
        error: 'Missing fields',
        message: 'reference and location are required.'
      });
      return;
    }
    const updatedItem = await updateRetailMarketById(id, { reference, location, owner });
    if (!updatedItem) {
      res.status(404).json({ message: 'Panel not found.' });
      return;
    }
    res.status(200).json({ updatedItem });
  } catch (error) {
    res.status(400).json({
      message: error.message,
      error: error.message,
    });
  }
};

// Eliminar un panel solar
export const deleteRetailMarketItem = async (req: express.Request, res: express.Response) => {
  const { id } = req.params;
  try {
    const deleted = await deleteRetailMarketById(id);
    if (!deleted) {
      res.status(404).json({ message: 'Panel not found.' });
      return;
    }
    res.status(200).json({ message: 'Panel deleted successfully.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: 'Deletion failed',
      message: 'An unexpected error occurred while deleting the panel.',
    });
  }
};
