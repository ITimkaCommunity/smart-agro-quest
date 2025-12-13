import { useState, useEffect } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Lock } from "lucide-react";
import { farmApi, zonesApi } from "@/lib/api-client";
import { useToast } from "@/hooks/use-toast";

interface AnimalSelectionSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  zoneId: string;
  userId: string;
  onAnimalSelected: () => void;
}

interface Animal {
  id: string;
  name: string;
  icon_emoji: string;
  production_time: number;
  unlock_tasks_required: number;
}

export default function AnimalSelectionSheet({
  open,
  onOpenChange,
  zoneId,
  userId,
  onAnimalSelected,
}: AnimalSelectionSheetProps) {
  const [animals, setAnimals] = useState<Animal[]>([]);
  const [tasksCompleted, setTasksCompleted] = useState(0);
  const { toast } = useToast();

  useEffect(() => {
    if (open) {
      loadAnimals();
      loadUserProgress();
    }
  }, [open, zoneId]);

  const loadAnimals = async () => {
    try {
      const zones = await zonesApi.getAllZones();
      const zone = zones.find(z => z.id === zoneId);
      if (zone && zone.farm_animals) {
        setAnimals(zone.farm_animals.sort((a: any, b: any) => 
          a.unlock_tasks_required - b.unlock_tasks_required
        ));
      }
    } catch (error) {
      console.error("Error loading animals:", error);
    }
  };

  const loadUserProgress = async () => {
    try {
      const progressData = await zonesApi.getUserProgress();
      const zoneProgress = progressData.find((p: any) => p.zone_id === zoneId);
      if (zoneProgress) {
        setTasksCompleted(zoneProgress.tasks_completed || 0);
      }
    } catch (error) {
      console.error("Error loading progress:", error);
    }
  };

  const handleAddAnimal = async (animalId: string) => {
    try {
      await farmApi.addAnimal(animalId);
      
      toast({
        title: "Успешно",
        description: "Животное добавлено на ферму",
      });
      onAnimalSelected();
      onOpenChange(false);
    } catch (error: any) {
      toast({
        title: "Ошибка",
        description: error.message || "Не удалось добавить животное",
        variant: "destructive",
      });
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-md overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Выберите животное</SheetTitle>
        </SheetHeader>
        <div className="mt-6 space-y-3">
          {animals
            .filter((animal) => {
              const isUnlocked = tasksCompleted >= animal.unlock_tasks_required;
              // Show unlocked items and the next locked item
              if (isUnlocked) return true;
              // Find the next locked item (first one that's locked)
              const firstLocked = animals.find(a => a.unlock_tasks_required > tasksCompleted);
              return animal.id === firstLocked?.id;
            })
            .map((animal) => {
              const isUnlocked = tasksCompleted >= animal.unlock_tasks_required;
              return (
                <Card
                  key={animal.id}
                  className={`p-4 ${!isUnlocked ? "opacity-60" : ""}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">{animal.icon_emoji}</span>
                      <div>
                        <p className="font-medium">{animal.name}</p>
                        <p className="text-sm text-muted-foreground">
                          Производство: {Math.floor(animal.production_time / 60)} мин
                        </p>
                        {!isUnlocked && (
                          <p className="text-xs text-destructive">
                            Требуется {animal.unlock_tasks_required} заданий
                          </p>
                        )}
                      </div>
                    </div>
                    <Button
                      onClick={() => handleAddAnimal(animal.id)}
                      disabled={!isUnlocked}
                      size="sm"
                    >
                      {isUnlocked ? "Добавить" : <Lock className="h-4 w-4" />}
                    </Button>
                  </div>
                </Card>
              );
            })}
        </div>
      </SheetContent>
    </Sheet>
  );
}
