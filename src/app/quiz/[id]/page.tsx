"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import Navbar from "@/components/Navbar";
import { getQuestionsForPath } from "../../../lib/quiz/questions";
import { BusinessType, GrowthStage } from "../../../lib/quiz/types";

// Generate poster image URL from video URL (skip for local videos)
function getPosterFromVideo(videoUrl: string): string {
  // For local videos, return empty string to avoid poster issues
  if (videoUrl.startsWith('/videos/')) {
    return '';
  }
  return videoUrl
    .replace("/video/upload/q_auto,f_auto/", "/video/upload/so_0,f_jpg,q_auto/")
    .replace(".mp4", ".jpg");
}

// AutoPlay Video component - hides video until playing to avoid play button
function AutoPlayVideo({ src, className }: { src: string; className: string }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const posterUrl = getPosterFromVideo(src);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Force muted state (required for mobile autoplay)
    video.muted = true;

    // Show video when it starts playing
    const handlePlaying = () => setIsPlaying(true);
    video.addEventListener("playing", handlePlaying);

    // Attempt to play
    const playVideo = () => {
      if (video.paused) {
        video.play().catch(() => {});
      }
    };

    // Try on various events
    video.addEventListener("loadedmetadata", playVideo);
    video.addEventListener("canplay", playVideo);
    playVideo();

    // Intersection Observer
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) playVideo();
        });
      },
      { threshold: 0.1 }
    );
    observer.observe(video);

    // User interaction fallback
    const handleInteraction = () => playVideo();
    document.addEventListener("touchstart", handleInteraction, { once: true, passive: true });
    document.addEventListener("click", handleInteraction, { once: true });
    document.addEventListener("scroll", handleInteraction, { once: true, passive: true });

    return () => {
      observer.disconnect();
      video.removeEventListener("playing", handlePlaying);
    };
  }, []);

  return (
    <div className={className} style={{ backgroundImage: `url(${posterUrl})`, backgroundSize: "cover", backgroundPosition: "center", backgroundColor: "#1a1a1a" }}>
      <video
        ref={videoRef}
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        controls={false}
        className={`w-full h-full object-cover transition-opacity duration-500 ${isPlaying ? "opacity-100" : "opacity-80"}`}
      >
        <source src={src} type="video/mp4" />
      </video>
    </div>
  );
}

interface ServiceTier {
  name: string;
  price: string;
  description: string;
  services: string[];
  cta: string;
  color: string;
}

const serviceTiers: Record<string, ServiceTier> = {
  low: {
    name: "ADHD Accountability Starter",
    price: "$97-197/month",
    description: "Perfect for neurodivergent entrepreneurs just starting their journey who need daily support and community.",
    services: [
      "Daily check-ins and accountability",
      "ADHD-friendly community support", 
      "Foundational business frameworks",
      "Energy management basics",
      "Dopamine-sized wins tracking"
    ],
    cta: "Start Your ADHD Business Journey",
    color: "from-green-600 to-emerald-600"
  },
  mid: {
    name: "ADHD Business Systems Intensive", 
    price: "$497-997/month",
    description: "For growing entrepreneurs ready to build sustainable systems without burning out their ADHD brains.",
    services: [
      "Bi-weekly 1:1 strategy calls",
      "Custom ADHD-friendly systems",
      "Client retention frameworks", 
      "Energy-based scheduling",
      "Crisis support channels"
    ],
    cta: "Scale Your ADHD Business",
    color: "from-orange-600 to-amber-600"
  },
  high: {
    name: "Scale Without Burnout Mastermind",
    price: "$1997-3997/month", 
    description: "Elite support for established entrepreneurs who refuse to sacrifice their neurodivergent gifts for growth.",
    services: [
      "Weekly 1:1 strategic intensives",
      "24/7 crisis management support",
      "Advanced team building for ADHD leaders",
      "Burnout prevention protocols",
      "Peer mastermind access"
    ],
    cta: "Join the Elite Mastermind",
    color: "from-purple-600 to-violet-600"
  }
};

