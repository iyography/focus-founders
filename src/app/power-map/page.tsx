"use client";

import { useState, useEffect, useRef, useMemo, Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import * as d3 from "d3";
import {
  Zap,
  Network,
  Stars,
  Orbit,
  Search,
  Circle,
  ChevronRight,
  X,
} from "lucide-react";

// Video background
const VIDEO_URL = "/rvids/28.mp4";

function getPosterFromVideo(videoUrl: string): string {
  // For Cloudinary URLs, generate poster; for local videos, return empty
  if (videoUrl.includes("cloudinary")) {
    return videoUrl
      .replace("/video/upload/q_auto,f_auto/", "/video/upload/so_0,f_jpg,q_auto/")
      .replace(".mp4", ".jpg");
  }
  return "";
}

function BackgroundVideo({ src }: { src: string }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const posterUrl = getPosterFromVideo(src);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = true;
    const handlePlaying = () => setIsPlaying(true);
    video.addEventListener("playing", handlePlaying);
    const playVideo = () => {
      if (video.paused) video.play().catch(() => {});
    };
    video.addEventListener("loadedmetadata", playVideo);
    video.addEventListener("canplay", playVideo);
    playVideo();
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((entry) => entry.isIntersecting && playVideo()),
      { threshold: 0.1 }
    );
    observer.observe(video);
    const handleInteraction = () => playVideo();
    document.addEventListener("touchstart", handleInteraction, { once: true, passive: true });
    document.addEventListener("click", handleInteraction, { once: true });
    return () => {
      observer.disconnect();
      video.removeEventListener("playing", handlePlaying);
    };
  }, []);

  return (
    <div
      className="fixed inset-0 w-full h-full z-0"
      style={{ backgroundImage: `url(${posterUrl})`, backgroundSize: "cover", backgroundPosition: "center" }}
    >
      <video
        ref={videoRef}
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        controls={false}
        className={`w-full h-full object-cover transition-opacity duration-300 ${isPlaying ? "opacity-100" : "opacity-0"}`}
      >
        <source src={src} type="video/mp4" />
      </video>
      <div className="absolute inset-0 bg-[#0A0A0A]/85" />
    </div>
  );
}

// Family member data
interface FamilyMember {
  id: number;
  name: string;
  superpower: string;
  needsHelp?: string;
  image?: string;
}

const familyMembers: FamilyMember[] = [
  { id: 1, name: "Bill Widmer", superpower: "Believing in people so fiercely they believe in themselves, marketing (community, SEO/GEO), copywriting, connecting people", needsHelp: "Building systems that free up time, personalized outreach at scale", image: "/profiles/billhaze.jpg" },
  { id: 2, name: "Melissa Boster", superpower: "Helping women in perimenopause and menopause find relief and prevent long term health problems", needsHelp: "Traffic and helping new members find the community", image: "/profiles/melissa.jpg" },
  { id: 3, name: "Tim Adam", superpower: "Everything Pinterest, running a Ninja Warrior Gym, Skool Group engagement, organic Skool group growth", needsHelp: "Converting more members to paid tiers", image: "/profiles/timadam.jpg" },
  { id: 4, name: "Julianne Anderson", superpower: "Storytelling, connecting with people, making people laugh", image: "/profiles/julianneanderson.jpg" },
  { id: 5, name: "Matthew Burns", superpower: "Finding parked cars and building customer journeys (monday.com consulting), AI discoverability workshops", needsHelp: "Finding more community builders to collaborate with", image: "/profiles/mattburns.jpeg" },
  { id: 6, name: "Desmond Spann", superpower: "The art of fulfillment, inner work, emotional wellbeing, poetry, freestyling, growth rap", needsHelp: "Upgrades to paid memberships", image: "/profiles/desmond.jpg" },
  { id: 7, name: "Dr. Melissa Partaka", superpower: "Helping others discover their passions and put them into action to create a life around them", needsHelp: "Automation, particularly a chat buddy for responses", image: "/profiles/drmelissa.jpg" },
  { id: 8, name: "Nick Nebelsky", superpower: "Using humor and sincerity to build relationships, being direct, witty, and observant, creating AI films", needsHelp: "Structure for ideas, sales strategy", image: "/profiles/nickneb.jpg" },
  { id: 9, name: "Tony Sibbald", superpower: "Helping people calm their mind and body, let go of anxiety and exhaustion, feel happier and more alive", needsHelp: "Believing in doing the same online as in-person", image: "/profiles/tonysibb.jpg" },
  { id: 10, name: "Theresa Elliott", superpower: "Idea generation, seeing real potential and opportunities where others see obstacles, creating routines and strategies", needsHelp: "Basic back-end web development skills", image: "/profiles/theresa.jpg" },
  { id: 11, name: "Elfina Luk", superpower: "Seeing the deeper truth to a person's being, helping them show up as their true selves with deep self love", needsHelp: "Marketing and promotion", image: "/profiles/elfina.jpeg" },
  { id: 12, name: "Rodney Thompson", superpower: "Turning messy ideas into simple, repeatable systems around planning, decision-making, and staying steady", needsHelp: "Communicating systems clearly", image: "/profiles/rodney.jpg" },
  { id: 13, name: "Jeniece Drake", superpower: "Helping people take their ideas and build out a workable roadmap to make it a reality", image: "/profiles/JenieceDrake.jpg" },
  { id: 14, name: "Elmo Anticamara", superpower: "General Virtual Assistant turning daily tasks into organized, stress-free operations", needsHelp: "Scaling systems and workflows for multiple clients", image: "/profiles/elmo.jpg" },
  { id: 15, name: "Khent Lj", superpower: "Making strengths visible and turning knowledge into actionable help", image: "/profiles/khent.jpg" },
  { id: 16, name: "Ma. Socorro Castro", superpower: "Helping clients get results with services provided", needsHelp: "Streamlining content creation and marketing", image: "/profiles/socorro.jpeg" },
  { id: 17, name: "Suzanne Bell", superpower: "Mole whacker - taking care of whatever comes up while doing other things, quick task-switching", image: "/profiles/suzannebell.jpg" },
  { id: 18, name: "Vinayak Ramesh", superpower: "Amazon KDP publishing (non-fiction), faceless YT automation channels, copywriting/email marketing", needsHelp: "Ways to monetize newsletter", image: "/profiles/vinayak.jpeg" },
  { id: 19, name: "Iris Ocariza", superpower: "Being patient", needsHelp: "Learning n8n and vibe coding", image: "/profiles/irisoca.jpg" },
  { id: 20, name: "Tim Norris", superpower: "Creativity in passion", needsHelp: "Packaging value simply so people see it", image: "/profiles/timnorris.jpeg" },
  { id: 21, name: "Sybil Hall", superpower: "Empathy and listening", needsHelp: "Getting more premium and VIP members", image: "/profiles/sybil.jpg" },
  { id: 22, name: "Adam Formanek", superpower: "Turning ideas for games into real, repeatable experiences - engineering rules, props, scoring, pacing", needsHelp: "Starting a Skool community", image: "/profiles/adamfor.jpg" },
  { id: 23, name: "Kerry Souter", superpower: "Writing comedy and storytelling", needsHelp: "Being more present as opposed to performative", image: "/profiles/kerrysouter.jpg" },
  { id: 24, name: "Dr. Peninah Wood Ph.D", superpower: "Intelligence and a quick sense of humor", needsHelp: "Getting members", image: "/profiles/drpeninah.jpg" },
  { id: 25, name: "Elizabeth Jaworski", superpower: "Self-awareness and growth mindset", needsHelp: "Working on inner critic", image: "/profiles/elizabethjaw.jpg" },
  { id: 26, name: "Liisa Reimann", superpower: "The Funnel Fixer - asking clarifying questions about marketing ecosystems, connecting the dots, steering dragon boats", needsHelp: "Business back-end strategy, financial forecasting", image: "/profiles/liisa.jpeg" },
  { id: 27, name: "Nathaniel Parant", superpower: "Articulate expression & imagination - a synthesis of Heartist, Cosmedian, and Mystic", needsHelp: "System design that organizes a team", image: "/profiles/nathaniel.jpg" },
  { id: 29, name: "Lisa Drennon", superpower: "Wealth Activator - turning money chaos into calm, strategic cash flow without restrictive budgets or shame", needsHelp: "Expanding visibility and collaborations", image: "/profiles/lisadrennon.jpg" },
  { id: 30, name: "Eric Bryan Gonzales", superpower: "Seeing beyond the obvious - the potential and opportunity in people and business along with the path to get there", needsHelp: "Starting networking and live calls", image: "/profiles/eric.jpeg" },
  { id: 31, name: "London Patton", superpower: "Building systems with ChatGPT", image: "/profiles/londonpatton.jpg" },
  { id: 32, name: "MarKesha Smith", superpower: "Human-in-the-loop reply flows that keep voice intact while speeding things up", image: "/profiles/markesha.jpeg" },
  { id: 33, name: "Jesse Niall", superpower: "Incredibly hyperfocused on AI, amazing group facilitator and counselor, public speaking, getting people into their heart to heal from trauma", needsHelp: "A roadmap to stick to, shiny object syndrome and FOMO, sticking to systems with ADHD", image: "/profiles/jessenail.jpg" },
  { id: 34, name: "Marisa Nunziato", superpower: "Helping women see the bigger picture of their health - how hormones, the endocrine system, and perimenopause/menopause are all interconnected with the body as a whole", image: "/profiles/marisa.jpg" },
  { id: 35, name: "Kim Job", superpower: "Seeing subconscious stories and patterns in minutes, helping business owners shift from the inside out", needsHelp: "Adding Skool to high ticket offers that are already working (tired of launching)", image: "/profiles/kimjob.jpeg" },
  { id: 36, name: "Riikka V", superpower: "Helping others realise their potential, feel safe and confident enough to express themselves, communicating in several languages simultaneously", needsHelp: "Finding her voice, structuring and scheduling content to be engaging", image: "/profiles/riikka.jpg" },
  { id: 37, name: "Hil Kane", superpower: "All things visual - video ideas, editing, CapCut, YouTube, TikTok, creating AI avatar videos, artistic balance, flow, and design", image: "/profiles/hilkane.jpg" },
  { id: 38, name: "Mary Nunaley", superpower: "Staying calm in a crisis and knowing the next step, making complex ideas simple (usually relating them to food), bringing fun into stressful times", needsHelp: "Understanding the structure behind AI Studio to effectively build apps", image: "/profiles/marynun.jpg" },
];

