import { useState, useEffect } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Lock } from "lucide-react";
import { farmApi, zonesApi } from "@/lib/api-client";
import { useToast } from "@/hooks/use-toast";

interface PlantSelectionSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  zoneId: string;
  userId: string;
  slotIndex: number;
  onPlantSelected: () => void;
}

interface SeedItem {
  id: string;
  name: string;
  icon_emoji: string;
  production_time: number;
  unlock_tasks_required: number;
}

export default function PlantSelectionSheet({
  open,
  onOpenChange,
  zoneId,
  userId,
  slotIndex,
  onPlantSelected,
}: PlantSelectionSheetProps) {
  const [seeds, setSeeds] = useState<SeedItem[]>([]);
  const [tasksCompleted, setTasksCompleted] = useState(0);
  const { toast } = useToast();

  useEffect(() => {
    if (open) {
      loadSeeds();
      loadUserProgress();
    }
  }, [open, zoneId]);

  const loadSeeds = async () => {
    try {
      const zones = await zonesApi.getAllZones();
      const zone = zones.find(z => z.id === zoneId);
      if (zone && zone.farm_items) {
        const seeds = zone.farm_items.filter((item: any) => item.category === 'seed');
        setSeeds(seeds.sort((a: any, b: any) => 
          a.unlock_tasks_required - b.unlock_tasks_required
        ));
      }
    } catch (error) {
      console.error("Error loading seeds:", error);
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

  const handlePlantSeed = async (seedId: string) => {
    try {
      await farmApi.plantSeed({
        seedItemId: seedId,
        zoneId,
        slotIndex,
      });
      
      toast({
        title: "Успешно",
        description: "Растение посажено",
      });
      onPlantSelected();
      onOpenChange(false);
    } catch (error: any) {
      toast({
        title: "Ошибка",
        description: error.message || "Не удалось посадить растение",
        variant: "destructive",
      });
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-md overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Выберите растение</SheetTitle>
        </SheetHeader>
        <div className="mt-6 space-y-3">
          {seeds
            .filter((seed) => {
              const isUnlocked = tasksCompleted >= seed.unlock_tasks_required;
              // Show unlocked items and the next locked item
              if (isUnlocked) return true;
              // Find the next locked item (first one that's locked)
              const firstLocked = seeds.find(s => s.unlock_tasks_required > tasksCompleted);
              return seed.id === firstLocked?.id;
            })
            .map((seed) => {
              const isUnlocked = tasksCompleted >= seed.unlock_tasks_required;
              return (
                <Card
                  key={seed.id}
                  className={`p-4 ${!isUnlocked ? "opacity-60" : ""}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">{seed.icon_emoji}</span>
                      <div>
                        <p className="font-medium">{seed.name}</p>
                        <p className="text-sm text-muted-foreground">
                          Время роста: {Math.floor(seed.production_time / 60)} мин
                        </p>
                        {!isUnlocked && (
                          <p className="text-xs text-destructive">
                            Требуется {seed.unlock_tasks_required} заданий
                          </p>
                        )}
                      </div>
                    </div>
                    <Button
                      onClick={() => handlePlantSeed(seed.id)}
                      disabled={!isUnlocked}
                      size="sm"
                    >
                      {isUnlocked ? "Посадить" : <Lock className="h-4 w-4" />}
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
