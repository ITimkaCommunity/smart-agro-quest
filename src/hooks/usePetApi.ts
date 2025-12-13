import { useState, useEffect } from "react";
import { petApi } from "@/lib/api-client";
import { useToast } from "@/hooks/use-toast";

interface Pet {
  id: string;
  name: string;
  type: "cow" | "chicken" | "sheep";
  hunger: number;
  thirst: number;
  happiness: number;
  createdAt: string;
  lastFedAt: string;
  lastWateredAt: string;
  lastPlayedAt: string;
  ranAwayAt: string | null;
}

export const usePetApi = () => {
  const [pet, setPet] = useState<Pet | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadPet();
  }, []);

  const loadPet = async () => {
    try {
      setLoading(true);
      const data = await petApi.getUserPet();
      setPet(data as Pet | null);
    } catch (error: any) {
      console.error("Error loading pet:", error);
      if (!error.message.includes("not found")) {
        toast({
          title: "Ошибка",
          description: "Не удалось загрузить питомца",
          variant: "destructive",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const createPet = async (name: string, type: "cow" | "chicken" | "sheep") => {
    try {
      const data = await petApi.createPet({ name, type });
      setPet(data as Pet);
      toast({
        title: "Поздравляем!",
        description: `Вы завели питомца ${name}!`,
      });
    } catch (error: any) {
      toast({
        title: "Ошибка",
        description: error.message || "Не удалось создать питомца",
        variant: "destructive",
      });
    }
  };

  const feedPet = async () => {
    try {
      const data = await petApi.feedPet();
      setPet(data as Pet);
      toast({
        title: "Готово!",
        description: "Вы покормили питомца",
      });
    } catch (error: any) {
      toast({
        title: "Ошибка",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const waterPet = async () => {
    try {
      const data = await petApi.waterPet();
      setPet(data as Pet);
      toast({
        title: "Готово!",
        description: "Вы напоили питомца",
      });
    } catch (error: any) {
      toast({
        title: "Ошибка",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const playWithPet = async () => {
    try {
      const data = await petApi.playWithPet();
      setPet(data as Pet);
      toast({
        title: "Готово!",
        description: "Вы поиграли с питомцем",
      });
    } catch (error: any) {
      toast({
        title: "Ошибка",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return {
    pet,
    loading,
    createPet,
    feedPet,
    waterPet,
    playWithPet,
    refreshPet: loadPet,
  };
};
