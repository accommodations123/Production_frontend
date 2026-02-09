import React, { useState, useEffect, useRef } from "react";
import { Calendar, Globe, Plus, Minus, CheckCircle, Star, Users, Award, Code, ArrowRight } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

/* ================= DATA ================= */

const processSteps = [
  {
    step: "01",
    title: "Discover",
    desc: "We dive deep to understand your business, audience, and goals. This research forms the foundation for everything we do.",
  },
  {
    step: "02",
    title: "Define",
    desc: "We clarify the project scope, set goals, and align our strategy with your vision to ensure a clear path forward.",
  },
  {
    step: "03",
    title: "Design",
    desc: "Our creative team brings ideas to life with engaging UI/UX designs that prioritize user experience and brand identity.",
  },
  {
    step: "04",
    title: "Develop",
    desc: "We transform designs into fully functional digital products using the latest technologies and best practices.",
  },
  {
    step: "05",
    title: "Deploy",
    desc: "We rigorously test and launch your project, ensuring it works flawlessly across devices and platforms.",
  },
  {
    step: "06",
    title: "Deliver",
    desc: "Even after deployment, we provide ongoing support, updates, and improvements to ensure long-term success.",
  },
];

const whyChooseUsItems = [
  {
    title: "Custom Web & Application Development",
    content:
      "We design and develop responsive, user-friendly websites and custom applications tailored to your business needs. From concept to deployment, we ensure scalable and secure solutions that drive growth and engagement.",
  },
  {
    title: "Data Engineering & Analytics",
    content:
      "We unlock the power of data with robust pipelines, dashboards, and analytics that drive smarter decisions.",
  },
  {
    title: "AI Integration",
    content:
      "We integrate AI-driven solutions to automate workflows and enhance customer experiences.",
  },
  {
    title: "Cloud Services",
    content:
      "Secure, scalable cloud architectures built for performance and reliability.",
  },
  {
    title: "Enterprise Software Development",
    content:
      "Enterprise-grade software designed for long-term scalability and growth.",
  },
  {
    title: "IT Consulting",
    content:
      "Strategic consulting that aligns technology with your business goals.",
  },
];

/* ================= ANIMATION HOOK ================= */

const useScrollAnimation = (threshold = 0.1) => {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current);
      }
    };
  }, [threshold]);

  return [ref, isVisible];
};

/* ================= COMPONENT ================= */

