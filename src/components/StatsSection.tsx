import { Guitar, Users, Calendar, Globe, Loader2 } from "lucide-react";
import { useStats } from "@/hooks/useStats";

const StatsSection = () => {
  const { data: stats, isLoading } = useStats();

  const statsConfig = [
    {
      icon: Guitar,
      value: stats?.guitarCount || 0,
      label: "Guitars Documented",
    },
    {
      icon: Users,
      value: stats?.modelCount || 0,
      label: "Models Catalogued",
    },
    {
      icon: Calendar,
      value: `${stats?.yearsOfHistory || 50}+`,
      label: "Years of History",
    },
    {
      icon: Globe,
      value: stats?.countriesCount || 3,
      label: "Manufacturing Countries",
    },
  ];

  return (
    <section className="py-16 bg-secondary/50">
      <div className="container-wide">
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {statsConfig.map((stat, index) => (
              <div 
                key={stat.label} 
                className="text-center opacity-0 animate-fade-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <stat.icon className="h-6 w-6 mx-auto mb-3 text-muted-foreground" />
                <div className="text-3xl font-semibold mb-1">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default StatsSection;
