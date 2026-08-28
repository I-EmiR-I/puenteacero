'use client';

import { useAction } from 'next-safe-action/hooks';
import { useRef, useState } from 'react';
import { toast } from 'sonner';

import { Email } from '@/components/Auth/Email';
import { EmailAndPassword } from '@/components/Auth/EmailAndPassword';
import { EmailConfirmationPendingCard } from '@/components/Auth/EmailConfirmationPendingCard';
import { RenderProviders } from '@/components/Auth/RenderProviders';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

import {
  signInWithMagicLinkAction,
  signInWithProviderAction,
  signUpAction,
} from '@/data/auth/auth';
import type { AuthProvider } from '@/types';
import Link from 'next/link';

interface SignUpProps {
  next?: string;
}

export function SignUp({ next }: SignUpProps) {
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const toastRef = useRef<string | number | undefined>(undefined);

  const { execute: executeMagicLink, status: magicLinkStatus } = useAction(
    signInWithMagicLinkAction,
    {
      onExecute: () => {
        toastRef.current = toast.loading('Enviando correo mágico…');
      },
      onSuccess: () => {
        toast.success('¡Revisa tu correo! Te enviamos el enlace.', {
          id: toastRef.current,
        });
        toastRef.current = undefined;
        setSuccessMessage('¡Revisa tu correo! Te enviamos el enlace.');
      },
      onError: ({ error }) => {
        const errorMessage =
          error.serverError ?? 'No se pudo enviar el correo mágico';
        toast.error(errorMessage, { id: toastRef.current });
        toastRef.current = undefined;
      },
    }
  );

  const { execute: executeSignUp, status: signUpStatus } = useAction(
    signUpAction,
    {
      onExecute: () => {
        toastRef.current = toast.loading('Creando cuenta…');
      },
      onSuccess: () => {
        toast.success('¡Cuenta creada!', { id: toastRef.current });
        toastRef.current = undefined;
        setSuccessMessage(
          'Te enviamos un enlace de confirmación a tu correo.'
        );
      },
      onError: ({ error }) => {
        const errorMessage =
          error.serverError ?? 'No se pudo crear la cuenta';
        toast.error(errorMessage, { id: toastRef.current });
        toastRef.current = undefined;
      },
    }
  );

  const { execute: executeProvider, status: providerStatus } = useAction(
    signInWithProviderAction,
    {
      onExecute: () => {
        toastRef.current = toast.loading('Solicitando acceso…');
      },
      onSuccess: ({ data }) => {
        toast.success('Redirigiendo…', { id: toastRef.current });
        toastRef.current = undefined;
        if (data?.url) {
          window.location.href = data.url;
        }
      },
      onError: ({ error }) => {
        const errorMessage = error.serverError ?? 'No se pudo iniciar sesión';
        toast.error(errorMessage, { id: toastRef.current });
        toastRef.current = undefined;
      },
    }
  );

  return (
    <div
      data-success={successMessage}
      className="container data-success:flex items-center data-success:justify-center text-left max-w-lg mx-auto overflow-auto data-success:h-full min-h-[470px]"
    >
      {successMessage ? (
        <EmailConfirmationPendingCard
          type="sign-up"
          heading="Enlace de confirmación enviado"
          message={successMessage}
          resetSuccessMessage={setSuccessMessage}
        />
      ) : (
        <div className="space-y-8 rounded-xl border bg-card p-8 shadow-sm">
          <Tabs defaultValue="password" className="md:min-w-[400px]">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="password">Contraseña</TabsTrigger>
              <TabsTrigger value="magic-link">Correo mágico</TabsTrigger>
              <TabsTrigger value="social-login">Social</TabsTrigger>
            </TabsList>

            <TabsContent value="password">
              <Card className="border-none shadow-none">
                <CardHeader className="px-0 pt-6">
                  <CardTitle className="text-xl">Crea tu cuenta</CardTitle>
                  <CardDescription>
                    Regístrate con tu correo y contraseña.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-2 p-0">
                  <EmailAndPassword
                    isLoading={signUpStatus === 'executing'}
                    onSubmit={(data) => {
                      executeSignUp({ ...data, next });
                    }}
                    view="sign-up"
                  />
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="magic-link">
              <Card className="border-none shadow-none">
                <CardHeader className="px-0 pt-6">
                  <CardTitle className="text-xl">Crea tu cuenta</CardTitle>
                  <CardDescription>
                    Te enviamos un enlace mágico a tu correo.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-2 p-0">
                  <Email
                    onSubmit={(email) => executeMagicLink({ email, next })}
                    isLoading={magicLinkStatus === 'executing'}
                    view="sign-up"
                  />
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="social-login">
              <Card className="border-none shadow-none">
                <CardHeader className="px-0 pt-6">
                  <CardTitle className="text-xl">Crea tu cuenta</CardTitle>
                  <CardDescription>
                    Regístrate con tu cuenta de redes sociales.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-2 p-0">
                  <RenderProviders
                    providers={['google', 'github', 'twitter']}
                    isLoading={providerStatus === 'executing'}
                    onProviderLoginRequested={(
                      provider: Extract<
                        AuthProvider,
                        'google' | 'github' | 'twitter'
                      >
                    ) => executeProvider({ provider, next })}
                  />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
          <p className="text-center text-sm text-muted-foreground">
            ¿Ya tienes cuenta?{' '}
            <Link
              href="/login"
              className="font-semibold text-primary hover:underline"
            >
              Inicia sesión
            </Link>
          </p>
        </div>
      )}
    </div>
  );
}
