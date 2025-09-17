'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Card, CardBody } from '@heroui/card';
import { Button } from '@heroui/button';
import { Spinner } from '@heroui/spinner';

// Custom SVG Icons
const XCircleIcon = () => (
  <svg
    className="w-20 h-20 text-red-500"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
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

const RefreshIcon = () => (
  <svg
    className="w-5 h-5"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
    />
  </svg>
);

const SupportIcon = () => (
  <svg
    className="w-5 h-5"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
    />
  </svg>
);

export default function PaymentFailedPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [paymentDetails, setPaymentDetails] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Extract payment details from URL parameters
    const externalId = searchParams.get('external_id');
    const amount = searchParams.get('amount');
    const paymentMethod = searchParams.get('payment_method');
    const failureReason = searchParams.get('failure_reason');
    const invoiceId = searchParams.get('invoice_id');
    const failedAt = searchParams.get('failed_at');

    if (externalId || amount) {
      setPaymentDetails({
        externalId,
        amount: amount ? parseInt(amount) : null,
        paymentMethod,
        failureReason,
        invoiceId,
        failedAt: failedAt ? new Date(failedAt).toLocaleString() : null,
      });
    }

    setLoading(false);
  }, [searchParams]);

  const handleRetryPayment = () => {
    // Redirect back to fantasy page to retry payment
    router.push('/fantasy');
  };

  const handleBackToHome = () => {
    router.push('/');
  };

  const handleContactSupport = () => {
    // You can implement contact support functionality here
    // For now, just redirect to home with a query parameter
    router.push('/?contact=support');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-rose-100">
        <Spinner size="lg" color="danger" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-rose-100 p-4 flex items-center justify-center">
      <div className="w-full max-w-sm mx-auto">
        <Card className="shadow-xl border-0">
          <CardBody className="text-center p-8">
            {/* Failed Icon */}
            <div className="flex justify-center mb-6">
              <div className="bg-red-100 rounded-full p-4">
                <XCircleIcon />
              </div>
            </div>

            {/* Failed Message */}
            <h1 className="text-2xl font-bold text-gray-900 mb-3">
              Payment Failed
            </h1>
            <p className="text-gray-600 mb-6">
              We couldn't process your payment. Please try again or contact support if the problem persists.
            </p>

            {/* Return to App Instruction */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
              <p className="text-sm text-blue-800 font-medium">
                Please return to the app to try again or contact support.
              </p>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}