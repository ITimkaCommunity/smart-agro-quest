import { useState, useEffect } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Lock } from "lucide-react";
import { farmApi, zonesApi } from "@/lib/api-client";
import { useToast } from "@/hooks/use-toast";

interface ProductionSelectionSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  zoneId: string;
  userId: string;
  slotIndex: number;
  onProductionSelected: () => void;
}

interface ProductionChain {
  id: string;
  name: string;
  base_time: number;
  unlock_tasks_required: number;
  output_item: {
    icon_emoji: string;
  };
  ingredients: Array<{
    item: {
      id: string;
      name: string;
      icon_emoji: string;
    };
    quantity_needed: number;
  }>;
}

export default function ProductionSelectionSheet({
  open,
  onOpenChange,
  zoneId,
  userId,
  slotIndex,
  onProductionSelected,
}: ProductionSelectionSheetProps) {
  const [chains, setChains] = useState<ProductionChain[]>([]);
  const [tasksCompleted, setTasksCompleted] = useState(0);
  const { toast } = useToast();

  useEffect(() => {
    if (open) {
      loadProductionChains();
      loadUserProgress();
    }
  }, [open, zoneId]);

  const loadProductionChains = async () => {
    try {
      const zones = await zonesApi.getAllZones();
      const zone = zones.find(z => z.id === zoneId);
      if (zone && zone.production_chains) {
        setChains(zone.production_chains.sort((a: any, b: any) => 
          a.unlock_tasks_required - b.unlock_tasks_required
        ));
      }
    } catch (error) {
      console.error("Error loading production chains:", error);
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

  const handleStartProduction = async (chainId: string, baseTime: number) => {
    const chain = chains.find((c) => c.id === chainId);
    if (!chain) return;

    // Check inventory for all ingredients
    let inventory: any[] = [];
    try {
      inventory = await farmApi.getInventory();
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось проверить инвентарь",
        variant: "destructive",
      });
      return;
    }

    // Check if user has all ingredients
    const missingIngredients = [];
    for (const ingredient of chain.ingredients) {
      const userItem = inventory.find((i: any) => i.item_id === ingredient.item.id);
      const available = userItem?.quantity || 0;
      if (available < ingredient.quantity_needed) {
        missingIngredients.push(
          `${ingredient.item.name} (есть: ${available}, нужно: ${ingredient.quantity_needed})`
        );
      }
    }

    if (missingIngredients.length > 0) {
      toast({
        title: "Недостаточно ресурсов",
        description: `Не хватает: ${missingIngredients.join(", ")}`,
        variant: "destructive",
      });
      return;
    }

    // Start production via API (backend will handle ingredient deduction)
    try {
      await farmApi.startProduction({
        chainId,
        zoneId,
        slotIndex,
      });

      toast({
        title: "Успешно",
        description: "Производство запущено",
      });
      onProductionSelected();
      onOpenChange(false);
    } catch (error: any) {
      toast({
        title: "Ошибка",
        description: error.message || "Не удалось запустить производство",
        variant: "destructive",
      });
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-md overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Выберите рецепт</SheetTitle>
        </SheetHeader>
        <div className="mt-6 space-y-3">
          {chains
            .filter((chain) => {
              const isUnlocked = tasksCompleted >= chain.unlock_tasks_required;
              // Show unlocked items and the next locked item
              if (isUnlocked) return true;
              // Find the next locked item (first one that's locked)
              const firstLocked = chains.find(c => c.unlock_tasks_required > tasksCompleted);
              return chain.id === firstLocked?.id;
            })
            .map((chain) => {
              const isUnlocked = tasksCompleted >= chain.unlock_tasks_required;
              return (
                <Card
                  key={chain.id}
                  className={`p-4 ${!isUnlocked ? "opacity-60" : ""}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-3xl">{chain.output_item.icon_emoji}</span>
                        <div>
                          <p className="font-medium">{chain.name}</p>
                          <p className="text-sm text-muted-foreground">
                            Время: {Math.floor(chain.base_time / 60)} мин
                          </p>
                        </div>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Требуется:{" "}
                        {chain.ingredients.map((ing, i) => (
                          <span key={i}>
                            {ing.quantity_needed}x {ing.item.icon_emoji} {ing.item.name}
                            {i < chain.ingredients.length - 1 && ", "}
                          </span>
                        ))}
                      </div>
                      {!isUnlocked && (
                        <p className="text-xs text-destructive mt-1">
                          Требуется {chain.unlock_tasks_required} заданий
                        </p>
                      )}
                    </div>
                    <Button
                      onClick={() => handleStartProduction(chain.id, chain.base_time)}
                      disabled={!isUnlocked}
                      size="sm"
                    >
                      {isUnlocked ? "Начать" : <Lock className="h-4 w-4" />}
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
