import { useState, useEffect } from "react";
import { farmApi } from "@/lib/api-client";
import { useToast } from "@/hooks/use-toast";

export interface PlantData {
  id: string;
  slotIndex: number;
  seedName: string;
  seedEmoji: string;
  plantedAt: string;
  growthTime: number;
  outputEmoji: string;
  needsWater: boolean;
  seedItemId: string;
}

export interface AnimalData {
  id: string;
  slotIndex: number;
  name: string;
  emoji: string;
  lastFedAt: string;
  lastCollectedAt: string;
  happiness: number;
  productionTime: number;
  productionEmoji: string;
  animalId: string;
}

export interface ProductionData {
  id: string;
  slotIndex: number;
  chainName: string;
  outputEmoji: string;
  finishAt: string;
  startedAt: string;
  chainId: string;
}

export const useFarmData = (zoneId: string | null, userId: string | null) => {
  const [plants, setPlants] = useState<PlantData[]>([]);
  const [animals, setAnimals] = useState<AnimalData[]>([]);
  const [productions, setProductions] = useState<ProductionData[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (!zoneId || !userId) {
      setLoading(false);
      return;
    }

    loadData();
  }, [zoneId, userId]);

  const loadData = async () => {
    if (!zoneId || !userId) return;

    try {
      setLoading(true);

      // Load data from backend API
      const [plantsData, animalsData, productionsData] = await Promise.all([
        farmApi.getUserPlants(zoneId).catch(() => []),
        farmApi.getUserAnimals().catch(() => []),
        farmApi.getUserProductions(zoneId).catch(() => [])
      ]);

      setPlants(plantsData || []);
      setAnimals(animalsData || []);
      setProductions(productionsData || []);
    } catch (error) {
      console.error("Error loading farm data:", error);
      toast({
        title: "Ошибка",
        description: "Не удалось загрузить данные фермы",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const harvestPlant = async (plantId: string) => {
    try {
      await farmApi.harvestPlant(plantId);
      toast({
        title: "Успешно",
        description: "Урожай собран!",
      });
      await loadData();
    } catch (error: any) {
      toast({
        title: "Ошибка",
        description: error.message || "Не удалось собрать урожай",
        variant: "destructive",
      });
    }
  };

  const collectProduction = async (productionId: string) => {
    try {
      await farmApi.collectProduction(productionId);
      toast({
        title: "Успешно",
        description: "Продукция собрана!",
      });
      await loadData();
    } catch (error: any) {
      toast({
        title: "Ошибка",
        description: error.message || "Не удалось собрать продукцию",
        variant: "destructive",
      });
    }
  };

  const collectFromAnimal = async (userAnimalId: string) => {
    try {
      await farmApi.collectFromAnimal(userAnimalId);
      toast({
        title: "Успешно",
        description: "Продукция собрана от животного!",
      });
      await loadData();
    } catch (error: any) {
      toast({
        title: "Ошибка",
        description: error.message || "Не удалось собрать продукцию",
        variant: "destructive",
      });
    }
  };

  const refreshData = () => {
    loadData();
  };

  return {
    plants,
    animals,
    productions,
    loading,
    harvestPlant,
    collectProduction,
    collectFromAnimal,
    refreshData,
  };
};