// Skill categories for organizing
const skillCategories = [
  { name: "Marketing", keywords: ["marketing", "seo", "traffic", "visibility", "promotion", "content", "funnel", "viral"], color: "#D4A853" },
  { name: "Systems", keywords: ["systems", "automation", "workflow", "operations", "organizing", "roadmap", "planning"], color: "#9EB1C7" },
  { name: "Mindset", keywords: ["mindset", "wellbeing", "fulfillment", "anxiety", "inner", "self-awareness", "empathy", "patience"], color: "#8B2332" },
  { name: "Creative", keywords: ["storytelling", "comedy", "humor", "creative", "imagination", "writing", "poetry", "films"], color: "#6B8E6B" },
  { name: "Community", keywords: ["community", "skool", "members", "connecting", "relationships", "collaboration", "networking"], color: "#9B6B9B" },
  { name: "Tech", keywords: ["ai", "chatgpt", "n8n", "coding", "web development", "automation", "tech"], color: "#5B8DBD" },
];

// Find matches between members
function findMatches(members: FamilyMember[]) {
  const matches: { helper: FamilyMember; helpee: FamilyMember; skill: string }[] = [];

  members.forEach((helper) => {
    const helperSkills = helper.superpower.toLowerCase();
    members.forEach((helpee) => {
      if (helper.id === helpee.id || !helpee.needsHelp) return;
      const needs = helpee.needsHelp.toLowerCase();

      // Check for keyword matches
      const keywords = ["marketing", "systems", "traffic", "automation", "community", "visibility", "content", "members", "sales", "strategy"];
      keywords.forEach((keyword) => {
        if (helperSkills.includes(keyword) && needs.includes(keyword)) {
          matches.push({ helper, helpee, skill: keyword });
        }
      });
    });
  });

  return matches;
}

// Get category for a member
function getMemberCategory(member: FamilyMember): typeof skillCategories[0] {
  const text = (member.superpower + " " + (member.needsHelp || "")).toLowerCase();
  for (const cat of skillCategories) {
    if (cat.keywords.some((k) => text.includes(k))) return cat;
  }
  return skillCategories[0];
}

