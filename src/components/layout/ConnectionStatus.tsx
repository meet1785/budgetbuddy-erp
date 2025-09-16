import { useAppContext } from '@/context/AppContext';
import { Badge } from '@/components/ui/badge';
import { Wifi, WifiOff, Database, HardDrive } from 'lucide-react';

export const ConnectionStatus = () => {
  const { state } = useAppContext();

  return (
    <div className="flex items-center gap-2 text-sm">
      {state.isOnline ? (
        <>
          <div className="flex items-center gap-1">
            <Wifi className="h-4 w-4 text-green-500" />
            <Database className="h-4 w-4 text-green-500" />
            <Badge variant="default" className="bg-green-100 text-green-800">
              Online
            </Badge>
          </div>
          <span className="text-muted-foreground">MongoDB Connected</span>
        </>
      ) : (
        <>
          <div className="flex items-center gap-1">
            <WifiOff className="h-4 w-4 text-amber-500" />
            <HardDrive className="h-4 w-4 text-amber-500" />
            <Badge variant="secondary" className="bg-amber-100 text-amber-800">
              Offline
            </Badge>
          </div>
          <span className="text-muted-foreground">Local Storage Mode</span>
        </>
      )}
    </div>
  );
};