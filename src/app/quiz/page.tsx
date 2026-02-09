"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import { businessTypes } from "../../lib/quiz/business-types";
import { growthStages } from "../../lib/quiz/growth-stages";
import { BusinessType, GrowthStage } from "../../lib/quiz/types";
import { getQuestionsForPath } from "../../lib/quiz/questions";

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

export default function Quiz() {
  const router = useRouter();
  const [step, setStep] = useState<'intro' | 'business-type' | 'growth-stage' | 'questions'>('intro');
  const [selectedBusinessType, setSelectedBusinessType] = useState<BusinessType | null>(null);
  const [selectedGrowthStage, setSelectedGrowthStage] = useState<GrowthStage | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);

  const startQuiz = () => {
    setStep('business-type');
  };

  const selectBusinessType = (businessType: BusinessType) => {
    setSelectedBusinessType(businessType);
    setStep('growth-stage');
  };

  const selectGrowthStage = (growthStage: GrowthStage) => {
    setSelectedGrowthStage(growthStage);
    
    // Clear any existing quiz data and start fresh with the selected path
    localStorage.removeItem('focusFoundersQuizScore');
    localStorage.removeItem('focusFoundersQuizAnswers');
    localStorage.setItem('focusFoundersQuizPath', JSON.stringify({
      businessType: selectedBusinessType,
      growthStage: growthStage
    }));
    
    // Start the questions on this page
    setCurrentQuestionIndex(0);
    setAnswers([]);
    setStep('questions');
  };

  if (step === 'intro') {
    return (
      <>
        <Navbar />
        <div className="min-h-screen relative overflow-hidden flex items-center">
          <AutoPlayVideo src="/videos/rvids/19.mp4" className="absolute inset-0 w-full h-full object-cover" />
          <div className="relative z-20 max-w-4xl mx-auto px-6 py-12 text-center text-black">
            <div className="bg-white/90 backdrop-blur-md rounded-2xl p-8 border border-white/40 shadow-2xl">
              <h1 className="text-4xl font-bold mb-6">ADHD Entrepreneur Assessment</h1>
              <p className="text-xl mb-8">
                Discover the perfect business support level for your unique ADHD journey
              </p>
              <div className="bg-yellow-400/20 rounded-xl p-6 mb-8">
                <h2 className="text-2xl font-semibold mb-4">What You'll Get:</h2>
                <ul className="space-y-2 text-lg">
                  <li>✓ 20 questions tailored to your business type and stage</li>
                  <li>✓ Personalized service recommendations</li>
                  <li>✓ Insights into your unique neurodivergent business strengths</li>
                  <li>✓ Action plan for your next steps toward sustainable success</li>
                </ul>
              </div>
              <button 
                onClick={startQuiz}
                className="bg-yellow-500 hover:bg-yellow-400 text-black px-12 py-4 rounded-full font-semibold text-xl transition-colors"
              >
                Start Assessment
              </button>
            </div>
          </div>
        </div>
      </>
    );
  }

  if (step === 'business-type') {
    return (
      <>
        <Navbar />
        <div className="min-h-screen relative overflow-hidden flex items-center">
          <AutoPlayVideo src="/videos/rvids/19.mp4" className="absolute inset-0 w-full h-full object-cover" />
          <div className="relative z-20 max-w-4xl mx-auto px-6 py-12 text-center text-black">
              <div className="bg-white/90 backdrop-blur-md rounded-2xl p-8 text-black border border-white/40 shadow-2xl">
                <div className="text-center mb-8">
                  <h1 className="text-3xl font-bold mb-4">What type of business do you run?</h1>
                  <p className="text-lg text-gray-600">
                    Choose the option that best describes your business model
                  </p>
                </div>
                
                <div className="grid md:grid-cols-2 gap-6">
                  {businessTypes.map((businessType) => (
                    <button
                      key={businessType.id}
                      onClick={() => selectBusinessType(businessType.id)}
                      className="text-left p-6 bg-white/80 hover:bg-white/90 rounded-xl transition-all duration-300 border border-gray-200 hover:border-blue-400"
                    >
                      <div className="text-4xl mb-4">{businessType.emoji}</div>
                      <h3 className="text-xl font-semibold mb-2 text-gray-900">{businessType.name}</h3>
                      <p className="text-gray-700 mb-4">{businessType.description}</p>
                      <div className="text-sm text-blue-600 font-medium">
                        Examples: {businessType.examples.join(', ')}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  if (step === 'growth-stage') {
    const selectedType = businessTypes.find(bt => bt.id === selectedBusinessType);
    
    return (
      <>
        <Navbar />
        <div className="min-h-screen relative overflow-hidden flex items-center">
          <AutoPlayVideo src="/videos/rvids/19.mp4" className="absolute inset-0 w-full h-full object-cover" />
          <div className="relative z-20 max-w-4xl mx-auto px-6 py-12 text-center text-black">
              <div className="bg-white/90 backdrop-blur-md rounded-2xl p-8 text-black border border-white/40 shadow-2xl">
                <div className="text-center mb-8">
                  <div className="flex items-center justify-center mb-4">
                    <span className="text-3xl mr-2">{selectedType?.emoji}</span>
                    <span className="text-2xl font-semibold">{selectedType?.name}</span>
                  </div>
                  <h1 className="text-3xl font-bold mb-4">What stage is your business in?</h1>
                  <p className="text-lg text-gray-600">
                    Choose the stage that best describes where you are now
                  </p>
                </div>
                
                <div className="space-y-6">
                  {growthStages.map((stage) => (
                    <button
                      key={stage.id}
                      onClick={() => selectGrowthStage(stage.id)}
                      className="w-full text-left p-6 bg-white/80 hover:bg-white/90 rounded-xl transition-all duration-300 border border-gray-200 hover:border-blue-400"
                    >
                      <div className="flex items-start">
                        <div className="text-3xl mr-4">{stage.emoji}</div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="text-xl font-semibold text-gray-900">{stage.name}</h3>
                            <span className="text-blue-600 font-medium">{stage.revenue}</span>
                          </div>
                          <p className="text-gray-700">{stage.description}</p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
                
                <div className="mt-8 text-center">
                  <button
                    onClick={() => setStep('business-type')}
                    className="text-blue-600 hover:text-blue-500 font-medium"
                  >
                    ← Back to business type
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  // Questions step - handle all questions on this page
  if (step === 'questions') {
    const questions = getQuestionsForPath(selectedBusinessType!, selectedGrowthStage!);
    const currentQuestion = questions[currentQuestionIndex];
    const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

    const handleAnswer = (points: number) => {
      const newAnswers = [...answers];
      newAnswers[currentQuestionIndex] = points;
      setAnswers(newAnswers);
      
      // Save to localStorage
      localStorage.setItem('focusFoundersQuizAnswers', JSON.stringify(newAnswers));
      
      // Move to next question or results
      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
      } else {
        // Calculate final results and redirect
        const totalScore = newAnswers.reduce((sum, score) => sum + score, 0);
        localStorage.setItem('focusFoundersQuizScore', totalScore.toString());
        router.push('/quiz/results');
      }
    };

    const goBack = () => {
      if (currentQuestionIndex > 0) {
        setCurrentQuestionIndex(currentQuestionIndex - 1);
      } else {
        setStep('growth-stage');
      }
    };

    return (
      <>
        <Navbar />
        <div className="min-h-screen relative overflow-hidden flex items-center">
          <AutoPlayVideo src="/videos/rvids/19.mp4" className="absolute inset-0 w-full h-full object-cover" />
          <div className="relative z-20 max-w-4xl mx-auto px-6 py-12 text-center text-black">
            <div className="bg-white/90 backdrop-blur-md rounded-2xl p-8 border border-white/40 shadow-2xl">
              <div className="mb-8">
                <div className="flex justify-between items-center mb-4">
                  <h1 className="text-3xl font-bold text-gray-900">ADHD Entrepreneur Assessment</h1>
                  <span className="text-blue-600 font-semibold">
                    {currentQuestionIndex + 1} of {questions.length}
                  </span>
                </div>
                
                <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
                  <div 
                    className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>

                <button
                  onClick={goBack}
                  className="mb-4 text-blue-600 hover:text-blue-500 flex items-center font-medium"
                >
                  ← Previous
                </button>
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

  return null;
}