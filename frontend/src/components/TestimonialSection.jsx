const testimonials = [
  {
    quote: "Generate, optimize, and debug code across 50+ languages with incredible precision",
    author: {
      name: "Sarah Chen",
      role: "Software Engineer at Google",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop",
      background: "https://images.unsplash.com/photo-1635776062360-af423602aff3?w=800&q=80",
      stat: "95% accuracy rate"
    },
  },
  {
    quote: "The platform transformed how I approach coding interviews. Practice feels purposeful now",
    author: {
      name: "Michael Rodriguez",
      role: "Senior Developer at Meta",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop",
      background: "https://images.unsplash.com/photo-1579548122080-c35fd6820ecb?w=800&q=80",
      stat: "Human-like quality"
    },
  },
  {
    quote: "Company-specific problem sets helped me crack Microsoft in just 6 weeks of focused prep",
    author: {
      name: "Priya Sharma",
      role: "SDE at Microsoft",
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop",
      background: "https://images.unsplash.com/photo-1635776062127-d379bfcba9f8?w=800&q=80",
      stat: "Real-time insights"
    },
  },
  {
    quote: "Best investment for my career. The curated problems saved me 40+ hours every week",
    author: {
      name: "James Wilson",
      role: "Tech Lead at Amazon",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop",
      background: "https://images.unsplash.com/photo-1635776063328-153b13e3c245?w=800&q=80",
      stat: "Save 40+ hours/week"
    },
  },
];

const TestimonialCard = ({ quote, author }) => {
  return (
    <div
      className="group cursor-pointer"
    >
      <div
        className="relative transform overflow-hidden rounded-2xl p-6 shadow-lg transition-all duration-300 group-hover:scale-105 hover:shadow-xl"
        style={{
          background: `url(${author.background})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="relative">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full overflow-hidden border-2 border-white/30">
            <img 
              src={author.avatar} 
              alt={author.name}
              className="h-full w-full object-cover"
            />
          </div>
          <h3 className="mb-2 font-sans text-lg font-medium text-white">
            {author.name}
          </h3>
          <p className="mb-4 font-sans text-sm text-white/80">
            {quote}
          </p>
          <div className="flex items-center justify-between text-white/90 border-t border-white/20 pt-4 mt-4">
            <span className="font-sans text-xs">{author.role}</span>
            <span className="font-sans text-xs font-semibold">{author.stat}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

const TestimonialSection = () => {
  return (
    <section className="py-24 bg-muted/30">
      <div className="container px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            What our users are saying
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Hear from developers who transformed their interview prep
          </p>
        </div>

        <div className="mx-auto my-8 grid w-full max-w-7xl grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {testimonials.map((testimonial, idx) => (
            <TestimonialCard key={idx} {...testimonial} />
          ))}
        </div>
      </div>
    </section>
  );
};

export { TestimonialSection };
