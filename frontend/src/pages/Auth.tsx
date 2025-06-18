
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const Auth = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn, user } = useAuth();
  const navigate = useNavigate();

  React.useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    const { error } = await signIn(email, password);
    
    if (!error) {
      navigate('/');
    }
    
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="min-h-screen flex">
        {/* Left Panel - Company Information */}
        <div className="hidden lg:flex lg:w-1/2 bg-slate-900 text-white flex-col justify-center px-16 relative overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-5">
            <div className="absolute top-20 left-20 w-32 h-32 border border-white/20 rounded-full"></div>
            <div className="absolute bottom-40 right-16 w-24 h-24 border border-white/20 rounded-full"></div>
            <div className="absolute top-1/2 right-32 w-16 h-16 border border-white/20 rounded-full"></div>
          </div>
          
          <div className="relative z-10 max-w-lg">
            {/* Company Logo/Brand */}
            <div className="mb-12">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-2xl mb-6 shadow-lg">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                </svg>
              </div>
              
              <div className="space-y-2">
                <h1 className="text-4xl font-bold text-white leading-tight">
                  Omyra Technologies
                </h1>
                <p className="text-lg font-medium text-slate-300 tracking-wide">
                  Private Limited
                </p>
                <div className="flex items-center space-x-2">
                  <div className="w-12 h-0.5 bg-blue-500"></div>
                  <div className="w-6 h-0.5 bg-blue-400"></div>
                  <div className="w-3 h-0.5 bg-blue-300"></div>
                </div>
              </div>
            </div>
            
            {/* Tagline */}
            <div className="mb-6">
              <p className="text-slate-400  text-lg leading-relaxed">
                Empowering businesses with cutting-edge solutions that drive growth and digital transformation.
              </p>
            </div>
            
            {/* Services Section */}
            <div className="space-y-8">
              <div>
                <h3 className="text-xl font-semibold text-white mb-6 flex items-center">
                  <div className="w-1 h-6 bg-blue-500 mr-3 rounded-full"></div>
                  Our Expertise
                </h3>
                
                <div className="grid grid-cols-1 gap-4">
                  <div className="group hover:bg-white/5 p-4 rounded-xl transition-all duration-300 cursor-pointer">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-blue-600/20 rounded-lg flex items-center justify-center group-hover:bg-blue-600/30 transition-colors">
                        <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9v-9m0-9v9" />
                        </svg>
                      </div>
                      <div>
                        <h4 className="text-white font-medium">Web Development</h4>
                        <p className="text-slate-400 text-sm">Modern, responsive web applications</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="group hover:bg-white/5 p-4 rounded-xl transition-all duration-300 cursor-pointer">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-blue-600/20 rounded-lg flex items-center justify-center group-hover:bg-blue-600/30 transition-colors">
                        <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <div>
                        <h4 className="text-white font-medium">App Development</h4>
                        <p className="text-slate-400 text-sm">Native & cross-platform mobile apps</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="group hover:bg-white/5 p-4 rounded-xl transition-all duration-300 cursor-pointer">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-blue-600/20 rounded-lg flex items-center justify-center group-hover:bg-blue-600/30 transition-colors">
                        <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM21 5a2 2 0 00-2-2h-4a2 2 0 00-2 2v12a4 4 0 004 4h4a2 2 0 002-2V5z" />
                        </svg>
                      </div>
                      <div>
                        <h4 className="text-white font-medium">UI/UX Designing</h4>
                        <p className="text-slate-400 text-sm">User-centered design experiences</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="group hover:bg-white/5 p-4 rounded-xl transition-all duration-300 cursor-pointer">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-blue-600/20 rounded-lg flex items-center justify-center group-hover:bg-blue-600/30 transition-colors">
                        <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
                        </svg>
                      </div>
                      <div>
                        <h4 className="text-white font-medium">Cloud Hosting</h4>
                        <p className="text-slate-400 text-sm">Scalable cloud infrastructure solutions</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            
           
          </div>
        </div>

        {/* Right Panel - Login Form */}
        <div className="w-full lg:w-1/2 flex items-center justify-center px-8 py-12">
          <div className="w-full max-w-md space-y-8">
            {/* Mobile Header */}
            <div className="lg:hidden text-center">
              <h1 className="text-3xl font-bold text-slate-800 mb-1">
                Omyra Technologies
              </h1>
              <p className="text-slate-600">Private Limited</p>
              <div className="w-12 h-0.5 bg-blue-600 mx-auto mt-3"></div>
            </div>

            {/* Welcome Section */}
            <div className="text-center space-y-2">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-50 rounded-2xl mb-4">
                <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
              </div>
              <h2 className="text-3xl font-bold text-slate-900">
                Welcome Back
              </h2>
              <p className="text-slate-600 text-lg">
                Please sign in to your account
              </p>
            </div>

            {/* Login Form */}
            <Card className="shadow-xl border-0 bg-white rounded-3xl overflow-hidden">
              <CardContent className="p-8">
                <form onSubmit={handleSignIn} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-semibold text-slate-700 uppercase tracking-wide">
                      Email Address
                    </Label>
                    <div className="relative">
                      <Input
                        id="email"
                        type="email"
                        placeholder="Enter your email address"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="h-14 pl-12 pr-4 border-2 border-gray-200 focus:border-blue-500 focus:ring-0 text-slate-900 rounded-xl bg-gray-50 focus:bg-white transition-all duration-200 placeholder:text-slate-400"
                      />
                      <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                        <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                        </svg>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-sm font-semibold text-slate-700 uppercase tracking-wide">
                      Password
                    </Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type="password"
                        placeholder="Enter your password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="h-14 pl-12 pr-4 border-2 border-gray-200 focus:border-blue-500 focus:ring-0 text-slate-900 rounded-xl bg-gray-50 focus:bg-white transition-all duration-200 placeholder:text-slate-400"
                      />
                      <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                        <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2">
                    <Button 
                      type="submit" 
                      size="lg"
                      className="w-full h-14 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02]"
                      disabled={loading}
                    >
                      {loading ? (
                        <div className="flex items-center justify-center space-x-3">
                          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                          <span>Signing In...</span>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center space-x-2">
                          <span>Sign In</span>
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                          </svg>
                        </div>
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>

            {/* Additional Info */}
            <div className="text-center space-y-4">
              <div className="flex items-center justify-center space-x-4 text-sm text-slate-500">
                <div className="flex items-center space-x-1">
                  <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.236 4.53L7.53 10.53a.75.75 0 00-1.06 1.061l2.03 2.03a.75.75 0 001.137-.089l3.857-5.401z" clipRule="evenodd" />
                  </svg>
                  <span>Secure Login</span>
                </div>
                <div className="w-1 h-1 bg-slate-400 rounded-full"></div>
                <div className="flex items-center space-x-1">
                  <svg className="w-4 h-4 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 1a4.5 4.5 0 00-4.5 4.5V9H5a2 2 0 00-2 2v6a2 2 0 002 2h10a2 2 0 002-2v-6a2 2 0 00-2-2h-.5V5.5A4.5 4.5 0 0010 1zm3 8V5.5a3 3 0 10-6 0V9h6z" clipRule="evenodd" />
                  </svg>
                  <span>Privacy Protected</span>
                </div>
              </div>
            </div>

            {/* Footer */}
            <footer className="text-center text-slate-500 text-sm lg:hidden">
              <p className="mb-2">
                © {new Date().getFullYear()} Omyra Technologies Private Limited
              </p>
              <p className="text-xs text-slate-400">All rights reserved</p>
            </footer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
