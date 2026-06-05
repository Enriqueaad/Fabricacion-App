import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type Estado = "BORRADOR" | "EN_PROCESO" | "COMPLETADO" | "FINALIZADO" | string;

const estadoConfig: Record<string, { label: string; className: string }> = {
  BORRADOR: {
    label: "Borrador",
    className: "bg-muted text-muted-foreground hover:bg-muted border-0",
  },
  EN_PROCESO: {
    label: "En proceso",
    className: "bg-primary/10 text-primary hover:bg-primary/10 border-0",
  },
  COMPLETADO: {
    label: "Completado",
    className: "bg-green-100 text-green-700 hover:bg-green-100 border-0",
  },
  FINALIZADO: {
    label: "Finalizado",
    className: "bg-green-100 text-green-700 hover:bg-green-100 border-0",
  },
};

interface StatusBadgeProps {
  estado: Estado;
  className?: string;
}

export function StatusBadge({ estado, className }: StatusBadgeProps) {
  const config = estadoConfig[estado] ?? {
    label: estado,
    className: "bg-muted text-muted-foreground border-0",
  };

  return (
    <Badge
      variant="secondary"
      className={cn("font-medium text-xs px-2 py-0.5", config.className, className)}
    >
      {config.label}
    </Badge>
  );
}
