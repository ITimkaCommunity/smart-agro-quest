import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import Header from "@/components/layout/Header";
import { Sun, Moon } from "lucide-react";
import { Card } from "@/components/ui/card";
import FarmZoneView from "@/components/farm/FarmZoneView";
import FarmZoneGrid from "@/components/farm/FarmZoneGrid";
import { useFarmRealtimeUpdates } from "@/hooks/useFarmRealtimeUpdates";
import { useFarmApi } from "@/hooks/useFarmApi";
import { FarmSkeleton } from "@/components/ui/loading-skeleton";
import { zonesApi } from "@/lib/api-client";
import { useToast } from "@/hooks/use-toast";

interface FarmZone {
  id: string;
  name: string;
  zoneType: string;
  description: string;
  iconUrl: string;
}

const Farm = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [isDaytime, setIsDaytime] = useState(true);
  const [selectedZone, setSelectedZone] = useState<string | null>(null);
  const [farmZones, setFarmZones] = useState<FarmZone[]>([]);
  const { toast } = useToast();

  // Use API hook
  const farmData = useFarmApi(selectedZone);

  // WebSocket real-time updates
  const { isConnected, connectionError } = useFarmRealtimeUpdates(
    user?.id || null,
    () => {
      // Refresh data when updates come in
      farmData.refreshData();
    }
  );

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate("/auth");
      return;
    }

    const checkTime = () => {
      const hour = new Date().getHours();
      setIsDaytime(hour >= 6 && hour < 20);
    };
    
    checkTime();
    const interval = setInterval(checkTime, 60000);

    return () => {
      clearInterval(interval);
    };
  }, [navigate, isAuthenticated, authLoading]);

  useEffect(() => {
    const loadZones = async () => {
      try {
        const zones = await zonesApi.getAllZones();
        setFarmZones(zones);
      } catch (error: any) {
        toast({
          title: "Ошибка загрузки зон",
          description: error.message,
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated) {
      loadZones();
    }
  }, [isAuthenticated, toast]);

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header isWebSocketConnected={isConnected} connectionError={connectionError} />
        <main className="container py-8">
          <FarmSkeleton />
        </main>
      </div>
    );
  }

  if (selectedZone) {
    const zone = farmZones.find(z => z.id === selectedZone);
    if (zone) {
      return (
        <div className="min-h-screen bg-background">
          <Header isWebSocketConnected={isConnected} connectionError={connectionError} />
          <main className="container py-8">
            <FarmZoneView
              zoneName={zone.name}
              zoneType={zone.zoneType}
              zoneId={zone.id}
              onBack={() => setSelectedZone(null)}
            />
          </main>
        </div>
      );
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Header isWebSocketConnected={isConnected} connectionError={connectionError} />
      
      <main className="container py-8">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">
                Интерактивная <span className="gradient-text">Ферма</span>
              </h1>
              <p className="text-muted-foreground">
                Выращивай растения, заботься о животных и создавай продукты
              </p>
            </div>
            
            <div className="flex items-center gap-2">
              {isDaytime ? (
                <Sun className="h-6 w-6 text-yellow-500" />
              ) : (
                <Moon className="h-6 w-6 text-blue-400" />
              )}
              <span className="text-sm text-muted-foreground">
                {isDaytime ? "День" : "Ночь"}
              </span>
            </div>
          </div>

          {/* Farm Zones Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {farmZones.map((zone) => (
              <Card
                key={zone.id}
                className="p-6 cursor-pointer hover:shadow-lg transition-all hover:scale-105 group"
                onClick={() => setSelectedZone(zone.id)}
              >
                <div className="space-y-4">
                  <div className="w-full h-32 bg-accent/20 rounded-lg flex items-center justify-center overflow-hidden">
                    <img 
                      src={zone.iconUrl} 
                      alt={zone.name}
                      className="w-24 h-24 object-contain group-hover:scale-110 transition-transform"
                    />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold gradient-text mb-1">
                      {zone.name}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {zone.description}
                    </p>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          <p className="text-center text-sm text-muted-foreground">
            Выполняй задания, чтобы получить семена и ресурсы для развития фермы
          </p>
        </div>
      </main>
    </div>
  );
};

export default Farm;