// ============================================
// VISUALIZATION 1: Power Match Cards
// ============================================
function PowerMatchCards({ members }: { members: FamilyMember[] }) {
  const matches = useMemo(() => findMatches(members), [members]);
  const [selectedMember, setSelectedMember] = useState<FamilyMember | null>(null);

  const memberMatches = useMemo(() => {
    if (!selectedMember) return { canHelp: [], needsFrom: [] };
    return {
      canHelp: matches.filter((m) => m.helper.id === selectedMember.id),
      needsFrom: matches.filter((m) => m.helpee.id === selectedMember.id),
    };
  }, [selectedMember, matches]);

  return (
    <div className="min-h-full flex flex-col">
      <div className="text-center mb-8">
        <h2 className="font-serif text-3xl mb-2">Power Match Cards</h2>
        <p className="text-[#FAF6E3]/60 font-sans">Click a member to see their connections</p>
      </div>

      <div className="flex-1 overflow-visible pb-8">
        <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3 mb-8 pt-4 px-2">
          {members.map((member) => {
            const category = getMemberCategory(member);
            const isSelected = selectedMember?.id === member.id;
            const initials = member.name.split(" ").map((n) => n[0]).join("");

            return (
              <motion.button
                key={member.id}
                onClick={() => setSelectedMember(isSelected ? null : member)}
                className={`relative p-3 rounded-xl border transition-all cursor-pointer ${
                  isSelected
                    ? "border-[#D4A853] bg-[#D4A853]/20 scale-110 z-10"
                    : "border-[#FAF6E3]/20 bg-[#0A0A0A]/50 hover:border-[#FAF6E3]/40"
                }`}
                whileHover={{ scale: isSelected ? 1.1 : 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <div
                  className="w-12 h-12 mx-auto rounded-full flex items-center justify-center mb-2 overflow-hidden"
                  style={{ backgroundColor: category.color + "40", borderColor: category.color, borderWidth: 2 }}
                >
                  {member.image ? (
                    <Image src={member.image} alt={member.name} width={48} height={48} className="w-full h-full object-cover" />
                  ) : (
                    <span className="font-serif text-sm font-bold text-white">{initials}</span>
                  )}
                </div>
                <p className="font-sans text-xs text-center text-white/80 truncate">{member.name.split(" ")[0]}</p>
                {isSelected && (
                  <motion.div
                    className="absolute -top-1 -right-1 w-4 h-4 bg-[#D4A853] rounded-full flex items-center justify-center"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                  >
                    <Zap className="w-2.5 h-2.5 text-[#0A0A0A]" />
                  </motion.div>
                )}
              </motion.button>
            );
          })}
        </div>

        <AnimatePresence>
          {selectedMember && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="bg-[#0A0A0A]/80 backdrop-blur-md border border-[#FAF6E3]/20 rounded-2xl p-6"
            >
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h3 className="font-serif text-2xl text-white">{selectedMember.name}</h3>
                  <p className="text-[#D4A853] font-sans text-sm mt-1">{selectedMember.superpower}</p>
                </div>
                <button onClick={() => setSelectedMember(null)} className="text-[#FAF6E3]/50 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-sans text-sm uppercase tracking-wider text-[#6B8E6B] mb-3 flex items-center gap-2">
                    <ChevronRight className="w-4 h-4" /> Can Help
                  </h4>
                  {memberMatches.canHelp.length > 0 ? (
                    <div className="space-y-2">
                      {memberMatches.canHelp.map((match, i) => (
                        <div key={i} className="flex items-center gap-3 p-3 bg-[#6B8E6B]/10 rounded-lg border border-[#6B8E6B]/30">
                          <div className="w-8 h-8 min-w-[32px] min-h-[32px] rounded-full bg-[#6B8E6B]/30 flex items-center justify-center overflow-hidden flex-shrink-0">
                            {match.helpee.image ? (
                              <Image src={match.helpee.image} alt={match.helpee.name} width={32} height={32} className="w-full h-full object-cover" />
                            ) : (
                              <span className="font-serif text-xs">{match.helpee.name.split(" ").map((n) => n[0]).join("")}</span>
                            )}
                          </div>
                          <div>
                            <p className="font-sans text-sm text-white">{match.helpee.name}</p>
                            <p className="font-sans text-xs text-[#FAF6E3]/50">with {match.skill}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-3 bg-[#6B8E6B]/10 rounded-lg border border-[#6B8E6B]/20">
                      <p className="font-sans text-sm text-[#FAF6E3]/70">
                        {selectedMember.name.split(" ")[0]} can help people who need <span className="text-[#6B8E6B]">{selectedMember.superpower.toLowerCase()}</span>
                      </p>
                    </div>
                  )}
                </div>

                <div>
                  <h4 className="font-sans text-sm uppercase tracking-wider text-[#9B6B9B] mb-3 flex items-center gap-2">
                    <ChevronRight className="w-4 h-4" /> Can Get Help From
                  </h4>
                  {memberMatches.needsFrom.length > 0 ? (
                    <div className="space-y-2">
                      {memberMatches.needsFrom.map((match, i) => (
                        <div key={i} className="flex items-center gap-3 p-3 bg-[#9B6B9B]/10 rounded-lg border border-[#9B6B9B]/30">
                          <div className="w-8 h-8 min-w-[32px] min-h-[32px] rounded-full bg-[#9B6B9B]/30 flex items-center justify-center overflow-hidden flex-shrink-0">
                            {match.helper.image ? (
                              <Image src={match.helper.image} alt={match.helper.name} width={32} height={32} className="w-full h-full object-cover" />
                            ) : (
                              <span className="font-serif text-xs">{match.helper.name.split(" ").map((n) => n[0]).join("")}</span>
                            )}
                          </div>
                          <div>
                            <p className="font-sans text-sm text-white">{match.helper.name}</p>
                            <p className="font-sans text-xs text-[#FAF6E3]/50">with {match.skill}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-3 bg-[#9B6B9B]/10 rounded-lg border border-[#9B6B9B]/20">
                      <p className="font-sans text-sm text-[#FAF6E3]/70">
                        {selectedMember.needsHelp ? (
                          <>{selectedMember.name.split(" ")[0]} is looking for help with <span className="text-[#9B6B9B]">{selectedMember.needsHelp.toLowerCase()}</span></>
                        ) : (
                          <>{selectedMember.name.split(" ")[0]} is open to connecting with the community</>
                        )}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// ============================================
// VISUALIZATION 2: Network Graph (Revamped)
// ============================================
function NetworkGraph({ members }: { members: FamilyMember[] }) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [hoveredNode, setHoveredNode] = useState<FamilyMember | null>(null);
  const [selectedNode, setSelectedNode] = useState<FamilyMember | null>(null);
  const matches = useMemo(() => findMatches(members), [members]);

  useEffect(() => {
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const width = svgRef.current.clientWidth;
    const height = svgRef.current.clientHeight;
    const nodeRadius = 28;
    const padding = 50;

    // Create nodes and links
    const nodes = members.map((m) => ({ ...m, category: getMemberCategory(m) }));
    const links = matches.map((m) => ({
      source: m.helper.id,
      target: m.helpee.id,
      skill: m.skill,
    }));

    // Create defs for clip paths and image patterns
    const defs = svg.append("defs");

    // Add glow filter
    const filter = defs.append("filter").attr("id", "glow").attr("x", "-50%").attr("y", "-50%").attr("width", "200%").attr("height", "200%");
    filter.append("feGaussianBlur").attr("stdDeviation", "4").attr("result", "coloredBlur");
    const feMerge = filter.append("feMerge");
    feMerge.append("feMergeNode").attr("in", "coloredBlur");
    feMerge.append("feMergeNode").attr("in", "SourceGraphic");

    // Create clip paths and patterns for each member with image
    nodes.forEach((member) => {
      // Clip path for circular image
      defs.append("clipPath")
        .attr("id", `clip-${member.id}`)
        .append("circle")
        .attr("r", nodeRadius - 2)
        .attr("cx", 0)
        .attr("cy", 0);

      // Image pattern if member has image
      if (member.image) {
        defs.append("pattern")
          .attr("id", `img-${member.id}`)
          .attr("width", 1)
          .attr("height", 1)
          .attr("patternContentUnits", "objectBoundingBox")
          .append("image")
          .attr("href", member.image)
          .attr("width", 1)
          .attr("height", 1)
          .attr("preserveAspectRatio", "xMidYMid slice");
      }
    });

    // Create force simulation with bounded positions
    const simulation = d3
      .forceSimulation(nodes as d3.SimulationNodeDatum[])
      .force("link", d3.forceLink(links).id((d: unknown) => (d as FamilyMember).id).distance(100).strength(0.3))
      .force("charge", d3.forceManyBody().strength(-150))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force("collision", d3.forceCollide().radius(nodeRadius + 8))
      .force("x", d3.forceX(width / 2).strength(0.05))
      .force("y", d3.forceY(height / 2).strength(0.05))
      .alphaDecay(0.02)
      .velocityDecay(0.4);

    // Draw links
    const link = svg
      .append("g")
      .selectAll("line")
      .data(links)
      .join("line")
      .attr("stroke", "#D4A853")
      .attr("stroke-opacity", 0.4)
      .attr("stroke-width", 2);

    // Draw nodes
    const node = svg
      .append("g")
      .selectAll("g")
      .data(nodes)
      .join("g")
      .attr("cursor", "pointer");

    // Add drag behavior
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (node as any).call(
      d3.drag()
        .on("start", (event: d3.D3DragEvent<SVGGElement, unknown, unknown>, d: unknown) => {
          if (!event.active) simulation.alphaTarget(0.3).restart();
          const datum = d as d3.SimulationNodeDatum;
          datum.fx = datum.x;
          datum.fy = datum.y;
        })
        .on("drag", (event: d3.D3DragEvent<SVGGElement, unknown, unknown>, d: unknown) => {
          const datum = d as d3.SimulationNodeDatum;
          datum.fx = Math.max(padding, Math.min(width - padding, event.x));
          datum.fy = Math.max(padding, Math.min(height - padding, event.y));
        })
        .on("end", (event: d3.D3DragEvent<SVGGElement, unknown, unknown>, d: unknown) => {
          if (!event.active) simulation.alphaTarget(0);
          const datum = d as d3.SimulationNodeDatum;
          datum.fx = null;
          datum.fy = null;
        })
    );

    // Background circle with category color
    node
      .append("circle")
      .attr("r", nodeRadius)
      .attr("fill", (d) => d.category.color + "60")
      .attr("stroke", (d) => d.category.color)
      .attr("stroke-width", 3)
      .attr("filter", "url(#glow)");

    // Add profile image or initials
    node.each(function(d) {
      const g = d3.select(this);
      if (d.image) {
        // Profile image
        g.append("circle")
          .attr("r", nodeRadius - 3)
          .attr("fill", `url(#img-${d.id})`)
          .attr("stroke", "none");
      } else {
        // Initials fallback
        g.append("text")
          .text(d.name.split(" ").map((n: string) => n[0]).join(""))
          .attr("text-anchor", "middle")
          .attr("dy", "0.35em")
          .attr("fill", "#FAF6E3")
          .attr("font-family", "Cormorant Garamond, serif")
          .attr("font-size", "14px")
          .attr("font-weight", "bold");
      }
    });

    // Hover and click events
    node
      .on("mouseenter", (_, d) => setHoveredNode(d))
      .on("mouseleave", () => setHoveredNode(null))
      .on("click", (_, d) => setSelectedNode(selectedNode?.id === d.id ? null : d));

    // Update positions with boundary constraints
    simulation.on("tick", () => {
      // Keep nodes within bounds
      nodes.forEach((d) => {
        const datum = d as d3.SimulationNodeDatum;
        datum.x = Math.max(padding, Math.min(width - padding, datum.x ?? width / 2));
        datum.y = Math.max(padding, Math.min(height - padding, datum.y ?? height / 2));
      });

      link
        .attr("x1", (d) => (d.source as d3.SimulationNodeDatum).x ?? 0)
        .attr("y1", (d) => (d.source as d3.SimulationNodeDatum).y ?? 0)
        .attr("x2", (d) => (d.target as d3.SimulationNodeDatum).x ?? 0)
        .attr("y2", (d) => (d.target as d3.SimulationNodeDatum).y ?? 0);

      node.attr("transform", (d) => `translate(${(d as d3.SimulationNodeDatum).x},${(d as d3.SimulationNodeDatum).y})`);
    });

    return () => { simulation.stop(); };
  }, [members, matches, selectedNode]);

  const displayedMember = selectedNode || hoveredNode;

  return (
    <div className="h-full flex flex-col">
      <div className="text-center mb-4">
        <h2 className="font-serif text-3xl mb-2">Network Graph</h2>
        <p className="text-[#FAF6E3]/60 font-sans">Hover or click members to see details. Drag to rearrange.</p>
      </div>

      <div className="flex-1 relative">
        <svg ref={svgRef} className="w-full h-full" />

        <AnimatePresence>
          {displayedMember && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="absolute top-4 right-4 bg-[#0A0A0A]/90 backdrop-blur-md border border-[#FAF6E3]/20 rounded-xl p-4 max-w-xs"
            >
              <div className="flex items-center gap-3 mb-2">
                {displayedMember.image && (
                  <div className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0">
                    <img src={displayedMember.image} alt={displayedMember.name} className="w-full h-full object-cover" />
                  </div>
                )}
                <h3 className="font-serif text-lg text-white">{displayedMember.name}</h3>
              </div>
              <p className="text-[#D4A853] font-sans text-xs mt-1">{displayedMember.superpower}</p>
              {displayedMember.needsHelp && (
                <p className="text-[#FAF6E3]/50 font-sans text-xs mt-2">
                  <span className="text-[#9EB1C7]">Needs:</span> {displayedMember.needsHelp}
                </p>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap justify-center gap-4 mt-4">
        {skillCategories.map((cat) => (
          <div key={cat.name} className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: cat.color }} />
            <span className="font-sans text-xs text-[#FAF6E3]/60">{cat.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================
// VISUALIZATION 3: Constellation Map
// ============================================
function ConstellationMap({ members }: { members: FamilyMember[] }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hoveredStar, setHoveredStar] = useState<{ member: FamilyMember; x: number; y: number } | null>(null);
  const starsRef = useRef<{ member: FamilyMember; x: number; y: number; size: number; twinkle: number }[]>([]);
  const [selectedSkill, setSelectedSkill] = useState<typeof skillCategories[0] | null>(null);
  const matches = useMemo(() => findMatches(members), [members]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      canvas.width = canvas.clientWidth * 2;
      canvas.height = canvas.clientHeight * 2;
      ctx.scale(2, 2);
    };
    resize();
    window.addEventListener("resize", resize);

    // Initialize stars
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    const padding = 60;

    starsRef.current = members.map((member, i) => {
      const angle = (i / members.length) * Math.PI * 2;
      const radius = Math.min(width, height) / 2 - padding - Math.random() * 50;
      return {
        member,
        x: width / 2 + Math.cos(angle) * radius * (0.6 + Math.random() * 0.4),
        y: height / 2 + Math.sin(angle) * radius * (0.6 + Math.random() * 0.4),
        size: 3 + Math.random() * 3,
        twinkle: Math.random() * Math.PI * 2,
      };
    });

    let animationId: number;
    const animate = () => {
      ctx.clearRect(0, 0, width, height);

      // Draw background stars
      for (let i = 0; i < 100; i++) {
        const x = (Math.sin(i * 123.456) * 0.5 + 0.5) * width;
        const y = (Math.cos(i * 789.012) * 0.5 + 0.5) * height;
        const size = Math.random() * 1.5;
        ctx.fillStyle = `rgba(250, 246, 227, ${0.1 + Math.random() * 0.2})`;
        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fill();
      }

      // Draw constellation lines
      ctx.strokeStyle = "rgba(212, 168, 83, 0.15)";
      ctx.lineWidth = 1;
      matches.forEach((match) => {
        const from = starsRef.current.find((s) => s.member.id === match.helper.id);
        const to = starsRef.current.find((s) => s.member.id === match.helpee.id);
        if (from && to) {
          ctx.beginPath();
          ctx.moveTo(from.x, from.y);
          ctx.lineTo(to.x, to.y);
          ctx.stroke();
        }
      });

      // Draw stars
      const time = Date.now() / 1000;
      starsRef.current.forEach((star) => {
        const category = getMemberCategory(star.member);
        const twinkleSize = star.size + Math.sin(time * 2 + star.twinkle) * 1;

        // Check if this star matches the selected skill filter
        const isHighlighted = selectedSkill ? selectedSkill.keywords.some((k) =>
          (star.member.superpower + " " + (star.member.needsHelp || "")).toLowerCase().includes(k)
        ) : true;

        // Glow
        const gradient = ctx.createRadialGradient(star.x, star.y, 0, star.x, star.y, twinkleSize * 4);
        gradient.addColorStop(0, (isHighlighted ? category.color : "#444444") + "60");
        gradient.addColorStop(1, "transparent");
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(star.x, star.y, twinkleSize * 4, 0, Math.PI * 2);
        ctx.fill();

        // Core
        ctx.fillStyle = isHighlighted ? "#FAF6E3" : "#666";
        ctx.beginPath();
        ctx.arc(star.x, star.y, isHighlighted ? twinkleSize : twinkleSize * 0.7, 0, Math.PI * 2);
        ctx.fill();
      });

      animationId = requestAnimationFrame(animate);
    };
    animate();

    // Mouse interaction
    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const found = starsRef.current.find((star) => {
        const dx = star.x - x;
        const dy = star.y - y;
        return Math.sqrt(dx * dx + dy * dy) < 20;
      });

      setHoveredStar(found ? { member: found.member, x: found.x, y: found.y } : null);
    };

    canvas.addEventListener("mousemove", handleMouseMove);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("resize", resize);
      canvas.removeEventListener("mousemove", handleMouseMove);
    };
  }, [members, matches, selectedSkill]);

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="text-center py-4">
        <h2 className="font-serif text-3xl mb-2">Constellation Map</h2>
        <p className="text-[#FAF6E3]/60 font-sans mb-3">Hover over stars to reveal members</p>

        {/* Skill filter tabs - all in one line */}
        <div className="flex justify-center gap-2 flex-wrap">
          <button
            onClick={() => setSelectedSkill(null)}
            className={`px-3 py-1.5 rounded-full font-sans text-xs transition-all ${
              !selectedSkill
                ? "bg-[#D4A853] text-[#0A0A0A] font-semibold"
                : "bg-[#0A0A0A]/50 text-[#FAF6E3]/70 hover:text-[#FAF6E3] border border-[#FAF6E3]/20"
            }`}
          >
            All
          </button>
          {skillCategories.map((skill) => (
            <button
              key={skill.name}
              onClick={() => setSelectedSkill(selectedSkill?.name === skill.name ? null : skill)}
              className={`px-3 py-1.5 rounded-full font-sans text-xs transition-all ${
                selectedSkill?.name === skill.name
                  ? "text-[#0A0A0A] font-semibold"
                  : "bg-[#0A0A0A]/50 text-[#FAF6E3]/70 hover:text-[#FAF6E3] border border-[#FAF6E3]/20"
              }`}
              style={{
                backgroundColor: selectedSkill?.name === skill.name ? skill.color : undefined,
              }}
            >
              {skill.name}
            </button>
          ))}
        </div>
      </div>

      {/* Canvas container - takes remaining space */}
      <div className="flex-1 relative min-h-[500px]">
        <canvas ref={canvasRef} className="absolute inset-0 w-full h-full cursor-crosshair" />

        <AnimatePresence>
          {hoveredStar && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="absolute bg-[#0A0A0A]/90 backdrop-blur-md border border-[#D4A853]/50 rounded-xl p-4 pointer-events-none z-20"
              style={{ left: hoveredStar.x + 20, top: hoveredStar.y - 20, maxWidth: 250 }}
            >
              {hoveredStar.member.image && (
                <div className="w-12 h-12 rounded-full overflow-hidden mb-2 border-2 border-[#D4A853]">
                  <Image src={hoveredStar.member.image} alt={hoveredStar.member.name} width={48} height={48} className="w-full h-full object-cover" />
                </div>
              )}
              <h3 className="font-serif text-lg text-white">{hoveredStar.member.name}</h3>
              <p className="text-[#D4A853] font-sans text-xs mt-1 line-clamp-2">{hoveredStar.member.superpower}</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// ============================================
// VISUALIZATION 4: Skill Orbit
// ============================================
function SkillOrbit({ members }: { members: FamilyMember[] }) {
  const [selectedCategory, setSelectedCategory] = useState<typeof skillCategories[0] | null>(null);
  const [hoveredMember, setHoveredMember] = useState<FamilyMember | null>(null);

  const membersByCategory = useMemo(() => {
    const result: Record<string, { offers: FamilyMember[]; needs: FamilyMember[] }> = {};
    skillCategories.forEach((cat) => {
      result[cat.name] = { offers: [], needs: [] };
      members.forEach((m) => {
        const superpowerMatch = cat.keywords.some((k) => m.superpower.toLowerCase().includes(k));
        const needsMatch = m.needsHelp && cat.keywords.some((k) => m.needsHelp!.toLowerCase().includes(k));
        if (superpowerMatch) result[cat.name].offers.push(m);
        if (needsMatch) result[cat.name].needs.push(m);
      });
    });
    return result;
  }, [members]);

  return (
    <div className="h-full flex flex-col">
      <div className="text-center mb-6">
        <h2 className="font-serif text-3xl mb-2">Skill Orbit</h2>
        <p className="text-[#FAF6E3]/60 font-sans">Click a skill to see who offers vs needs it</p>
      </div>

      <div className="flex-1 flex items-center justify-center">
        <div className="relative w-[500px] h-[500px]">
          {/* Center */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 rounded-full bg-[#D4A853]/20 border-2 border-[#D4A853] flex items-center justify-center z-10 overflow-hidden">
            <Image src="/favico.png" alt="Recess" width={80} height={80} className="object-contain" />
          </div>

          {/* Skill planets */}
          {skillCategories.map((cat, i) => {
            const angle = (i / skillCategories.length) * Math.PI * 2 - Math.PI / 2;
            const radius = 180;
            const x = Math.cos(angle) * radius;
            const y = Math.sin(angle) * radius;
            const isSelected = selectedCategory?.name === cat.name;

            return (
              <motion.button
                key={cat.name}
                className={`absolute w-20 h-20 rounded-full flex items-center justify-center transition-all ${
                  isSelected ? "scale-125 z-20" : "hover:scale-110"
                }`}
                style={{
                  left: `calc(50% + ${x}px - 40px)`,
                  top: `calc(50% + ${y}px - 40px)`,
                  backgroundColor: cat.color + (isSelected ? "60" : "30"),
                  borderColor: cat.color,
                  borderWidth: 2,
                  boxShadow: isSelected ? `0 0 30px ${cat.color}60` : "none",
                }}
                onClick={() => setSelectedCategory(isSelected ? null : cat)}
                whileTap={{ scale: 0.95 }}
              >
                <span className="font-sans text-xs font-semibold text-white text-center">{cat.name}</span>
              </motion.button>
            );
          })}

          {/* Orbiting members */}
          <AnimatePresence>
            {selectedCategory && (
              <>
                {/* Inner orbit - Offers */}
                {membersByCategory[selectedCategory.name].offers.map((member, i, arr) => {
                  const angle = (i / arr.length) * Math.PI * 2;
                  const radius = 100;
                  const x = Math.cos(angle) * radius;
                  const y = Math.sin(angle) * radius;
                  const initials = member.name.split(" ").map((n) => n[0]).join("");

                  return (
                    <motion.div
                      key={`offer-${member.id}`}
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="absolute w-10 h-10 rounded-full flex items-center justify-center cursor-pointer overflow-hidden"
                      style={{
                        left: `calc(50% + ${x}px - 20px)`,
                        top: `calc(50% + ${y}px - 20px)`,
                        backgroundColor: "#6B8E6B40",
                        border: "2px solid #6B8E6B",
                      }}
                      onMouseEnter={() => setHoveredMember(member)}
                      onMouseLeave={() => setHoveredMember(null)}
                    >
                      {member.image ? (
                        <Image src={member.image} alt={member.name} width={40} height={40} className="w-full h-full object-cover" />
                      ) : (
                        <span className="font-serif text-[10px] text-white">{initials}</span>
                      )}
                    </motion.div>
                  );
                })}

                {/* Outer orbit - Needs */}
                {membersByCategory[selectedCategory.name].needs.map((member, i, arr) => {
                  const angle = (i / arr.length) * Math.PI * 2 + 0.3;
                  const radius = 230;
                  const x = Math.cos(angle) * radius;
                  const y = Math.sin(angle) * radius;
                  const initials = member.name.split(" ").map((n) => n[0]).join("");

                  return (
                    <motion.div
                      key={`need-${member.id}`}
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="absolute w-10 h-10 rounded-full flex items-center justify-center cursor-pointer overflow-hidden"
                      style={{
                        left: `calc(50% + ${x}px - 20px)`,
                        top: `calc(50% + ${y}px - 20px)`,
                        backgroundColor: "#9B6B9B40",
                        border: "2px solid #9B6B9B",
                      }}
                      onMouseEnter={() => setHoveredMember(member)}
                      onMouseLeave={() => setHoveredMember(null)}
                    >
                      {member.image ? (
                        <Image src={member.image} alt={member.name} width={40} height={40} className="w-full h-full object-cover" />
                      ) : (
                        <span className="font-serif text-[10px] text-white">{initials}</span>
                      )}
                    </motion.div>
                  );
                })}
              </>
            )}
          </AnimatePresence>
        </div>

        {/* Hover card */}
        <AnimatePresence>
          {hoveredMember && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0 }}
              className="absolute right-8 top-1/2 -translate-y-1/2 bg-[#0A0A0A]/90 backdrop-blur-md border border-[#FAF6E3]/20 rounded-xl p-4 max-w-xs"
            >
              <h3 className="font-serif text-lg text-white">{hoveredMember.name}</h3>
              <p className="text-[#D4A853] font-sans text-xs mt-1">{hoveredMember.superpower}</p>
              {hoveredMember.needsHelp && (
                <p className="text-[#FAF6E3]/50 font-sans text-xs mt-2">
                  <span className="text-[#9EB1C7]">Needs:</span> {hoveredMember.needsHelp}
                </p>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Legend */}
      {selectedCategory && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex justify-center gap-8 mt-4"
        >
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-[#6B8E6B]" />
            <span className="font-sans text-sm text-[#FAF6E3]/60">Offers this skill</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-[#9B6B9B]" />
            <span className="font-sans text-sm text-[#FAF6E3]/60">Needs this skill</span>
          </div>
        </motion.div>
      )}
    </div>
  );
}

// ============================================
// VISUALIZATION 5: Match Finder
// ============================================
function MatchFinder({ members }: { members: FamilyMember[] }) {
  const [offerFilter, setOfferFilter] = useState("");
  const [needFilter, setNeedFilter] = useState("");
  const [selectedMember, setSelectedMember] = useState<FamilyMember | null>(null);

  const filteredMembers = useMemo(() => {
    return members.filter((m) => {
      const matchesOffer = !offerFilter || m.superpower.toLowerCase().includes(offerFilter.toLowerCase());
      const matchesNeed = !needFilter || (m.needsHelp && m.needsHelp.toLowerCase().includes(needFilter.toLowerCase()));
      return matchesOffer && matchesNeed;
    });
  }, [members, offerFilter, needFilter]);

  const suggestions = useMemo(() => {
    const offers = new Set<string>();
    const needs = new Set<string>();
    skillCategories.forEach((cat) => {
      cat.keywords.forEach((k) => {
        offers.add(k);
        needs.add(k);
      });
    });
    return { offers: Array.from(offers), needs: Array.from(needs) };
  }, []);

  return (
    <div className="h-full flex flex-col">
      <div className="text-center mb-8">
        <h2 className="font-serif text-3xl mb-2">Match Finder</h2>
        <p className="text-[#FAF6E3]/60 font-sans">Filter by skills offered and needed</p>
      </div>

      {/* Filters */}
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <div>
          <label className="font-sans text-sm text-[#6B8E6B] uppercase tracking-wider mb-2 block">
            I can help with...
          </label>
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#FAF6E3]/40" />
            <input
              type="text"
              value={offerFilter}
              onChange={(e) => setOfferFilter(e.target.value)}
              placeholder="e.g., marketing, systems..."
              className="w-full pl-10 pr-4 py-3 rounded-xl bg-[#6B8E6B]/10 border border-[#6B8E6B]/30 text-white placeholder-[#FAF6E3]/30 font-sans focus:outline-none focus:border-[#6B8E6B]"
            />
          </div>
          <div className="flex flex-wrap gap-2 mt-2">
            {suggestions.offers.slice(0, 6).map((s) => (
              <button
                key={s}
                onClick={() => setOfferFilter(s)}
                className={`px-3 py-1 rounded-full text-xs font-sans transition-all ${
                  offerFilter === s
                    ? "bg-[#6B8E6B] text-white"
                    : "bg-[#6B8E6B]/20 text-[#FAF6E3]/60 hover:bg-[#6B8E6B]/40"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="font-sans text-sm text-[#9B6B9B] uppercase tracking-wider mb-2 block">
            I need help with...
          </label>
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#FAF6E3]/40" />
            <input
              type="text"
              value={needFilter}
              onChange={(e) => setNeedFilter(e.target.value)}
              placeholder="e.g., traffic, automation..."
              className="w-full pl-10 pr-4 py-3 rounded-xl bg-[#9B6B9B]/10 border border-[#9B6B9B]/30 text-white placeholder-[#FAF6E3]/30 font-sans focus:outline-none focus:border-[#9B6B9B]"
            />
          </div>
          <div className="flex flex-wrap gap-2 mt-2">
            {suggestions.needs.slice(0, 6).map((s) => (
              <button
                key={s}
                onClick={() => setNeedFilter(s)}
                className={`px-3 py-1 rounded-full text-xs font-sans transition-all ${
                  needFilter === s
                    ? "bg-[#9B6B9B] text-white"
                    : "bg-[#9B6B9B]/20 text-[#FAF6E3]/60 hover:bg-[#9B6B9B]/40"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="flex-1 overflow-auto">
        <div className="flex items-center justify-between mb-4">
          <span className="font-sans text-sm text-[#FAF6E3]/50">
            {filteredMembers.length} member{filteredMembers.length !== 1 ? "s" : ""} found
          </span>
          {(offerFilter || needFilter) && (
            <button
              onClick={() => {
                setOfferFilter("");
                setNeedFilter("");
              }}
              className="font-sans text-sm text-[#D4A853] hover:underline"
            >
              Clear filters
            </button>
          )}
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredMembers.map((member) => {
            const category = getMemberCategory(member);
            return (
              <motion.div
                key={member.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                onClick={() => setSelectedMember(member)}
                className="p-4 bg-[#0A0A0A]/60 backdrop-blur-sm border border-[#FAF6E3]/20 rounded-xl hover:border-[#D4A853]/50 transition-all cursor-pointer"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center overflow-hidden"
                    style={{ backgroundColor: category.color + "40", border: `2px solid ${category.color}` }}
                  >
                    {member.image ? (
                      <Image src={member.image} alt={member.name} width={40} height={40} className="w-full h-full object-cover" />
                    ) : (
                      <span className="font-serif text-sm text-white">
                        {member.name.split(" ").map((n) => n[0]).join("")}
                      </span>
                    )}
                  </div>
                  <div>
                    <h3 className="font-serif text-white">{member.name}</h3>
                    <span className="font-sans text-xs text-[#FAF6E3]/40">{category.name}</span>
                  </div>
                </div>
                <p className="font-sans text-xs text-[#D4A853] line-clamp-2">{member.superpower}</p>
                {member.needsHelp && (
                  <p className="font-sans text-xs text-[#FAF6E3]/50 mt-2 line-clamp-1">
                    <span className="text-[#9EB1C7]">Needs:</span> {member.needsHelp}
                  </p>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Expanded member modal */}
      <AnimatePresence>
        {selectedMember && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-6"
            onClick={() => setSelectedMember(null)}
          >
            {/* Backdrop */}
            <div className="absolute inset-0 bg-[#0A0A0A]/80 backdrop-blur-sm" />

            {/* Modal content */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="relative bg-[#0A0A0A]/95 border border-[#FAF6E3]/20 rounded-2xl p-8 max-w-lg w-full max-h-[80vh] overflow-auto"
            >
              {/* Close button */}
              <button
                onClick={() => setSelectedMember(null)}
                className="absolute top-4 right-4 text-[#FAF6E3]/50 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>

              {/* Member content */}
              <div className="flex flex-col items-center text-center mb-6">
                {selectedMember.image ? (
                  <div
                    className="w-24 h-24 rounded-full overflow-hidden mb-4"
                    style={{ border: `3px solid ${getMemberCategory(selectedMember).color}` }}
                  >
                    <Image src={selectedMember.image} alt={selectedMember.name} width={96} height={96} className="w-full h-full object-cover" />
                  </div>
                ) : (
                  <div
                    className="w-24 h-24 rounded-full flex items-center justify-center mb-4"
                    style={{ backgroundColor: getMemberCategory(selectedMember).color + "40", border: `3px solid ${getMemberCategory(selectedMember).color}` }}
                  >
                    <span className="font-serif text-2xl text-white">
                      {selectedMember.name.split(" ").map((n) => n[0]).join("")}
                    </span>
                  </div>
                )}
                <h2 className="font-serif text-2xl text-white mb-1">{selectedMember.name}</h2>
                <span
                  className="px-3 py-1 rounded-full text-xs font-sans"
                  style={{ backgroundColor: getMemberCategory(selectedMember).color + "30", color: getMemberCategory(selectedMember).color }}
                >
                  {getMemberCategory(selectedMember).name}
                </span>
              </div>

              {/* Superpower */}
              <div className="mb-6">
                <h3 className="font-sans text-sm uppercase tracking-wider text-[#D4A853] mb-2">Superpower</h3>
                <p className="font-sans text-[#FAF6E3]/80">{selectedMember.superpower}</p>
              </div>

              {/* Needs help with */}
              {selectedMember.needsHelp && (
                <div>
                  <h3 className="font-sans text-sm uppercase tracking-wider text-[#9EB1C7] mb-2">Needs Help With</h3>
                  <p className="font-sans text-[#FAF6E3]/80">{selectedMember.needsHelp}</p>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ============================================
// VISUALIZATION 6: Chord Diagram
// ============================================
function ChordDiagram({ members }: { members: FamilyMember[] }) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [hoveredArc, setHoveredArc] = useState<{ member: FamilyMember; connections: number } | null>(null);

  useEffect(() => {
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const width = svgRef.current.clientWidth;
    const height = svgRef.current.clientHeight;
    const outerRadius = Math.min(width, height) / 2 - 60;
    const innerRadius = outerRadius - 20;

    const g = svg.append("g").attr("transform", `translate(${width / 2},${height / 2})`);

    // Create matrix for chord diagram
    const matrix: number[][] = [];
    const matches = findMatches(members);

    members.forEach((_, i) => {
      matrix[i] = [];
      members.forEach((_, j) => {
        const connection = matches.filter(
          (m) => (m.helper.id === members[i].id && m.helpee.id === members[j].id) ||
                 (m.helper.id === members[j].id && m.helpee.id === members[i].id)
        ).length;
        matrix[i][j] = connection;
      });
    });

    // Create chord layout
    const chord = d3.chord().padAngle(0.05).sortSubgroups(d3.descending);
    const chords = chord(matrix);

    // Create arc generator
    const arc = d3.arc<d3.ChordGroup>().innerRadius(innerRadius).outerRadius(outerRadius);

    // Create ribbon generator
    const ribbon = d3.ribbon<d3.Chord, d3.ChordSubgroup>().radius(innerRadius);

    // Add glow filter
    const defs = svg.append("defs");
    const filter = defs.append("filter").attr("id", "chord-glow");
    filter.append("feGaussianBlur").attr("stdDeviation", "2").attr("result", "coloredBlur");
    const feMerge = filter.append("feMerge");
    feMerge.append("feMergeNode").attr("in", "coloredBlur");
    feMerge.append("feMergeNode").attr("in", "SourceGraphic");

    // Draw arcs
    const arcs = g
      .append("g")
      .selectAll("path")
      .data(chords.groups)
      .join("path")
      .attr("d", arc)
      .attr("fill", (d) => getMemberCategory(members[d.index]).color)
      .attr("stroke", "#FAF6E3")
      .attr("stroke-width", 0.5)
      .attr("filter", "url(#chord-glow)")
      .attr("cursor", "pointer")
      .on("mouseenter", (_, d) => {
        const connections = matrix[d.index].reduce((a, b) => a + b, 0);
        setHoveredArc({ member: members[d.index], connections });
      })
      .on("mouseleave", () => setHoveredArc(null));

    // Draw ribbons
    g.append("g")
      .attr("fill-opacity", 0.5)
      .selectAll("path")
      .data(chords)
      .join("path")
      .attr("d", ribbon)
      .attr("fill", (d) => getMemberCategory(members[d.source.index]).color)
      .attr("stroke", "none");

    // Add labels
    g.append("g")
      .selectAll("text")
      .data(chords.groups)
      .join("text")
      .each((d: d3.ChordGroup & { angle?: number }) => {
        d.angle = (d.startAngle + d.endAngle) / 2;
      })
      .attr("dy", "0.35em")
      .attr("transform", (d: d3.ChordGroup & { angle?: number }) => {
        const angle = d.angle ?? 0;
        return `
          rotate(${(angle * 180) / Math.PI - 90})
          translate(${outerRadius + 10})
          ${angle > Math.PI ? "rotate(180)" : ""}
        `;
      })
      .attr("text-anchor", (d: d3.ChordGroup & { angle?: number }) => ((d.angle ?? 0) > Math.PI ? "end" : null))
      .text((d) => members[d.index].name.split(" ")[0])
      .attr("fill", "#FAF6E3")
      .attr("font-family", "Space Grotesk, sans-serif")
      .attr("font-size", "10px");

    // Hover effect
    arcs
      .on("mouseenter", function (event, d) {
        arcs.attr("opacity", (o) => (o.index === d.index ? 1 : 0.3));
        g.selectAll("path")
          .filter((o: unknown) => {
            const chord = o as d3.Chord;
            return chord.source && (chord.source.index === d.index || chord.target.index === d.index);
          })
          .attr("fill-opacity", 0.8);
      })
      .on("mouseleave", function () {
        arcs.attr("opacity", 1);
        g.selectAll("path").attr("fill-opacity", 0.5);
      });

  }, [members]);

  return (
    <div className="h-full flex flex-col">
      <div className="text-center mb-4">
        <h2 className="font-serif text-3xl mb-2">Chord Diagram</h2>
        <p className="text-[#FAF6E3]/60 font-sans">Hover over arcs to see connections</p>
      </div>

      <div className="flex-1 relative">
        <svg ref={svgRef} className="w-full h-full" />

        <AnimatePresence>
          {hoveredArc && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="absolute top-4 left-4 bg-[#0A0A0A]/90 backdrop-blur-md border border-[#FAF6E3]/20 rounded-xl p-4 max-w-xs"
            >
              <h3 className="font-serif text-lg text-white">{hoveredArc.member.name}</h3>
              <p className="text-[#D4A853] font-sans text-xs mt-1">{hoveredArc.member.superpower}</p>
              <p className="text-[#9EB1C7] font-sans text-sm mt-2">
                {hoveredArc.connections} connection{hoveredArc.connections !== 1 ? "s" : ""}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap justify-center gap-4 mt-4">
        {skillCategories.map((cat) => (
          <div key={cat.name} className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: cat.color }} />
            <span className="font-sans text-xs text-[#FAF6E3]/60">{cat.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================
// MAIN PAGE
// ============================================
const visualizations = [
  { id: "finder", name: "Match Finder", icon: Search, component: MatchFinder },
  { id: "cards", name: "Match Cards", icon: Zap, component: PowerMatchCards },
  { id: "constellation", name: "Constellation", icon: Stars, component: ConstellationMap },
  { id: "orbit", name: "Skill Orbit", icon: Orbit, component: SkillOrbit },
];

function PowerMapContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // Get view from URL, default to "finder"
  const viewParam = searchParams.get("view") || "finder";
  const activeViz = visualizations.find(v => v.id === viewParam) || visualizations[0];

  const setActiveViz = (viz: typeof visualizations[0]) => {
    router.push(`/power-map?view=${viz.id}`, { scroll: false });
  };

  const ActiveComponent = activeViz.component;

  return (
    <>
      <BackgroundVideo src={VIDEO_URL} />

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-[#FAF6E3]/10 bg-[#0A0A0A]/80 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="font-script text-3xl">
            Recess
          </Link>
          <a
            href="https://www.skool.com/recess/about"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-[#D4A853] text-[#0A0A0A] px-6 py-2 rounded-full font-sans font-semibold hover:bg-[#c49943] transition-colors"
          >
            Join Recess
          </a>
        </div>
      </header>

      {/* Main content */}
      <main className="relative z-10 pt-24 pb-32 px-6 min-h-screen overflow-auto">
        <div className="max-w-6xl mx-auto min-h-[calc(100vh-12rem)]">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeViz.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="min-h-full"
            >
              <ActiveComponent members={familyMembers} />
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* Left side toggles - centered vertically */}
      <div className="fixed left-6 top-1/2 -translate-y-1/2 z-50">
        <div className="bg-[#0A0A0A]/90 backdrop-blur-md border border-[#FAF6E3]/20 rounded-2xl p-2 flex flex-col gap-1">
          {visualizations.map((viz) => {
            const Icon = viz.icon;
            const isActive = activeViz.id === viz.id;

            return (
              <motion.button
                key={viz.id}
                onClick={() => setActiveViz(viz)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                  isActive
                    ? "bg-[#D4A853] text-[#0A0A0A]"
                    : "text-[#FAF6E3]/70 hover:bg-[#FAF6E3]/10 hover:text-[#FAF6E3]"
                }`}
                whileHover={{ x: isActive ? 0 : 4 }}
                whileTap={{ scale: 0.98 }}
              >
                <Icon className="w-4 h-4" />
                <span className="font-sans text-sm font-medium">{viz.name}</span>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Footer */}
      <footer className="fixed bottom-0 left-0 right-0 z-40 py-4 px-6 bg-gradient-to-t from-[#0A0A0A] to-transparent pointer-events-none">
        <div className="max-w-6xl mx-auto flex justify-end">
          <span className="font-sans text-xs text-[#FAF6E3]/30 pointer-events-auto"><a href="/admin" className="hover:text-[#FAF6E3]/50 transition-colors">&copy;</a> 2026 Recess. All rights reserved.</span>
        </div>
      </footer>
    </>
  );
}

export default function PowerMap() {
  return (
    <div className="min-h-screen bg-[#0A0A0A] text-[#FAF6E3] relative">
      <Suspense fallback={<div className="min-h-screen bg-[#0A0A0A]" />}>
        <PowerMapContent />
      </Suspense>
    </div>
  );
}
