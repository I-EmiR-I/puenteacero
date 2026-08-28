'use client';
import { Email } from '@/components/Auth/Email';
import { EmailAndPassword } from '@/components/Auth/EmailAndPassword';
import { EmailConfirmationPendingCard } from '@/components/Auth/EmailConfirmationPendingCard';
import { RedirectingPleaseWaitCard } from '@/components/Auth/RedirectingPleaseWaitCard';
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
  signInWithPasswordAction,
  signInWithProviderAction,
} from '@/data/auth/auth';
import { useAction } from 'next-safe-action/hooks';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useRef, useState } from 'react';
import { toast } from 'sonner';

export function Login({
  next,
}: {
  next?: string;
}) {
  const [emailSentSuccessMessage, setEmailSentSuccessMessage] = useState<
    string | null
  >(null);
  const [redirectInProgress, setRedirectInProgress] = useState(false);
  const toastRef = useRef<string | number | undefined>(undefined);

  const router = useRouter();

  function redirectToDashboard() {
    if (next) {
      router.push(`/auth/callback?next=${next}`);
    } else {
      router.push('/catalogo');
    }
  }

  const { execute: executeMagicLink, status: magicLinkStatus } = useAction(
    signInWithMagicLinkAction,
    {
      onExecute: () => {
        toastRef.current = toast.loading('Enviando correo mágico…');
      },
      onSuccess: () => {
        toast.success('¡Revisa tu correo! Te enviamos el enlace de acceso.', {
          id: toastRef.current,
        });
        toastRef.current = undefined;
        setEmailSentSuccessMessage(
          '¡Revisa tu correo! Te enviamos el enlace de acceso.'
        );
      },
      onError: (error) => {
        const errorMessage =
          error instanceof Error
            ? error.message
            : `No se pudo enviar el enlace ${String(error)}`;
        toast.error(errorMessage, {
          id: toastRef.current,
        });
        toastRef.current = undefined;
      },
    }
  );

  const { execute: executePassword, status: passwordStatus } = useAction(
    signInWithPasswordAction,
    {
      onExecute: () => {
        toastRef.current = toast.loading('Iniciando sesión…');
      },
      onSuccess: () => {
        toast.success('¡Sesión iniciada!', {
          id: toastRef.current,
        });
        toastRef.current = undefined;
        redirectToDashboard();
        setRedirectInProgress(true);
      },
      onError: (error) => {
        const errorMessage =
          error instanceof Error
            ? error.message
            : `No se pudo iniciar sesión ${String(error)}`;
        toast.error(errorMessage, {
          id: toastRef.current,
        });
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
      onSuccess: (payload) => {
        toast.success('Redirigiendo…', {
          id: toastRef.current,
        });
        toastRef.current = undefined;
        window.location.href = payload.data?.url || '/';
      },
      onError: () => {
        toast.error('No se pudo iniciar sesión', {
          id: toastRef.current,
        });
        toastRef.current = undefined;
      },
    }
  );

  return (
    <div
      data-success={emailSentSuccessMessage}
      className="container data-success:flex items-center data-success:justify-center text-left max-w-lg mx-auto overflow-auto data-success:h-full min-h-[470px]"
    >
      {emailSentSuccessMessage ? (
        <EmailConfirmationPendingCard
          type={'login'}
          heading={'Enlace de confirmación enviado'}
          message={emailSentSuccessMessage}
          resetSuccessMessage={setEmailSentSuccessMessage}
        />
      ) : redirectInProgress ? (
        <RedirectingPleaseWaitCard
          message="Estamos redirigiéndote a tu cuenta."
          heading="Redirigiendo…"
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
                  <CardTitle className="text-xl">Inicia sesión</CardTitle>
                  <CardDescription>
                    Accede con la cuenta que usaste al registrarte.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-2 p-0">
                  <EmailAndPassword
                    isLoading={passwordStatus === 'executing'}
                    onSubmit={(data) => {
                      executePassword({
                        email: data.email,
                        password: data.password,
                      });
                    }}
                    view="sign-in"
                  />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="magic-link">
              <Card className="border-none shadow-none">
                <CardHeader className="px-0 pt-6">
                  <CardTitle className="text-xl">Inicia sesión</CardTitle>
                  <CardDescription>
                    Te enviamos un enlace mágico a tu correo.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-2 p-0">
                  <Email
                    onSubmit={(email) => executeMagicLink({ email, next })}
                    isLoading={magicLinkStatus === 'executing'}
                    view="sign-in"
                  />
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="social-login">
              <Card className="border-none shadow-none">
                <CardHeader className="px-0 pt-6">
                  <CardTitle className="text-xl">Inicia sesión</CardTitle>
                  <CardDescription>
                    Usa tu cuenta de redes sociales.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-2 p-0">
                  <RenderProviders
                    providers={['google', 'github', 'twitter']}
                    isLoading={providerStatus === 'executing'}
                    onProviderLoginRequested={(
                      provider: 'google' | 'github' | 'twitter'
                    ) => executeProvider({ provider, next })}
                  />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
          <p className="text-center text-sm text-muted-foreground">
            ¿No tienes cuenta?{' '}
            <Link
              href="/sign-up"
              className="font-semibold text-primary hover:underline"
            >
              Regístrate
            </Link>
          </p>
        </div>
      )}
    </div>
  );
}
