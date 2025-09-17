'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Card, CardBody } from '@heroui/card';
import { Button } from '@heroui/button';
import { Spinner } from '@heroui/spinner';

// Custom SVG Icons
const CheckCircleIcon = () => (
  <svg
    className="w-20 h-20 text-green-500"
    fill="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      fillRule="evenodd"
      d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm13.36-1.814a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z"
      clipRule="evenodd"
    />
  </svg>
);

const ArrowRightIcon = () => (
  <svg
    className="w-5 h-5"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      d="M13 7l5 5m0 0l-5 5m5-5H6"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
    />
  </svg>
);

const HomeIcon = () => (
  <svg
    className="w-5 h-5"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
    />
  </svg>
);

export default function PaymentSuccessPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [paymentDetails, setPaymentDetails] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Extract payment details from URL parameters
    const externalId = searchParams.get('external_id');
    const amount = searchParams.get('amount');
    const paymentMethod = searchParams.get('payment_method');
    const paidAt = searchParams.get('paid_at');
    const invoiceId = searchParams.get('invoice_id');

    if (externalId || amount) {
      setPaymentDetails({
        externalId,
        amount: amount ? parseInt(amount) : null,
        paymentMethod,
        paidAt: paidAt ? new Date(paidAt).toLocaleString() : null,
        invoiceId,
      });
    }

    setLoading(false);
  }, [searchParams]);

  const handleBackToHome = () => {
    router.push('/');
  };

  const handleBackToFantasy = () => {
    router.push('/fantasy');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100">
        <Spinner size="lg" color="success" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 p-4 flex items-center justify-center">
      <div className="w-full max-w-sm mx-auto">
        <Card className="shadow-xl border-0">
          <CardBody className="text-center p-8">
            {/* Success Icon */}
            <div className="flex justify-center mb-6">
              <div className="bg-green-100 rounded-full p-4">
                <CheckCircleIcon />
              </div>
            </div>

            {/* Success Message */}
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Payment Successful!
            </h1>
            <p className="text-gray-600 mb-8 leading-relaxed">
              Your payment has been processed successfully. Thank you for your purchase!
            </p>

            {/* Return Instruction */}
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
              <p className="text-sm text-blue-800 font-medium">
                You can now return to the app to continue your experience.
              </p>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}