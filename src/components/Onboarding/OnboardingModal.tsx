import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import {
  Sparkles,
  Users,
  PenSquare,
  ListOrdered,
  CheckCircle2,
  ExternalLink,
  ChevronRight,
  ChevronLeft,
} from 'lucide-react';

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoadDemoData: () => void;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({
  isOpen,
  onClose,
  onLoadDemoData,
}) => {
  const [step, setStep] = useState(0);

  const steps = [
    {
      title: 'Welcome to AI Group Poster',
      subtitle: 'The compliant, human-in-the-loop Facebook posting workflow assistant.',
      content: (
        <div className="space-y-3 text-xs text-slate-300">
          <p>
            This extension is engineered to help sellers, marketers, and businesses streamline Facebook Group postings without risking account flags or triggering bot detections.
          </p>
          <div className="p-3 bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 rounded-xl space-y-1">
            <span className="font-bold block text-white">How it works:</span>
            <p>1. Organize groups & prepare posts</p>
            <p>2. Build an active queue</p>
            <p>3. Review the in-page helper on Facebook</p>
            <p>4. You review, confirm & post manually</p>
          </div>
        </div>
      ),
    },
    {
      title: '1. Add your Facebook Groups',
      subtitle: 'Save target groups once and reuse them for multiple campaigns.',
      content: (
        <div className="space-y-3 text-xs text-slate-300">
          <p>
            Navigate to the <strong>Groups</strong> tab to add groups individually, in bulk, or by importing a CSV file.
          </p>
          <p>
            The extension automatically validates group URLs, extracts group slugs, and checks for duplicates so you never post twice to the same group by mistake.
          </p>
        </div>
      ),
    },
    {
      title: '2. Create Your Post & Templates',
      subtitle: 'Save post information, multiple images, and dynamic templates.',
      content: (
        <div className="space-y-3 text-xs text-slate-300">
          <p>
            In the <strong>Post Composer</strong>, add product titles, pricing, features, location, and multiple images.
          </p>
          <p>
            Templates dynamically substitute tags like <code>{'{product_name}'}</code> and <code>{'{price}'}</code> so your formatting stays consistent across every community.
          </p>
        </div>
      ),
    },
    {
      title: '3. Generate High-Converting AI Captions',
      subtitle: 'OpenAI, Google Gemini, or Custom API assistance.',
      content: (
        <div className="space-y-3 text-xs text-slate-300">
          <p>
            Use the <strong>AI Writer</strong> to create captions in Bangla, Banglish, or English with tailored marketplace styles.
          </p>
          <p>
            Use one-click tools to <em>Shorten</em>, <em>Expand</em>, <em>Make Professional</em>, or <em>Translate</em> in seconds.
          </p>
        </div>
      ),
    },
    {
      title: '4. The In-Page Facebook Helper Dock',
      subtitle: 'Seamless copy tools directly on Facebook Group pages.',
      content: (
        <div className="space-y-3 text-xs text-slate-300">
          <p>
            When a target Facebook group opens, our non-intrusive floating helper appears at the bottom right.
          </p>
          <p>
            Click <strong>Copy Full Post</strong>, paste into Facebook, attach your photos, and click <strong>Mark as Posted</strong>. The extension automatically records history and paces the next queue item!
          </p>
        </div>
      ),
    },
  ];

  const currentStep = steps[step];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={currentStep.title}
      description={currentStep.subtitle}
      maxWidth="md"
    >
      <div className="space-y-6">
        {currentStep.content}

        {/* Step indicators */}
        <div className="flex items-center justify-center gap-1.5">
          {steps.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 rounded-full transition-all ${
                i === step ? 'w-6 bg-indigo-500' : 'w-2 bg-slate-800'
              }`}
            />
          ))}
        </div>

        {/* Action Controls */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-800">
          <div>
            {step === 0 ? (
              <Button
                variant="outline"
                size="sm"
                icon={<Sparkles size={13} className="text-amber-400" />}
                onClick={() => {
                  onLoadDemoData();
                  onClose();
                }}
              >
                Load Demo Data
              </Button>
            ) : (
              <Button
                variant="ghost"
                size="sm"
                icon={<ChevronLeft size={14} />}
                onClick={() => setStep(prev => Math.max(0, prev - 1))}
              >
                Back
              </Button>
            )}
          </div>

          <div className="flex items-center gap-2">
            {step < steps.length - 1 ? (
              <Button
                variant="primary"
                size="sm"
                icon={<ChevronRight size={14} />}
                onClick={() => setStep(prev => prev + 1)}
              >
                Next
              </Button>
            ) : (
              <Button
                variant="success"
                size="sm"
                icon={<CheckCircle2 size={14} />}
                onClick={onClose}
              >
                Get Started
              </Button>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
};
