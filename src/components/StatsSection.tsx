import { Guitar, Users, Calendar, Globe } from "lucide-react";

const stats = [
  {
    icon: Guitar,
    value: "2,847",
    label: "Guitars Documented",
  },
  {
    icon: Users,
    value: "156",
    label: "Models Catalogued",
  },
  {
    icon: Calendar,
    value: "50+",
    label: "Years of History",
  },
  {
    icon: Globe,
    value: "3",
    label: "Manufacturing Countries",
  },
];

const StatsSection = () => {
  return (
    <section className="py-16 bg-secondary/50">
      <div className="container-wide">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat, index) => (
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
      </div>
    </section>
  );
};

export default StatsSection;
