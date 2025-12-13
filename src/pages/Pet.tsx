import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import Header from "@/components/layout/Header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { PetSkeleton } from "@/components/ui/loading-skeleton";
import { Apple, Droplet, Smile, AlertTriangle } from "lucide-react";
import { useRealtimeUpdates } from "@/hooks/useRealtimeUpdates";
import { useNotificationSettings } from "@/hooks/useNotificationSettings";
import { usePetApi } from "@/hooks/usePetApi";

const Pet = () => {
  const { user } = useAuth();
  const [petName, setPetName] = useState("");
  const [selectedType, setSelectedType] = useState<"cow" | "chicken" | "sheep" | null>(null);

  const { pet, loading, createPet: createPetApi, feedPet, waterPet, playWithPet, refreshPet } = usePetApi();
  const { shouldShowToast } = useNotificationSettings();

  // WebSocket real-time updates
  const { isConnected, connectionError } = useRealtimeUpdates({
    userId: user?.id || null,
    enableToasts: shouldShowToast('pet'),
    onPetCreated: refreshPet,
    onPetStatsUpdate: refreshPet,
    onPetFed: refreshPet,
    onPetWatered: refreshPet,
    onPetPlayed: refreshPet,
    onPetRanAway: refreshPet,
  });

  const petTypes = [
    { type: "cow" as const, emoji: "🐄", name: "Корова" },
    { type: "chicken" as const, emoji: "🐔", name: "Курица" },
    { type: "sheep" as const, emoji: "🐑", name: "Овца" },
  ];


  const handleCreatePet = async () => {
    if (!petName.trim() || !selectedType) return;
    await createPetApi(petName.trim(), selectedType);
    setPetName("");
    setSelectedType(null);
  };

  const getHealthStatus = () => {
    if (!pet || pet.ranAwayAt) return { text: "Сбежал", color: "bg-gray-500" };
    const avgStat = (pet.hunger + pet.thirst + pet.happiness) / 3;
    if (avgStat >= 70) return { text: "Отлично", color: "bg-green-500" };
    if (avgStat >= 40) return { text: "Нормально", color: "bg-yellow-500" };
    return { text: "Плохо", color: "bg-red-500" };
  };

  const getDaysSinceCreation = () => {
    if (!pet) return 0;
    const now = new Date();
    const created = new Date(pet.createdAt);
    return Math.floor((now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header isWebSocketConnected={isConnected} connectionError={connectionError} />
        <main className="container py-8">
          <PetSkeleton />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header isWebSocketConnected={isConnected} connectionError={connectionError} />
      
      <main className="container py-8">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">
                Мой <span className="gradient-text">Тамагочи</span>
              </h1>
              <p className="text-muted-foreground">
                Заботься о своём питомце каждый день
              </p>
            </div>
          </div>

          {!pet || pet.ranAwayAt ? (
            <Card>
              <CardHeader>
                <CardTitle>
                  {pet?.ranAwayAt ? "Питомец сбежал 😢" : "Выбери своего питомца"}
                </CardTitle>
                <CardDescription>
                  {pet?.ranAwayAt
                    ? "Вы не заботились о питомце более 2 недель, и он сбежал. Заведите нового!"
                    : "Выбери одного из трёх животных и дай ему имя"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="petName">Имя питомца</Label>
                    <Input
                      id="petName"
                      placeholder="Введите имя..."
                      value={petName}
                      onChange={(e) => setPetName(e.target.value)}
                      maxLength={20}
                    />
                  </div>
                  
                  <div>
                    <Label>Выберите тип</Label>
                    <div className="grid grid-cols-3 gap-4 mt-2">
                      {petTypes.map((petType) => (
                        <Card 
                          key={petType.type}
                          className={`cursor-pointer hover:bg-accent transition-colors text-center p-6 ${
                            selectedType === petType.type ? 'ring-2 ring-primary' : ''
                          }`}
                          onClick={() => setSelectedType(petType.type)}
                        >
                          <span className="text-4xl block mb-2">{petType.emoji}</span>
                          <p className="text-sm font-medium">{petType.name}</p>
                        </Card>
                      ))}
                    </div>
                  </div>

                  <Button onClick={handleCreatePet} className="w-full" disabled={!petName.trim() || !selectedType}>
                    Создать питомца
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <>
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        {pet.name}
                        <span className="text-4xl">
                          {petTypes.find((p) => p.type === pet.type)?.emoji}
                        </span>
                      </CardTitle>
                      <CardDescription>
                        {petTypes.find((p) => p.type === pet.type)?.name} • Живёт {getDaysSinceCreation()} дней
                      </CardDescription>
                    </div>
                    <Badge className={getHealthStatus().color}>
                      {getHealthStatus().text}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Apple className="h-4 w-4" />
                          <span className="text-sm font-medium">Голод</span>
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {pet.hunger}%
                        </span>
                      </div>
                      <Progress value={pet.hunger} />
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Droplet className="h-4 w-4" />
                          <span className="text-sm font-medium">Жажда</span>
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {pet.thirst}%
                        </span>
                      </div>
                      <Progress value={pet.thirst} />
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Smile className="h-4 w-4" />
                          <span className="text-sm font-medium">Счастье</span>
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {pet.happiness}%
                        </span>
                      </div>
                      <Progress value={pet.happiness} />
                    </div>
                  </div>

                  {(pet.hunger < 30 || pet.thirst < 30 || pet.happiness < 30) && (
                    <div className="flex items-center gap-2 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                      <AlertTriangle className="h-4 w-4 text-yellow-500" />
                      <p className="text-sm text-yellow-500">
                        Питомец нуждается в заботе! Если не заботиться о нём 2 недели, он сбежит.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Действия</CardTitle>
                  <CardDescription>
                    Заботься о питомце, чтобы он не сбежал
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-4">
                    <Button
                      onClick={feedPet}
                      variant="outline"
                      className="h-20"
                    >
                      <div className="flex flex-col items-center gap-2">
                        <Apple className="h-6 w-6" />
                        <span>Покормить</span>
                      </div>
                    </Button>
                    <Button
                      onClick={waterPet}
                      variant="outline"
                      className="h-20"
                    >
                      <div className="flex flex-col items-center gap-2">
                        <Droplet className="h-6 w-6" />
                        <span>Напоить</span>
                      </div>
                    </Button>
                    <Button
                      onClick={playWithPet}
                      variant="outline"
                      className="h-20"
                    >
                      <div className="flex flex-col items-center gap-2">
                        <Smile className="h-6 w-6" />
                        <span>Играть</span>
                      </div>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default Pet;
