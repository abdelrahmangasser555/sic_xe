import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import {
  Github,
  User,
  Building,
  Link as LinkIcon,
  Linkedin,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Image from "next/image";
import { TextHoverEffect } from "@/components/animations/cool_gasser";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { Skeleton } from "@/components/ui/skeleton";
import { AnimatedTooltip } from "@/components/animations/animated_tool_tip";

// Reusable Navigation Link Component
const NavigationLink = ({
  href,
  className,
  icon,
  text,
  avatarSrc,
  avatarFallback,
}: {
  href: string;
  className: string;
  icon?: React.ReactNode;
  text: string;
  avatarSrc?: string;
  avatarFallback?: string;
}) => (
  <a
    href={href}
    target="_blank"
    rel="noopener noreferrer"
    className={`flex items-center gap-2 px-4 py-2 rounded-full text-white font-medium transition-all hover:shadow-lg hover:-translate-y-0.5 ${className}`}
  >
    {icon && icon}
    {avatarSrc && (
      <Avatar>
        <AvatarImage src={avatarSrc} alt={text} />
        <AvatarFallback>{avatarFallback}</AvatarFallback>
      </Avatar>
    )}
    <span>{text}</span>
  </a>
);

// Reusable Profile Hover Card Component
const ProfileHoverCard = ({
  name,
  description,
  imageSrc,
  role,
  company,
  skills,
  githubUrl,
  linkedinUrl,
}: {
  name: string;
  description: string;
  imageSrc: string;
  role: string;
  company: string;
  skills: string;
  githubUrl?: string;
  linkedinUrl?: string;
}) => (
  <div className="flex flex-col md:flex-row gap-4">
    <div className="relative aspect-square h-24 w-24 overflow-hidden rounded-lg border border-neutral-700 bg-neutral-800">
      <Image
        src={imageSrc}
        alt={name}
        fill
        className="object-cover"
        sizes="(max-width: 768px) 100vw, 33vw"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
    </div>
    <div className="flex-1">
      <h3 className="text-lg font-semibold mb-1">{name}</h3>
      <p className="text-sm text-muted-foreground mb-2">{description}</p>
      <div className="flex items-center mt-2">
        <User size={16} className="mr-1 text-neutral-400" />
        <span className="text-sm">{role}</span>
      </div>
      <div className="flex items-center mt-2">
        <Building size={16} className="mr-1 text-neutral-400" />
        <span className="text-sm">{company}</span>
      </div>
      <div className="flex items-center mt-2">
        <span className="text-sm text-muted-foreground">
          <strong>Skills:</strong> {skills}
        </span>
      </div>

      {/* Social Links */}
      <div className="flex items-center gap-3 mt-3 pt-3 border-t border-neutral-800">
        {githubUrl && (
          <a
            href={githubUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-neutral-400 hover:text-white transition-colors"
            title="GitHub Profile"
          >
            <Github size={18} />
          </a>
        )}
        {linkedinUrl && (
          <a
            href={linkedinUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-neutral-400 hover:text-blue-500 transition-colors"
            title="LinkedIn Profile"
          >
            <Linkedin size={18} />
          </a>
        )}
      </div>
    </div>
  </div>
);

// Reusable Company Hover Card Component
const CompanyHoverCard = ({
  name,
  description,
  imageSrc,
  website,
}: {
  name: string;
  description: string;
  imageSrc: string;
  website: string;
}) => (
  <div className="space-y-4">
    {/* Company Info Section */}
    <div className="flex items-center gap-3">
      <div className="relative aspect-square h-16 w-16 overflow-hidden rounded-lg border border-neutral-700 bg-neutral-800">
        <Image
          src={imageSrc}
          alt={name}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 33vw"
        />
      </div>
      <div>
        <h3 className="text-lg font-semibold">{name}</h3>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
    </div>

    {/* Website Section */}
    <div className="p-3 rounded-lg bg-neutral-900/50 border border-neutral-800">
      <a
        href={website}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-2 text-sm hover:underline text-blue-400"
      >
        <LinkIcon size={14} />
        <span>{website}</span>
      </a>
    </div>

    {/* Team Section - Placeholder */}
    <div className="p-3 rounded-lg bg-neutral-900/50 border border-neutral-800">
      <div className="flex items-center  mb-2 gap-x-3">
        <h4 className="text-sm font-semibold mb-2">Our Team</h4>
        <AnimatedTooltipPreview />
      </div>
      <div className="flex flex-wrap gap-2">
        {people.map((person) => (
          <div key={person.id} className="flex items-center gap-2">
            <Avatar>
              <AvatarImage src={person.image} alt={person.name} />
              <AvatarFallback>{person.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <span className="text-sm">{person.name}</span>
          </div>
        ))}
      </div>
    </div>
  </div>
);

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SIC/XE Code Assistant",
  description: "this is a SIC/XE code convertor",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased dark bg-gradient-to-b from-neutral-950 to-black`}
      >
        <nav className="sticky top-0 z-10 p-4 backdrop-blur-md bg-black/30 border-b border-neutral-800">
          <div className="container mx-auto flex flex-wrap gap-3 justify-center md:justify-end">
            <NavigationLink
              href="https://github.com/abdelrahmangasser555/sic_xe.git"
              className="bg-gradient-to-r from-slate-800 to-indigo-900 hover:from-slate-700 hover:to-indigo-800 hover:shadow-indigo-900/20"
              icon={<Github size={18} />}
              text="View Repo"
            />

            <HoverCard>
              <HoverCardTrigger asChild>
                <NavigationLink
                  href="https://gasserportofolio.netlify.app/"
                  className="bg-gradient-to-r from-zinc-800 to-blue-900 hover:from-zinc-700 hover:to-blue-800 hover:shadow-blue-900/20"
                  avatarSrc="https://deistor4v34pj.cloudfront.net/2025-04-16T19-19-07.751Z-gasser%201.jpg"
                  avatarFallback="AG"
                  text="Visit My Profile"
                />
              </HoverCardTrigger>
              <HoverCardContent className="w-80 md:w-96 p-4">
                <ProfileHoverCard
                  name="Gasser"
                  description="Founder  , Entrepreneur , Programmer and some times a student"
                  imageSrc="https://deistor4v34pj.cloudfront.net/2025-04-16T19-19-07.751Z-gasser%201.jpg"
                  role="FOUNDER / Software Engineer"
                  company="DAAS AI / Tailored Tech"
                  skills="JavaScript, React, Node.js, Python , Next.js  , AWS ...and a lot more "
                  githubUrl="https://github.com/abdelrahmangasser555"
                  linkedinUrl="https://www.linkedin.com/in/abdelrahman-gasser-74571127b/"
                />
              </HoverCardContent>
            </HoverCard>

            <HoverCard>
              <HoverCardTrigger asChild>
                <NavigationLink
                  href="https://www.tailoredtech.tech/"
                  className="bg-gradient-to-r from-stone-800 to-[#13ffaa] hover:from-stone-700 hover:to-green-500 hover:shadow-rose-900/20"
                  avatarSrc="https://deistor4v34pj.cloudfront.net/2025-05-05T17-51-55.745Z-logo.png"
                  avatarFallback="Tt."
                  text="Visit Our Company"
                />
              </HoverCardTrigger>
              <HoverCardContent className="w-80 md:w-96 p-4">
                <CompanyHoverCard
                  name="Tailored Tech"
                  description="Innovative software solutions tailored to your business needs."
                  imageSrc="https://deistor4v34pj.cloudfront.net/2025-05-05T17-51-55.745Z-logo.png"
                  website="https://www.tailoredtech.tech/"
                />
              </HoverCardContent>
            </HoverCard>
          </div>
        </nav>
        {children}

        <TextHoverEffect text="GASSER" />
        <TextHoverEffect text="❤" />
        <TextHoverEffect text="CODING" />
      </body>
    </html>
  );
}

const people = [
  {
    id: 1,
    name: "Abdelrahman Gasser",
    designation: "FOUNDER / Software Engineer",
    image:
      "https://deistor4v34pj.cloudfront.net/2025-04-16T19-19-07.751Z-gasser%201.jpg",
  },
  {
    id: 2,
    name: "Yusuf Emad",
    designation: "CO-FOUNDER / Software Engineer",
    image:
      "https://deistor4v34pj.cloudfront.net/2025-05-05T18-47-52.237Z-joe%20image.jpg",
  },
];
export function AnimatedTooltipPreview() {
  return <AnimatedTooltip items={people} />;
}
