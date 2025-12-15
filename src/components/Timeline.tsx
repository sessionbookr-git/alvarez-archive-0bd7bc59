const timelineEvents = [
  {
    year: "1965",
    title: "Alvarez Founded",
    description: "St. Louis Music begins importing guitars under the Alvarez brand name.",
  },
  {
    year: "1966",
    title: "Yairi Partnership",
    description: "Partnership established with master luthier Kazuo Yairi in Japan.",
  },
  {
    year: "1970",
    title: "Early Classics",
    description: "Models like the 5021 establish Alvarez as a quality acoustic brand.",
  },
  {
    year: "1975",
    title: "Artist Series Launch",
    description: "Introduction of higher-end Artist series with premium tonewoods.",
  },
  {
    year: "1980s",
    title: "DY Series Expansion",
    description: "Yairi-crafted DY models gain recognition among professional players.",
  },
  {
    year: "1990s",
    title: "Korean Production",
    description: "Select models begin production in Korea, expanding accessibility.",
  },
  {
    year: "2000s",
    title: "Modern Era",
    description: "Continued innovation with electronics and new body styles.",
  },
  {
    year: "Today",
    title: "Legacy Continues",
    description: "Alvarez remains a trusted name with guitars spanning all price points.",
  },
];

const Timeline = () => {
  return (
    <section className="py-20 bg-secondary/30">
      <div className="container-wide">
        <div className="text-center mb-12">
          <h2 className="text-2xl font-semibold mb-3">60 Years of Craftsmanship</h2>
          <p className="text-muted-foreground">
            Key moments in Alvarez guitar history
          </p>
        </div>

        <div className="relative">
          {/* Center line */}
          <div className="absolute left-1/2 transform -translate-x-1/2 w-px h-full bg-border hidden md:block" />

          <div className="space-y-8 md:space-y-0">
            {timelineEvents.map((event, index) => (
              <div
                key={event.year}
                className={`relative flex flex-col md:flex-row items-center md:items-start gap-4 md:gap-8 opacity-0 animate-fade-in ${
                  index % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"
                }`}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {/* Content */}
                <div className={`flex-1 ${index % 2 === 0 ? "md:text-right" : "md:text-left"}`}>
                  <div
                    className={`bg-background border border-border rounded-lg p-4 md:p-6 ${
                      index % 2 === 0 ? "md:mr-8" : "md:ml-8"
                    }`}
                  >
                    <span className="text-xs font-medium text-primary uppercase tracking-wider">
                      {event.year}
                    </span>
                    <h3 className="font-semibold mt-1 mb-2">{event.title}</h3>
                    <p className="text-sm text-muted-foreground">{event.description}</p>
                  </div>
                </div>

                {/* Center dot */}
                <div className="absolute left-1/2 transform -translate-x-1/2 hidden md:flex items-center justify-center">
                  <div className="w-3 h-3 bg-primary rounded-full border-2 border-background shadow-sm" />
                </div>

                {/* Spacer for opposite side */}
                <div className="flex-1 hidden md:block" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Timeline;
