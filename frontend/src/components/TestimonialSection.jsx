import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar.jsx";

const testimonials = [
  {
    quote: "Leet.IO helped me crack my Google interview! The company-specific problems were incredibly helpful and the platform is very intuitive.",
    author: {
      name: "RS",
      role: "Software Engineer at Google",
      avatar: {
        src: "https://api.dicebear.com/7.x/avataaars/svg?seed=Rahul",
        alt: "Rahul Sharma",
      },
    },
  },
  {
    quote: "The best platform for interview preparation. The problems are well-curated and the filtering by company makes practice so much easier.",
    author: {
      name: "Prem Pujari",
      role: "SDE at Amazon",
      avatar: {
        src: "https://api.dicebear.com/7.x/avataaars/svg?seed=Priya",
        alt: "Prem Pujari",
      },
    },
  },
  {
    quote: "I love the clean interface and dark mode. Spent countless hours preparing here and landed my dream job at Microsoft!",
    author: {
      name: "Ajay ",
      role: "Full Stack Developer at Microsoft",
      avatar: {
        src: "https://api.dicebear.com/7.x/avataaars/svg?seed=Amit",
        alt: "Ajay",
      },
    },
  },
  {
    quote: "The system design resources and data structures problems helped me tremendously. Highly recommend for  students!",
    author: {
      name: "Sj",
      role: "Backend Engineer at Flipkart",
      avatar: {
        src: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sneha",
        alt: "Sj",
      },
    },
  },
  {
    quote: "As a data engineering aspirant, the SQL and database problems were exactly what I needed. Got placed at LinkedIn thanks to this platform!",
    author: {
      name: "Vikrant Singh",
      role: "Data Engineer at LinkedIn",
      avatar: {
        src: "https://api.dicebear.com/7.x/avataaars/svg?seed=Vikram",
        alt: "Vikrant",
      },
    },
  },
  {
    quote: "The search functionality and filters make finding relevant problems so easy. Cracked my Netflix interview on the first attempt!",
    author: {
      name: "Anjali Gupta",
      role: "Frontend Developer at Netflix",
      avatar: {
        src: "https://api.dicebear.com/7.x/avataaars/svg?seed=Anjali",
        alt: "Anjali Gupta",
      },
    },
  },
];

const TestimonialCard = ({ quote, author }) => {
  return (
    <div className="flex flex-col items-center text-center p-8">
      <p className="mb-8 max-w-2xl px-4 font-medium text-lg md:text-xl text-muted-foreground">
        &ldquo;{quote}&rdquo;
      </p>
      <div className="flex items-center gap-3">
        <Avatar className="size-12 md:size-14">
          <AvatarImage src={author.avatar.src} alt={author.avatar.alt} />
          <AvatarFallback>{author.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
        </Avatar>
        <div className="text-left">
          <p className="text-sm font-semibold md:text-base">{author.name}</p>
          <p className="text-muted-foreground text-xs md:text-sm">
            {author.role}
          </p>
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
            Hear from students who have cracked their dream interviews using Leet.IO
          </p>
        </div>

        {/* Top Row - 3 Testimonials */}
        <div className="grid md:grid-cols-3 gap-8 mb-8">
          {testimonials.slice(0, 3).map((testimonial, idx) => (
            <TestimonialCard key={idx} {...testimonial} />
          ))}
        </div>

        {/* Bottom Row - 3 Testimonials */}
        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.slice(3, 6).map((testimonial, idx) => (
            <TestimonialCard key={idx + 3} {...testimonial} />
          ))}
        </div>
      </div>
    </section>
  );
};

export { TestimonialSection };