export default function QuizQuestion() {
  const router = useRouter();
  const params = useParams();
  const [answers, setAnswers] = useState<number[]>([]);
  const [quizPath, setQuizPath] = useState<{businessType: BusinessType, growthStage: GrowthStage} | null>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  
  // Get current question ID from URL
  const currentId = parseInt(params.id as string);
  
  // Load quiz path and questions
  useEffect(() => {
    const savedPath = localStorage.getItem('focusFoundersQuizPath');
    const savedAnswers = localStorage.getItem('focusFoundersQuizAnswers');
    
    if (savedPath) {
      const path = JSON.parse(savedPath);
      setQuizPath(path);
      const pathQuestions = getQuestionsForPath(path.businessType, path.growthStage);
      setQuestions(pathQuestions);
    } else {
      // No path selected, redirect to quiz start
      router.push('/quiz');
      return;
    }
    
    if (savedAnswers) {
      setAnswers(JSON.parse(savedAnswers));
    }
  }, [router]);

  const currentQuestion = questions.find((q, index) => index + 1 === currentId);

  const handleAnswer = (points: number) => {
    // Update answers array
    const newAnswers = [...answers];
    const questionIndex = currentId - 1;
    newAnswers[questionIndex] = points;
    
    setAnswers(newAnswers);
    
    // Save to localStorage
    localStorage.setItem('focusFoundersQuizAnswers', JSON.stringify(newAnswers));
    
    // Navigate to next question or results
    if (currentId < questions.length) {
      router.push(`/quiz/${currentId + 1}`);
    } else {
      // Calculate final results
      const totalScore = newAnswers.reduce((sum, score) => sum + score, 0);
      localStorage.setItem('focusFoundersQuizScore', totalScore.toString());
      router.push('/quiz/results');
    }
  };

  const goBack = () => {
    if (currentId > 1) {
      router.push(`/quiz/${currentId - 1}`);
    } else {
      router.push('/quiz');
    }
  };

  if (!currentQuestion) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen relative overflow-hidden pt-24 flex items-center justify-center">
          <AutoPlayVideo src="/videos/rvids/19.mp4" className="absolute inset-0 w-full h-full object-cover" />
          <div className="relative z-20 text-white text-center">
            <div className="bg-white/90 backdrop-blur-md rounded-2xl p-8 border border-white/40 shadow-2xl">
              <h1 className="text-4xl font-bold mb-4 text-gray-900">Question Not Found</h1>
              <button 
                onClick={() => router.push('/quiz')}
                className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-3 rounded-lg font-semibold"
              >
                Start Quiz
              </button>
            </div>
          </div>
        </div>
      </>
    );
  }

  const progress = (currentId / questions.length) * 100;

  return (
    <>
      <Navbar />
      <div className="min-h-screen relative overflow-hidden pt-24">
        <AutoPlayVideo src="/videos/rvids/19.mp4" className="absolute inset-0 w-full h-full object-cover" />
        <div className="relative z-20 max-w-4xl mx-auto px-6 py-12">
          <div className="bg-white/90 backdrop-blur-md rounded-2xl p-8 text-black border border-white/40 shadow-2xl">
            <div className="mb-8">
              <div className="flex justify-between items-center mb-4">
                <h1 className="text-3xl font-bold text-gray-900">ADHD Entrepreneur Assessment</h1>
                <span className="text-blue-600 font-semibold">
                  {currentId} of {questions.length}
                </span>
              </div>
              
              <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
                <div 
                  className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>

              {currentId > 1 && (
                <button
                  onClick={goBack}
                  className="mb-4 text-blue-600 hover:text-blue-500 flex items-center font-medium"
                >
                  ← Previous Question
                </button>
              )}
            </div>
            
            <div className="mb-8">
              <h2 className="text-2xl font-semibold mb-8 text-gray-900">
                {currentQuestion.question}
              </h2>
              
              <div className="space-y-4">
                {currentQuestion.options.map((option, index) => (
                  <button
                    key={index}
                    onClick={() => handleAnswer(option.points)}
                    className="w-full text-left p-6 bg-white/80 hover:bg-white/90 rounded-xl transition-all duration-300 border border-gray-200 hover:border-blue-400"
                  >
                    <span className="text-lg text-gray-900">{option.text}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="text-center text-gray-600">
              <p className="text-sm">
                This assessment helps us recommend the perfect ADHD-friendly business support for your current stage.
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}