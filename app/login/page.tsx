'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardBody, CardHeader } from '@heroui/card';
import { Input } from '@heroui/input';
import { Button } from '@heroui/button';
import { Alert } from '@heroui/alert';
import { useAuth } from '@/lib/auth-context';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { signIn, error } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      return;
    }

    setIsLoading(true);
    
    try {
      await signIn(email, password);
      router.push('/'); // Redirect to dashboard after successful login
    } catch (err) {
      // Error is handled by the auth context
      console.error('Login failed:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="flex flex-col gap-3 pb-6">
          <div className="flex flex-col items-center text-center">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Admin Login
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
              Sign in to access the admin dashboard
            </p>
          </div>
        </CardHeader>
        
        <CardBody className="pt-0">
          {error && (
            <Alert
              color="danger"
              variant="flat"
              className="mb-4"
              title="Login Failed"
              description={error}
            />
          )}
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              type="email"
              label="Email"
              placeholder="Enter your email"
              value={email}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
              isRequired
              variant="bordered"
              classNames={{
                input: "text-sm",
                label: "text-sm font-medium",
              }}
            />
            
            <Input
              type="password"
              label="Password"
              placeholder="Enter your password"
              value={password}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
              isRequired
              variant="bordered"
              classNames={{
                input: "text-sm",
                label: "text-sm font-medium",
              }}
            />
            
            <Button
              type="submit"
              color="primary"
              size="lg"
              className="w-full font-medium"
              isLoading={isLoading}
              isDisabled={!email || !password}
            >
              {isLoading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>
          
          <div className="mt-6 text-center">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Only administrators can access this dashboard.
              <br />
              Contact your system administrator if you need access.
            </p>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}