import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { motion, AnimatePresence } from 'framer-motion';
import { Church, Sparkles, Users, Heart, ArrowRight, Plus } from 'lucide-react';

export default function Onboarding() {
  const [step, setStep] = useState(0);
  const [role, setRole] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [churchName, setChurchName] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [foundChurch, setFoundChurch] = useState(null);
  const [students, setStudents] = useState([]);

  const roles = [
    { value: 'kid', label: "I'm a Kid! 🧒", desc: 'Earn points & win rewards', icon: Sparkles, color: 'bg-primary/10 border-primary/30 text-primary' },
    { value: 'parent', label: "I'm a Parent 👨‍👩‍👧", desc: "Track my child's journey", icon: Heart, color: 'bg-secondary/10 border-secondary/30 text-secondary' },
    { value: 'admin', label: 'Church Leader ⛪', desc: 'Manage my church program', icon: Users, color: 'bg-accent/10 border-accent/30 text-accent' },
  ];

  const handleJoinChurch = async () => {
    setIsLoading(true);
    setError('');
    try {
      const churches = await base44.entities.Church.filter({ join_code: joinCode.trim().toUpperCase() });
      if (churches.length === 0) {
        setError('No church found with that code. Please check and try again.');
        setIsLoading(false);
        return;
      }
      const church = churches[0];
      await base44.auth.updateMe({ user_type: role, church_id: church.id, onboarded: true });

      if (role === 'kid') {
        // Load students so kid can pick their profile
        const studentList = await base44.entities.Student.filter({ church_id: church.id, status: 'active' }, 'first_name', 200);
        setFoundChurch(church);
        setStudents(studentList);
        setIsLoading(false);
        setStep(2);
      } else {
        window.location.reload();
      }
    } catch (e) {
      setError('Something went wrong: ' + (e?.message || 'Please try again.'));
      setIsLoading(false);
    }
  };

  const handleSelectStudent = async (student) => {
    setIsLoading(true);
    try {
      await base44.auth.updateMe({ student_id: student.id });
      window.location.reload();
    } catch (e) {
      setError('Could not link profile: ' + (e?.message || 'Please try again.'));
      setIsLoading(false);
    }
  };

  const handleSkipLinking = () => {
    window.location.reload();
  };

  const handleCreateChurch = async () => {
    setIsLoading(true);
    setError('');
    try {
      const code = Math.random().toString(36).substring(2, 8).toUpperCase();
      const newChurch = await base44.entities.Church.create({
        name: churchName,
        join_code: code,
      });
      await base44.auth.updateMe({ user_type: 'admin', church_id: newChurch.id, onboarded: true });
      window.location.reload();
    } catch (e) {
      setError('Something went wrong: ' + (e?.message || 'Please try again.'));
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
      <AnimatePresence mode="wait">
        {step === 0 && (
          <motion.div
            key="welcome"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="w-full max-w-sm text-center"
          >
            <div className="w-20 h-20 bg-primary/10 rounded-3xl flex items-center justify-center mx-auto mb-6">
              <Church className="w-10 h-10 text-primary" />
            </div>
            <h1 className="text-3xl font-display font-bold mb-2">Kingdom Kids</h1>
            <p className="text-muted-foreground mb-8">Grow, Learn &amp; Earn Rewards!</p>

            <div className="space-y-3 mb-8">
              {roles.map((r) => (
                <Card
                  key={r.value}
                  onClick={() => setRole(r.value)}
                  className={`p-4 cursor-pointer border-2 transition-all duration-200 ${
                    role === r.value
                      ? r.color + ' border-current shadow-lg scale-[1.02]'
                      : 'border-border hover:border-muted-foreground/30'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <r.icon className="w-5 h-5" />
                    <div className="text-left">
                      <p className="font-bold text-sm">{r.label}</p>
                      <p className="text-xs text-muted-foreground">{r.desc}</p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            <Button
              onClick={() => setStep(1)}
              disabled={!role}
              className="w-full h-12 rounded-2xl text-base font-bold gap-2"
            >
              Continue <ArrowRight className="w-4 h-4" />
            </Button>
          </motion.div>
        )}

        {step === 1 && (
          <motion.div
            key="church"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="w-full max-w-sm text-center"
          >
            <h2 className="text-2xl font-display font-bold mb-2">Join Your Church</h2>
            <p className="text-muted-foreground text-sm mb-8">Enter the code from your church leader</p>

            <div className="space-y-4 mb-6">
              <Input
                placeholder="Enter church code (e.g. ABC123)"
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                className="h-14 text-center text-lg font-bold tracking-widest rounded-2xl uppercase"
                maxLength={6}
              />
              {error && <p className="text-destructive text-sm">{error}</p>}
            </div>

            <Button
              onClick={handleJoinChurch}
              disabled={joinCode.length < 4 || isLoading}
              className="w-full h-12 rounded-2xl text-base font-bold mb-4"
            >
              {isLoading ? 'Joining...' : 'Join Church'}
            </Button>

            {role === 'admin' && (
              <>
                <div className="flex items-center gap-3 my-6">
                  <div className="flex-1 h-px bg-border" />
                  <span className="text-xs text-muted-foreground">or</span>
                  <div className="flex-1 h-px bg-border" />
                </div>

                <div className="space-y-4">
                  <Input
                    placeholder="Your church name"
                    value={churchName}
                    onChange={(e) => setChurchName(e.target.value)}
                    className="h-12 rounded-2xl"
                  />
                  <Button
                    variant="outline"
                    onClick={handleCreateChurch}
                    disabled={!churchName || isLoading}
                    className="w-full h-12 rounded-2xl text-base font-bold gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    {isLoading ? 'Creating...' : 'Create New Church'}
                  </Button>
                </div>
              </>
            )}

            <button
              onClick={() => setStep(0)}
              className="mt-6 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              ← Go back
            </button>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div
            key="pick-student"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="w-full max-w-sm"
          >
            <div className="text-center mb-6">
              <h2 className="text-2xl font-display font-bold mb-1">Which one are you?</h2>
              <p className="text-muted-foreground text-sm">Pick your name from {foundChurch?.name}</p>
            </div>

            {error && <p className="text-destructive text-sm text-center mb-4">{error}</p>}

            {students.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground text-sm mb-4">No student profiles found yet. Your church leader will add you soon!</p>
                <Button onClick={handleSkipLinking} className="rounded-2xl">
                  Continue Anyway
                </Button>
              </div>
            ) : (
              <div className="space-y-2 max-h-[60vh] overflow-y-auto pb-4">
                {students.map((s) => (
                  <Card
                    key={s.id}
                    onClick={() => !isLoading && handleSelectStudent(s)}
                    className="p-4 cursor-pointer border-2 border-border hover:border-primary/50 hover:bg-primary/5 transition-all duration-200 active:scale-[0.98]"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary">
                        {s.first_name?.[0]}{s.last_name?.[0]}
                      </div>
                      <p className="font-bold">{s.first_name} {s.last_name}</p>
                    </div>
                  </Card>
                ))}
                <button
                  onClick={handleSkipLinking}
                  className="w-full mt-4 text-sm text-muted-foreground hover:text-foreground transition-colors py-2"
                >
                  My name is not here — skip for now
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}