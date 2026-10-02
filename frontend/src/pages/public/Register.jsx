import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Mail, Lock, User, Globe, Phone, UserPlus } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Card, CardContent, CardFooter } from '@/components/ui/Card';
import { SUPPORTED_COUNTRIES } from '@/lib/constants';

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  country: z.string().min(2, 'Please select a country'),
  phone: z.string().optional(),
});

export function Register() {
  const navigate = useNavigate();
  const { register: registerUser, isRegistering } = useAuth();

  const {
    register,
    handleSubmit,
    watch,
    setError,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      country: 'US',
    },
  });

  const passwordVal = watch('password', '');
  const getPasswordStrength = (pass) => {
    if (!pass) return 0;
    let score = 0;
    if (pass.length >= 6) score += 33;
    if (/[A-Z]/.test(pass) || /[0-9]/.test(pass)) score += 33;
    if (/[^A-Za-z0-9]/.test(pass) && pass.length >= 8) score += 34;
    return score;
  };
  const strength = getPasswordStrength(passwordVal);

  const onSubmit = async (data) => {
    try {
      await registerUser(data);
      navigate('/app');
    } catch (err) {
      if (err.fieldErrors) {
        Object.entries(err.fieldErrors).forEach(([field, msg]) => {
          setError(field, { message: msg });
        });
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex h-12 w-12 rounded-2xl bg-gradient-to-tr from-brand-600 to-brand-400 items-center justify-center text-white font-extrabold text-2xl shadow-xl shadow-brand-500/30">
            GP
          </div>
          <h1 className="text-2xl font-extrabold text-white">Create GlobalPay Account</h1>
          <p className="text-xs text-slate-400">Join thousands sending money worldwide in real time</p>
        </div>

        <Card className="bg-slate-800/80 border-slate-700 shadow-2xl">
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <Input
                label="Full Name"
                placeholder="John Doe"
                leftIcon={<User className="w-4 h-4" />}
                error={errors.name?.message}
                {...register('name')}
              />

              <Input
                label="Email Address"
                type="email"
                placeholder="user@example.com"
                leftIcon={<Mail className="w-4 h-4" />}
                error={errors.email?.message}
                {...register('email')}
              />

              <div>
                <Input
                  label="Password"
                  type="password"
                  placeholder="••••••••"
                  leftIcon={<Lock className="w-4 h-4" />}
                  error={errors.password?.message}
                  {...register('password')}
                />
                {passwordVal && (
                  <div className="mt-1.5 space-y-1">
                    <div className="h-1.5 w-full bg-slate-700 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-300 ${
                          strength > 66 ? 'bg-emerald-500' : strength > 33 ? 'bg-amber-500' : 'bg-rose-500'
                        }`}
                        style={{ width: `${strength}%` }}
                      />
                    </div>
                    <p className="text-[10px] text-slate-400">
                      Strength: {strength > 66 ? 'Strong' : strength > 33 ? 'Medium' : 'Weak'}
                    </p>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Select label="Country" error={errors.country?.message} {...register('country')}>
                  {SUPPORTED_COUNTRIES.map((c) => (
                    <option key={c.code} value={c.code}>
                      {c.flag} {c.name}
                    </option>
                  ))}
                </Select>

                <Input
                  label="Phone (Optional)"
                  placeholder="+1 555-0199"
                  leftIcon={<Phone className="w-4 h-4" />}
                  error={errors.phone?.message}
                  {...register('phone')}
                />
              </div>

              <Button type="submit" size="lg" className="w-full mt-2" isLoading={isRegistering}>
                <UserPlus className="w-4 h-4" /> Create Account
              </Button>
            </form>
          </CardContent>

          <CardFooter className="justify-center text-xs text-slate-400 border-slate-700/60">
            Already have an account?{' '}
            <NavLink to="/login" className="ml-1 font-semibold text-brand-400 hover:underline">
              Log In
            </NavLink>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
