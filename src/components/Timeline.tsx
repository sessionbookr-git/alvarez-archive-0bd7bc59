import { Guitar, Award, Globe, Sparkles, Music, Star, Wrench, Mic2 } from "lucide-react";

const timelineEvents = [
  {
    year: "1965",
    title: "The Beginning",
    description: "St. Louis Music begins importing guitars from Japan under the Alvarez brand name, bringing quality acoustic instruments to American musicians at accessible prices.",
    icon: Guitar,
    highlight: true,
  },
  {
    year: "1966",
    title: "Yairi Partnership",
    description: "A legendary partnership forms with master luthier Kazuo Yairi in Kani, Japan. This collaboration would define Alvarez's commitment to handcrafted excellence.",
    icon: Award,
  },
  {
    year: "1970",
    title: "Early Classics Emerge",
    description: "Iconic models like the 5021 12-string and 5014 establish Alvarez as a serious acoustic brand. The Emperor date code system begins on Japanese-made instruments.",
    icon: Star,
  },
  {
    year: "1975",
    title: "Artist Series Launch",
    description: "The Artist series debuts, featuring premium solid tonewoods and refined craftsmanship. These guitars attract professional players and recording artists.",
    icon: Music,
  },
  {
    year: "1980s",
    title: "DY Series Recognition",
    description: "Kazuo Yairi's DY models gain widespread recognition among professional players. The distinctive soundhole-accessible truss rod becomes a Yairi trademark.",
    icon: Wrench,
  },
  {
    year: "1990s",
    title: "Global Expansion",
    description: "Production expands to Korea, making quality Alvarez guitars more accessible worldwide while maintaining Japanese craftsmanship for premium lines.",
    icon: Globe,
  },
  {
    year: "2000s",
    title: "Modern Innovation",
    description: "Introduction of the SYS600 pickup system and new body styles. The Masterworks series continues the tradition of premium handcrafted acoustics.",
    icon: Mic2,
  },
  {
    year: "2024",
    title: "Laureate Series Debuts",
    description: "The all-new Laureate series launches, representing 60 years of acoustic guitar expertise with cutting-edge design and exceptional playability.",
    icon: Sparkles,
    highlight: true,
  },
];

const Timeline = () => {
  return (
    <section className="py-24 bg-gradient-to-b from-background to-secondary/20">
      <div className="container-wide">
        <div className="text-center mb-16">
          <span className="text-primary text-sm font-medium tracking-widest uppercase mb-3 block">
            Since 1965
          </span>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">60 Years of Craftsmanship</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            From humble beginnings in St. Louis to a global legacy of acoustic excellence, 
            discover the key moments that shaped Alvarez guitars.
          </p>
        </div>

        <div className="relative max-w-5xl mx-auto">
          {/* Center line */}
          <div className="absolute left-4 md:left-1/2 transform md:-translate-x-1/2 w-0.5 h-full bg-gradient-to-b from-primary/50 via-primary/30 to-primary/10" />

          <div className="space-y-6 md:space-y-12">
            {timelineEvents.map((event, index) => {
              const Icon = event.icon;
              return (
                <div
                  key={event.year}
                  className={`relative flex flex-col md:flex-row items-start md:items-center gap-4 md:gap-8 opacity-0 animate-fade-in ${
                    index % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"
                  }`}
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  {/* Content */}
                  <div className={`flex-1 pl-12 md:pl-0 ${index % 2 === 0 ? "md:text-right md:pr-12" : "md:text-left md:pl-12"}`}>
                    <div
                      className={`bg-card border rounded-xl p-5 md:p-6 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 ${
                        event.highlight 
                          ? "border-primary/40 bg-gradient-to-br from-primary/5 to-transparent" 
                          : "border-border"
                      }`}
                    >
                      <div className={`flex items-center gap-3 mb-3 ${index % 2 === 0 ? "md:justify-end" : ""}`}>
                        <span className={`inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider ${
                          event.highlight ? "text-primary" : "text-muted-foreground"
                        }`}>
                          {event.year}
                        </span>
                        {event.highlight && (
                          <span className="text-[10px] font-medium bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                            Milestone
                          </span>
                        )}
                      </div>
                      <h3 className="font-semibold text-lg mb-2">{event.title}</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">{event.description}</p>
                    </div>
                  </div>

                  {/* Center dot with icon */}
                  <div className="absolute left-4 md:left-1/2 transform -translate-x-1/2 flex items-center justify-center">
                    <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center shadow-sm ${
                      event.highlight 
                        ? "bg-primary border-primary text-primary-foreground" 
                        : "bg-background border-primary/30 text-primary"
                    }`}>
                      <Icon className="w-4 h-4" />
                    </div>
                  </div>

                  {/* Spacer for opposite side */}
                  <div className="flex-1 hidden md:block" />
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Timeline;
