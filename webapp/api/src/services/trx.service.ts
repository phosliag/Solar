import { createTrxError } from "../db/trxError"; 
import { createTrxSuccessful } from "../db/trxSuccessful";

export const handleTransactionError = async (
    userId: string,
    network: string,
    trxType: string,
    errorData: any
  ) => {
    try {
      // Convertir los datos de error a string si no lo son ya
      const errorString = typeof errorData === 'string' 
        ? errorData 
        : errorData instanceof Error 
          ? errorData.message 
          : JSON.stringify(errorData);
      
      // Crear el registro de error
      await createTrxError({
        userId,
        network,
        trx_type: trxType,
        data: errorString,
        timestamp: new Date()
      });

      // Log de error para debugging
      console.error(`Error de transacción registrado - Tipo: ${trxType}, Usuario: ${userId}, Red: ${network}, Detalles del error: ${errorString}`);
      
      return false;
    } catch (error) {
      console.error('Error al crear registro de error de transacción:', error);
      return false;
    }
  };

  export const handleTransactionSuccess = async (
    userId: string,
    network: string,
    trxType: string,
    data: any
  ) => {
    try {
      // Obtener el hash de la transacción
      const trxHash = data.trx || data.hash || data.transactionHash || data.message;
      if (!trxHash) {
        throw new Error('No se encontró el hash de la transacción');
      }

      // Crear el registro de transacción exitosa
      await createTrxSuccessful({
        userId,
        network,
        trx_type: trxType,
        trx: trxHash,
        timestamp: new Date()
      });

      // Log de éxito para debugging
      console.log(`Transacción exitosa registrada - Tipo: ${trxType}, Usuario: ${userId}, Red: ${network}, Hash de transacción: ${trxHash}`);
      
      return true;
    } catch (error) {
      console.error('Error al crear registro de transacción exitosa:', error);
      return false;
    }
  };