const AboutUs = () => {
  const [openIndex, setOpenIndex] = useState(0);

  // Animation refs
  const [processRef, processVisible] = useScrollAnimation(0.1);

  return (
    <section className="w-full">
      <Navbar />
      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fadeInUp {
          animation: fadeInUp 0.8s ease-out forwards;
        }
      `}</style>

      {/* ================= HERO ================= */}
      <div
        className="relative bg-cover bg-center min-h-[520px] flex items-center"
        style={{ backgroundImage: "url('/colleagues-working-project-discussing-details.jpg')" }}
      >
        <div className="absolute inset-0 bg-black/60" />
        <div className="relative max-w-6xl mx-auto px-6 text-center text-white">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">About Us</h1>
          <h2 className="text-xl md:text-2xl font-semibold mb-6">
            Welcome to The IT Consulting Agency
          </h2>
          <p className="max-w-3xl mx-auto text-gray-200">
            At NextKinLife, we believe in meaningful innovation—technology that transforms lives.
            Founded on a vision of long-term impact, we’ve built a company not just around code and patents, but around people.
            Our team is our greatest asset, united by ambition, curiosity, and a relentless pursuit of growth.
          </p>
        </div>
      </div>

      {/* ================= INFO CARDS ================= */}
      <div className="bg-[#f4f3ff] py-16">
        <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              title: "Who Are We",
              text:
                "We are a passionate team of innovators, designers, and strategists committed to helping businesses thrive in the digital world. Our focus is on delivering powerful, user-centric digital solutions tailored to your goals.",
            },
            {
              title: "Our Mission",
              text:
                "We are not just building software; we are building a movement where people travel together on a path of mutual success. Our leadership believes in mentoring the next generation of creators, thinkers, and changemakers.",
            },
            {
              title: "What We Do",
              list: [
                "UI UX Design",
                "Website Development",
                "Marketing",
                "Social Media",
                "eCommerce Store",
                "Tech Support",
              ],
            },
          ].map((card, i) => (
            <div key={i} className="bg-white rounded-lg shadow-md p-8">
              <div className="w-12 h-1 bg-purple-600 mb-6" />
              <h3 className="text-2xl font-bold mb-4">{card.title}</h3>
              {card.text ? (
                <p className="text-gray-600">{card.text}</p>
              ) : (
                <ul className="space-y-2 text-gray-700">
                  {card.list.map((item) => (
                    <li key={item}>▶ {item}</li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* ================= FOUNDED ================= */}
      <div className="bg-[#f5f4ff] py-20">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-4xl font-bold mb-6">Founded on Innovation</h2>
            <p className="text-gray-600 mb-6">
              Nextkinlife is a global IT Services & Consulting company proudly headquartered in Ellicott City, Maryland, USA, with a strong development and management team based in India.
            </p>
            <p className="text-gray-600 mb-6">
              We specialize in delivering complete end-to-end software solutions for our U.S. clients, powered by a highly skilled Indian workforce. In addition to client-based services, our team is actively engaged in building innovative internal products driving future technology advancements.
            </p>
            <p className="text-gray-600 mb-10">
              Our commitment to excellence, innovation, and client success defines everything we do.
            </p>
            <div className="flex gap-10 text-purple-600 font-medium">
              <span className="flex items-center gap-2">
                <Calendar size={20} /> Founded: 2025
              </span>
              <span className="flex items-center gap-2">
                <Globe size={20} /> Global Reach
              </span>
            </div>
          </div>
          <img
            src="/photo-1522071820081-009f0129c71c.avif"
            alt="Team"
            className="rounded-xl shadow-lg w-full h-[420px] object-cover"
          />
        </div>
      </div>

      {/* ================= 6-D PROCESS ================= */}
      <div ref={processRef} className="py-24 relative" style={{ backgroundColor: "#f5f4ff" }}>
        <div className="max-w-7xl mx-auto px-6">
          <h2 className={`text-4xl md:text-5xl font-bold text-center mb-20 ${processVisible ? 'animate-fadeInUp' : 'opacity-0'}`} style={{ color: "var(--color-primary)" }}>
            Our 6-D Process
          </h2>

          <div className="relative">
            {/* Process flow line for desktop */}
            <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-500 via-purple-500 to-red-500 transform -translate-y-1/2 z-0"></div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 relative z-10">
              {processSteps.map((item, i) => {
                // Define different colors for each step
                const stepColors = [
                  { bg: "bg-blue-100", text: "text-blue-600", icon: "text-blue-500" },
                  { bg: "bg-purple-100", text: "text-purple-600", icon: "text-purple-500" },
                  { bg: "bg-pink-100", text: "text-pink-600", icon: "text-pink-500" },
                  { bg: "bg-amber-100", text: "text-amber-600", icon: "text-amber-500" },
                  { bg: "bg-green-100", text: "text-green-600", icon: "text-green-500" },
                  { bg: "bg-red-100", text: "text-red-600", icon: "text-red-500" }
                ];

                const color = stepColors[i % stepColors.length];

                // Define icons for each step
                const icons = [
                  <Globe size={32} className={color.icon} />,
                  <CheckCircle size={32} className={color.icon} />,
                  <Star size={32} className={color.icon} />,
                  <Code size={32} className={color.icon} />,
                  <Award size={32} className={color.icon} />,
                  <Users size={32} className={color.icon} />
                ];

                return (
                  <div
                    key={item.step}
                    className={`process-step relative bg-white rounded-xl p-8 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-2 ${processVisible ? 'animate-fadeInUp' : 'opacity-0'}`}
                    style={{ animationDelay: `${i * 0.1}s` }}
                  >
                    {/* Step number with gradient background */}
                    <div
                      className={`absolute -top-4 -left-4 w-16 h-16 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg ${color.bg.replace('100', '500')}`}
                    >
                      {item.step}
                    </div>

                    {/* Icon container */}
                    <div className="flex justify-center mb-6 mt-4">
                      <div className={`w-16 h-16 rounded-full ${color.bg} flex items-center justify-center`}>
                        {icons[i]}
                      </div>
                    </div>

                    <h3 className={`text-2xl font-bold mb-4 text-center ${color.text}`}>{item.title}</h3>
                    <p className="text-gray-600 text-center">{item.desc}</p>

                    {/* Arrow pointing to next step on desktop */}
                    {i < 5 && (
                      <div className="hidden lg:block absolute top-1/2 -right-6 transform -translate-y-1/2">
                        <ArrowRight size={24} className="text-gray-300" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* ================= WHY CHOOSE US ================= */}
      <div className="bg-[#f5f4ff] py-24">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-16">
          <img
            src="/businesspeople-meeting-office-working.jpg"
            alt="Why Choose Us"
            className="w-full h-[520px] object-cover rounded-xl"
          />

          <div>
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Why Choose Us?
            </h2>
            <p className="text-gray-600 mb-10 max-w-xl">
              At NextKinLife, we blend innovation, expertise, and a client-first approach to deliver reliable tech solutions that drive real results. With a global team, proven track record, and commitment to quality, we turn your ideas into scalable, future-ready digital products.
            </p>

            <div className="space-y-4">
              {whyChooseUsItems.map((item, index) => {
                const isOpen = openIndex === index;
                return (
                  <div key={index} className="bg-white rounded-lg px-6 py-5">
                    <button
                      onClick={() =>
                        setOpenIndex(isOpen ? null : index)
                      }
                      className="w-full flex justify-between items-center text-left"
                    >
                      <span
                        className={`font-semibold ${isOpen ? "text-purple-600" : "text-gray-900"
                          }`}
                      >
                        {item.title}
                      </span>
                      {isOpen ? (
                        <Minus size={20} />
                      ) : (
                        <Plus size={20} />
                      )}
                    </button>

                    {isOpen && (
                      <p className="mt-4 text-gray-600">{item.content}</p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* ================= CTA CARD ================= */}
      <div className="bg-[#f5f4ff] py-16 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-2xl shadow-lg p-12 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-10">
            {/* Text */}
            <div className="max-w-2xl">
              <h3 className="text-3xl font-bold text-purple-600 mb-4">
                Would you like to start a project with us?
              </h3>

              <p className="text-gray-600 leading-relaxed">
                Let's turn your ideas into reality. Whether you're building something new or enhancing an existing project, our team is here to help you every step of the way. Reach out and let's create something exceptional together.
              </p>
            </div>


          </div>
        </div>
      </div>

      <Footer />
    </section>
  );
};

export default AboutUs;