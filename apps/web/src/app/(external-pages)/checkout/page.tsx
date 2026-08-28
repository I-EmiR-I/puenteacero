import { CheckoutForm } from './checkout-form';

export default function CheckoutPage() {
  return (
    <div className="container mx-auto max-w-screen-lg px-4 py-6">
      <h1 className="mb-6 text-2xl font-bold">Finalizar compra</h1>
      <CheckoutForm />
    </div>
  );
}
