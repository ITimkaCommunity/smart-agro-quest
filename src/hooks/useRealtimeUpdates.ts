import { useEffect, useRef, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { useToast } from '@/hooks/use-toast';

interface RealtimeConfig {
  userId: string | null;
  onPlantUpdate?: (plant: any) => void;
  onPlantHarvested?: (data: { plantId: string; item: any }) => void;
  onAnimalUpdate?: (animal: any) => void;
  onAnimalCollected?: (data: { animalId: string; item: any }) => void;
  onProductionStarted?: (production: any) => void;
  onProductionCompleted?: (data: { productionId: string; item: any }) => void;
  onInventoryUpdate?: (inventory: any) => void;
  onPetCreated?: (pet: any) => void;
  onPetStatsUpdate?: (pet: any) => void;
  onPetFed?: (pet: any) => void;
  onPetWatered?: (pet: any) => void;
  onPetPlayed?: (pet: any) => void;
  onPetItemUsed?: (data: { pet: any; item: any }) => void;
  onPetRanAway?: (data: { petId: string }) => void;
  enableToasts?: boolean;
}

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';
const MAX_RECONNECT_ATTEMPTS = 5;
const BASE_RECONNECT_DELAY = 1000; // 1 second

export function useRealtimeUpdates(config: RealtimeConfig) {
  const { toast } = useToast();
  const farmSocketRef = useRef<Socket | null>(null);
  const petSocketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [reconnectAttempts, setReconnectAttempts] = useState(0);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const showToast = config.enableToasts !== false;

  const calculateReconnectDelay = useCallback((attempt: number) => {
    // Exponential backoff: 1s, 2s, 4s, 8s, 16s
    return Math.min(BASE_RECONNECT_DELAY * Math.pow(2, attempt), 30000);
  }, []);

  const attemptReconnect = useCallback(() => {
    if (reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) {
      setConnectionError('Не удалось подключиться к серверу');
      if (showToast) {
        toast({
          title: '❌ Ошибка подключения',
          description: 'Не удалось установить WebSocket соединение. Проверьте подключение к интернету.',
          variant: 'destructive',
        });
      }
      return;
    }

    const delay = calculateReconnectDelay(reconnectAttempts);
    console.log(`[WebSocket] Попытка переподключения через ${delay}ms (попытка ${reconnectAttempts + 1}/${MAX_RECONNECT_ATTEMPTS})`);

    reconnectTimeoutRef.current = setTimeout(() => {
      setReconnectAttempts(prev => prev + 1);
      // The useEffect will handle reconnection when reconnectAttempts changes
    }, delay);
  }, [reconnectAttempts, calculateReconnectDelay, showToast, toast]);

  useEffect(() => {
    if (!config.userId) return;

    // Development logging
    const isDev = import.meta.env.DEV;
    const log = (namespace: string, event: string, data?: any) => {
      if (isDev) {
        console.log(`[WebSocket:${namespace}] ${event}`, data);
      }
    };

    // Get JWT token from localStorage
    const token = localStorage.getItem('auth_token');

    // Farm Socket
    const farmSocket = io(`${BACKEND_URL}/farm`, {
      transports: ['websocket'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
      auth: {
        token: token,
      },
    });

    farmSocketRef.current = farmSocket;

    farmSocket.on('connect', () => {
      log('farm', 'Connected', { socketId: farmSocket.id });
      farmSocket.emit('joinUserRoom', config.userId);
      setIsConnected(true);
      setConnectionError(null);
      setReconnectAttempts(0); // Reset on successful connection
      
      if (reconnectAttempts > 0 && showToast) {
        toast({
          title: '✅ Подключено',
          description: 'WebSocket соединение восстановлено',
        });
      }
    });

    farmSocket.on('disconnect', (reason) => {
      log('farm', 'Disconnected', { reason });
      setIsConnected(false);
      
      // Only attempt reconnect for certain disconnect reasons
      if (reason === 'io server disconnect' || reason === 'transport close') {
        attemptReconnect();
      }
    });

    farmSocket.on('connect_error', (error) => {
      log('farm', 'Connection Error', error);
      setConnectionError(error.message);
      attemptReconnect();
    });

    // Plant events
    farmSocket.on('plant:updated', (plant) => {
      log('farm', 'plant:updated', plant);
      config.onPlantUpdate?.(plant);
    });

    farmSocket.on('plant:harvested', (data) => {
      log('farm', 'plant:harvested', data);
      config.onPlantHarvested?.(data);
      if (showToast) {
        toast({
          title: '🌾 Урожай собран!',
          description: `Вы собрали ${data.item?.name || 'урожай'}`,
        });
      }
    });

    // Animal events
    farmSocket.on('animal:updated', (animal) => {
      log('farm', 'animal:updated', animal);
      config.onAnimalUpdate?.(animal);
    });

    farmSocket.on('animal:collected', (data) => {
      log('farm', 'animal:collected', data);
      config.onAnimalCollected?.(data);
      if (showToast) {
        toast({
          title: '🥚 Продукт собран!',
          description: `Вы собрали ${data.item?.name || 'продукт'}`,
        });
      }
    });

    // Production events
    farmSocket.on('production:started', (production) => {
      log('farm', 'production:started', production);
      config.onProductionStarted?.(production);
      if (showToast) {
        toast({
          title: '⚙️ Производство начато',
          description: `Производство ${production.chainName || ''} началось`,
        });
      }
    });

    farmSocket.on('production:completed', (data) => {
      log('farm', 'production:completed', data);
      config.onProductionCompleted?.(data);
      if (showToast) {
        toast({
          title: '✅ Производство завершено!',
          description: `Готово: ${data.item?.name || 'продукт'}`,
        });
      }
    });

    // Inventory events
    farmSocket.on('inventory:updated', (inventory) => {
      log('farm', 'inventory:updated', inventory);
      config.onInventoryUpdate?.(inventory);
    });

    // Pet Socket
    const petSocket = io(`${BACKEND_URL}/pet`, {
      transports: ['websocket'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
      auth: {
        token: token,
      },
    });

    petSocketRef.current = petSocket;

    petSocket.on('connect', () => {
      log('pet', 'Connected', { socketId: petSocket.id });
      petSocket.emit('joinUserRoom', config.userId);
    });

    petSocket.on('disconnect', () => {
      log('pet', 'Disconnected');
    });

    petSocket.on('connect_error', (error) => {
      log('pet', 'Connection Error', error);
    });

    // Pet events
    petSocket.on('pet:created', (pet) => {
      log('pet', 'pet:created', pet);
      config.onPetCreated?.(pet);
      if (showToast) {
        toast({
          title: '🐾 Питомец создан!',
          description: `Добро пожаловать, ${pet.name || 'питомец'}!`,
        });
      }
    });

    petSocket.on('pet:statsUpdated', (pet) => {
      log('pet', 'pet:statsUpdated', pet);
      config.onPetStatsUpdate?.(pet);
    });

    petSocket.on('pet:fed', (pet) => {
      log('pet', 'pet:fed', pet);
      config.onPetFed?.(pet);
      if (showToast) {
        toast({
          title: '🍖 Питомец накормлен',
          description: `${pet.name || 'Питомец'} доволен!`,
        });
      }
    });

    petSocket.on('pet:watered', (pet) => {
      log('pet', 'pet:watered', pet);
      config.onPetWatered?.(pet);
      if (showToast) {
        toast({
          title: '💧 Питомец напоен',
          description: `${pet.name || 'Питомец'} больше не хочет пить`,
        });
      }
    });

    petSocket.on('pet:played', (pet) => {
      log('pet', 'pet:played', pet);
      config.onPetPlayed?.(pet);
      if (showToast) {
        toast({
          title: '🎮 Время игры!',
          description: `${pet.name || 'Питомец'} счастлив`,
        });
      }
    });

    petSocket.on('pet:itemUsed', (data) => {
      log('pet', 'pet:itemUsed', data);
      config.onPetItemUsed?.(data);
      if (showToast) {
        toast({
          title: '✨ Предмет использован',
          description: `${data.item?.name || 'Предмет'} применён на ${data.pet?.name || 'питомца'}`,
        });
      }
    });

    petSocket.on('pet:ranAway', (data) => {
      log('pet', 'pet:ranAway', data);
      config.onPetRanAway?.(data);
      if (showToast) {
        toast({
          title: '😢 Питомец убежал',
          description: 'Ваш питомец покинул вас из-за плохого ухода',
          variant: 'destructive',
        });
      }
    });

    return () => {
      log('farm', 'Cleaning up connections');
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      farmSocket.disconnect();
      petSocket.disconnect();
      farmSocketRef.current = null;
      petSocketRef.current = null;
    };
  }, [config.userId, showToast, reconnectAttempts, attemptReconnect]);

  return {
    isConnected,
    connectionError,
    farmSocket: farmSocketRef.current,
    petSocket: petSocketRef.current,
  };
}
