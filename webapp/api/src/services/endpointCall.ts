const env = {
  endpoint1: 'https://api.example.com/endpoint1',
  endpoint2: 'https://api.example.com/endpoint2',
};

const mockResponseData = {
  status: 200,
  data: {
    message: 'Mock response data',
    price: 99.99,
    amount:25
  },
};


// Mock de la primera llamada a un endpoint
const fetchDataFromFirstEndpoint = async (): Promise<typeof mockResponseData> => {
    // const response = await fetch('https://api.example.com/endpoint1');
    // const data = await response.json();
    console.log('Data from first endpoint:', mockResponseData);
    return mockResponseData;
};

// Mock de la segunda llamada a un endpoint
const fetchDataFromSecondEndpoint = async (): Promise<typeof mockResponseData> => {
    // const response = await fetch('https://api.example.com/endpoint2');
    // const data = await response.json();
    console.log('Data from second endpoint:', mockResponseData);
    return mockResponseData;
};

// Llamadas a los endpoints
const callEndpoints = async (): Promise<void> => {
    await fetchDataFromFirstEndpoint();
    await fetchDataFromSecondEndpoint();
};

// Ejecutar las llamadas
callEndpoints();