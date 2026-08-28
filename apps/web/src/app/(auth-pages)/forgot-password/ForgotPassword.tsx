'use client';

import { useAction } from 'next-safe-action/hooks';
import { useRef, useState, type JSX } from 'react';
import { toast } from 'sonner';

import { Email } from '@/components/Auth/Email';
import { EmailConfirmationPendingCard } from '@/components/Auth/EmailConfirmationPendingCard';
import { Card } from '@/components/ui/card';
import { resetPasswordAction } from '@/data/auth/auth';

export function ForgotPassword(): JSX.Element {
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const toastRef = useRef<string | number | undefined>(undefined);

  const { execute, status } = useAction(resetPasswordAction, {
    onExecute: () => {
      toastRef.current = toast.loading('Enviando enlace de recuperación…');
    },
    onSuccess: () => {
      toast.success('¡Enlace enviado!', {
        id: toastRef.current,
      });
      toastRef.current = undefined;
      setSuccessMessage('Te enviamos un enlace para restablecer tu contraseña.');
    },
    onError: ({ error }) => {
      const errorMessage =
        error.serverError ?? 'No se pudo enviar el enlace de recuperación';
      toast.error(errorMessage, {
        id: toastRef.current,
      });
      toastRef.current = undefined;
    },
  });

  return (
    <>
      {successMessage ? (
        <EmailConfirmationPendingCard
          message={successMessage}
          heading="Enlace enviado"
          type="reset-password"
          resetSuccessMessage={setSuccessMessage}
        />
      ) : (
        <Card className="container h-full grid items-center text-left max-w-lg mx-auto overflow-auto">
          <div className="space-y-4">
            <div className="space-y-1">
              <p className="font-mono text-xs uppercase tracking-[0.18em] text-primary">
                Recuperar acceso
              </p>
              <h1 className="text-xl font-bold tracking-tight">
                Olvidé mi contraseña
              </h1>
              <p className="text-sm text-muted-foreground">
                Ingresa tu correo y te enviamos un enlace para restablecerla.
              </p>
            </div>

            <Email
              onSubmit={(email) => {
                execute({ email });
              }}
              isLoading={status === 'executing'}
              view="forgot-password"
            />
          </div>
        </Card>
      )}
    </>
  );
}
