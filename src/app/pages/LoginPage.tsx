import { useState } from 'react';
import { useNavigate } from '../hooks/useNavigate';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Alert, AlertDescription } from '../components/ui/alert';
import { useAuth } from '../context/AuthContext';
import { Building2, LogIn } from 'lucide-react';
import logoImage from '../../imports/logo-multi-color-1.png';

export function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!username || !password) {
      setError('Please enter both username and password');
      return;
    }

    setIsLoading(true);

    try {
      await login({ username, password });
      navigate('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  const demoAccounts = [
    { label: 'Employee', username: 'emp001' },
    { label: 'Controlling Officer', username: 'co001' },
    { label: 'HR Officer', username: 'hr001' },
    { label: 'Sanction Authority', username: 'sa001' },
    { label: 'Accounts', username: 'acc001' },
    { label: 'Admin', username: 'admin001' },
  ];

  const quickLogin = (user: string) => {
    setUsername(user);
    setPassword('demo123');
    setError('');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Logo and Title */}
        <div className="text-center space-y-2">
          <div className="flex justify-center mb-4">
            <img src={logoImage} alt="APTRANSCO" className="h-20 w-auto" />
          </div>
          <h1 className="text-3xl font-bold text-foreground">APTRANSCO</h1>
          <p className="text-muted-foreground">Leave Sanction Module</p>
          <p className="text-sm text-muted-foreground">Employee One Platform</p>
        </div>

        {/* Login Card */}
        <Card>
          <CardHeader>
            <CardTitle>Sign In</CardTitle>
            <CardDescription>Enter your credentials to access your account</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Username / Employee ID</Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="emp001"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  disabled={isLoading}
                  autoComplete="username"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                  autoComplete="current-password"
                />
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <span className="animate-spin mr-2">⏳</span>
                    Signing in...
                  </>
                ) : (
                  <>
                    <LogIn className="w-4 h-4 mr-2" />
                    Sign In
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Demo Accounts */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Demo Accounts</CardTitle>
            <CardDescription>Quick login for testing (Password: demo123)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-2">
              {demoAccounts.map((account) => (
                <Button
                  key={account.username}
                  variant="outline"
                  size="sm"
                  onClick={() => quickLogin(account.username)}
                  disabled={isLoading}
                  className="text-xs"
                >
                  {account.label}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        <p className="text-center text-xs text-muted-foreground">
          © 2026 APTRANSCO. All rights reserved.
        </p>
      </div>
    </div>
  );
}
