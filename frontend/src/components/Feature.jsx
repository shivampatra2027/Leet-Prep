import {
  Code,
  GitBranch,
  List,
  Play,
  Sparkles,
  WandSparkles,
} from "lucide-react";

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";

const Feature = () => {
  const features = [
    {
      icon: Code,
      title: "Well organized",
      description: "The transparency of our data will help you make the informed decisions you need to.",
      image: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=400&h=160&fit=crop"
    },
    {
      icon: Play,
      title: "Lightning fast",
      description: "Our performance optimization ensures quick load times and a smooth user experience.",
      image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=160&fit=crop"
    },
    {
      icon: GitBranch,
      title: "Powerful search",
      description: "Our search functionality helps users find information quickly and easily.",
      image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=160&fit=crop"
    },
    {
      icon: List,
      title: "Company-wise filter",
      description: "Filter problems by your target companies and focus on what matters most.",
      image: "https://images.unsplash.com/photo-1557426272-fc759fdf7a8d?w=400&h=160&fit=crop"
    },
    {
      icon: WandSparkles,
      title: "Progress tracking",
      description: "Track your progress and see how far you've come with detailed analytics.",
      image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=160&fit=crop"
    },
    {
      icon: Sparkles,
      title: "Very customized",
      description: "Tailor the platform to fit your learning style and preparation needs with ease.",
      image: "https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?w=400&h=160&fit=crop"
    }
  ];

  return (
    <section id="features" className="py-32 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-5xl flex-col items-center gap-6 text-center">
          <h1 className="mb-6 text-pretty text-4xl font-semibold lg:text-5xl text-foreground">
            Powerful features for interview prep
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl">
            Explore the tools and design choices that make preparation efficient.
          </p>

          <div className="mt-10 grid grid-cols-1 place-items-center gap-8 sm:grid-cols-2 lg:grid-cols-3 w-full">
            {features.map((feature, idx) => (
              <Card key={idx} className="w-full">
                <CardHeader className="pb-1">
                  <feature.icon className="size-4" strokeWidth={1} />
                </CardHeader>
                <CardContent className="text-left">
                  <h2 className="mb-1 text-lg font-semibold">{feature.title}</h2>
                  <p className="text-muted-foreground leading-snug">
                    {feature.description}
                  </p>
                </CardContent>
                <CardFooter className="justify-end pb-0 pr-0">
                  <img
                    className="h-40 w-full rounded-tl-md object-cover object-center"
                    src={feature.image}
                    alt={feature.title}
                  />
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export { Feature };
