import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useClass } from "@/context/ClassContext";
import { useLoginClass, useRegisterClass } from "@/hooks/useQueries";
import { useNavigate } from "@tanstack/react-router";
import { BookOpen, CheckCircle2, Copy, Loader2, Zap } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";

export function LoginPage() {
  const navigate = useNavigate();
  const { login } = useClass();

  // Login state
  const [loginClassId, setLoginClassId] = useState("");
  const [loginError, setLoginError] = useState("");

  // Register state
  const [className, setClassName] = useState("");
  const [classYear, setClassYear] = useState("");
  const [registeredId, setRegisteredId] = useState<bigint | null>(null);
  const [copied, setCopied] = useState(false);

  const loginMutation = useLoginClass();
  const registerMutation = useRegisterClass();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");

    const trimmed = loginClassId.trim();
    if (!trimmed) {
      setLoginError("Please enter a Class ID");
      return;
    }

    let classId: bigint;
    try {
      classId = BigInt(trimmed);
    } catch {
      setLoginError("Invalid Class ID format");
      return;
    }

    loginMutation.mutate(classId, {
      onSuccess: (record) => {
        login(record.id, record.name, record.year);
        navigate({ to: "/dashboard" });
      },
      onError: () => {
        setLoginError("Invalid Class ID. Please check and try again.");
      },
    });
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    const trimmedName = className.trim();
    const trimmedYear = classYear.trim();

    if (!trimmedName || !trimmedYear) {
      toast.error("Please fill in all fields");
      return;
    }

    registerMutation.mutate(
      { name: trimmedName, year: trimmedYear },
      {
        onSuccess: (newId) => {
          setRegisteredId(newId);
          toast.success("Class registered successfully!");
        },
        onError: () => {
          toast.error("Failed to register class. Please try again.");
        },
      },
    );
  };

  const copyClassId = async () => {
    if (registeredId === null) return;
    await navigator.clipboard.writeText(registeredId.toString());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success("Class ID copied to clipboard!");
  };

  return (
    <div className="min-h-screen gradient-mesh flex flex-col">
      {/* Header */}
      <header className="pt-10 pb-6 flex flex-col items-center gap-3">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="flex items-center gap-3"
        >
          <div className="relative">
            <img
              src="/assets/generated/lectronote-logo-transparent.dim_200x200.png"
              alt="LectroNote"
              className="h-16 w-16 object-contain"
            />
          </div>
          <div>
            <h1 className="font-display text-3xl font-bold tracking-tight text-foreground">
              Lect<span className="text-primary">ro</span>Note
            </h1>
            <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
              Class Session Tracker
            </p>
          </div>
        </motion.div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-start justify-center px-4 pb-16">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15, ease: "easeOut" }}
          className="w-full max-w-md"
        >
          <Tabs defaultValue="login" className="w-full">
            <TabsList
              className="grid w-full grid-cols-2 mb-6 h-11"
              data-ocid="auth.tab"
            >
              <TabsTrigger
                value="login"
                className="font-medium"
                data-ocid="auth.login.tab"
              >
                <BookOpen className="h-4 w-4 mr-2" />
                Login with Class ID
              </TabsTrigger>
              <TabsTrigger
                value="register"
                className="font-medium"
                data-ocid="auth.register.tab"
              >
                <Zap className="h-4 w-4 mr-2" />
                Register New Class
              </TabsTrigger>
            </TabsList>

            {/* ── Login Tab ── */}
            <TabsContent value="login" className="animate-slide-up">
              <Card className="shadow-elevated border-border/60">
                <CardHeader className="pb-4">
                  <CardTitle className="font-display text-xl">
                    Welcome Back
                  </CardTitle>
                  <CardDescription>
                    Enter your Class ID to access your dashboard and session
                    records.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleLogin} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="classId">Class ID</Label>
                      <Input
                        id="classId"
                        type="text"
                        inputMode="numeric"
                        placeholder="Enter your Class ID (e.g. 12345)"
                        value={loginClassId}
                        onChange={(e) => {
                          setLoginClassId(e.target.value);
                          setLoginError("");
                        }}
                        data-ocid="login.input"
                        className="h-11 font-mono text-base"
                        autoComplete="off"
                        disabled={loginMutation.isPending}
                      />
                    </div>

                    {loginError && (
                      <Alert
                        variant="destructive"
                        data-ocid="login.error_state"
                      >
                        <AlertDescription>{loginError}</AlertDescription>
                      </Alert>
                    )}

                    <Button
                      type="submit"
                      className="w-full h-11 font-semibold"
                      disabled={loginMutation.isPending}
                      data-ocid="login.submit_button"
                    >
                      {loginMutation.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Verifying...
                        </>
                      ) : (
                        "Login to Class"
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>

            {/* ── Register Tab ── */}
            <TabsContent value="register" className="animate-slide-up">
              <Card className="shadow-elevated border-border/60">
                <CardHeader className="pb-4">
                  <CardTitle className="font-display text-xl">
                    Register New Class
                  </CardTitle>
                  <CardDescription>
                    Create a new class to start tracking sessions. A unique
                    Class ID will be generated.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {registeredId !== null ? (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="space-y-4"
                      data-ocid="register.success_state"
                    >
                      <div className="rounded-xl bg-primary/10 border border-primary/20 p-5 text-center space-y-3">
                        <CheckCircle2 className="h-10 w-10 text-primary mx-auto" />
                        <div>
                          <p className="text-sm text-muted-foreground mb-1">
                            Your Class ID
                          </p>
                          <p className="font-mono font-bold text-3xl text-foreground tracking-wider">
                            {registeredId.toString()}
                          </p>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Save this ID to log in to your class later.
                        </p>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={copyClassId}
                          data-ocid="register.copy.button"
                          className="gap-2"
                        >
                          {copied ? (
                            <>
                              <CheckCircle2 className="h-4 w-4 text-success" />
                              Copied!
                            </>
                          ) : (
                            <>
                              <Copy className="h-4 w-4" />
                              Copy Class ID
                            </>
                          )}
                        </Button>
                      </div>

                      <div className="text-center space-y-1">
                        <p className="text-sm text-muted-foreground">
                          Class{" "}
                          <Badge variant="secondary" className="font-medium">
                            {className}
                          </Badge>{" "}
                          ({classYear}) is ready!
                        </p>
                      </div>

                      <Button
                        variant="default"
                        className="w-full"
                        onClick={() => {
                          const {
                            classId,
                            className: name,
                            classYear: year,
                          } = {
                            classId: registeredId,
                            className,
                            classYear,
                          };
                          login(classId, name, year);
                          navigate({ to: "/dashboard" });
                        }}
                        data-ocid="register.goto_dashboard.button"
                      >
                        Go to Dashboard
                      </Button>

                      <Button
                        variant="ghost"
                        className="w-full"
                        onClick={() => {
                          setRegisteredId(null);
                          setClassName("");
                          setClassYear("");
                          registerMutation.reset();
                        }}
                        data-ocid="register.reset.button"
                      >
                        Register Another Class
                      </Button>
                    </motion.div>
                  ) : (
                    <form onSubmit={handleRegister} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="reg-className">Class Name</Label>
                        <Input
                          id="reg-className"
                          type="text"
                          placeholder="e.g. Computer Science 101"
                          value={className}
                          onChange={(e) => setClassName(e.target.value)}
                          data-ocid="register.name.input"
                          className="h-11"
                          disabled={registerMutation.isPending}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="reg-year">Academic Year</Label>
                        <Input
                          id="reg-year"
                          type="text"
                          placeholder="e.g. 2025–2026"
                          value={classYear}
                          onChange={(e) => setClassYear(e.target.value)}
                          data-ocid="register.year.input"
                          className="h-11"
                          disabled={registerMutation.isPending}
                        />
                      </div>

                      {registerMutation.isError && (
                        <Alert
                          variant="destructive"
                          data-ocid="register.error_state"
                        >
                          <AlertDescription>
                            Registration failed. Please try again.
                          </AlertDescription>
                        </Alert>
                      )}

                      <Button
                        type="submit"
                        className="w-full h-11 font-semibold"
                        disabled={registerMutation.isPending}
                        data-ocid="register.submit_button"
                      >
                        {registerMutation.isPending ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Creating Class...
                          </>
                        ) : (
                          "Create & Get Class ID"
                        )}
                      </Button>
                    </form>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="py-4 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()}. Built with ❤️ using{" "}
        <a
          href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="underline underline-offset-2 hover:text-foreground transition-colors"
        >
          caffeine.ai
        </a>
      </footer>
    </div>
  );
}
