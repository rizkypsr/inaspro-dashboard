'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@heroui/button';
import { Card, CardBody, CardHeader } from '@heroui/card';
import { Chip } from '@heroui/chip';
import { Tabs, Tab } from '@heroui/tabs';
import { Spinner } from '@heroui/spinner';

import TeamsTab from '../../components/teams-tab';
import ShoesTab from '../../components/shoes-tab';
import RegistrationsTab from '../../components/registrations-tab';
import PaymentsTab from '../../components/payments-tab';
import { EventProvider } from '../../context/event-context';
import { fantasyService, type Fantasy } from '@/lib/services/fantasy-service';
import { Timestamp } from 'firebase/firestore';

// Convert Firestore Timestamp to Date for display
const formatDate = (date: Date | Timestamp) => {
  const dateObj = date instanceof Timestamp ? date.toDate() : date;
  return dateObj.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

export default function EventDetailPage() {
  const params = useParams();
  const router = useRouter();
  const eventId = params.id as string;
  
  const [event, setEvent] = useState<Fantasy | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        setLoading(true);
        setError(null);
        const eventData = await fantasyService.getFantasyById(eventId);
        setEvent(eventData);
      } catch (err) {
        console.error('Error fetching event:', err);
        setError('Failed to load event data');
      } finally {
        setLoading(false);
      }
    };

    if (eventId) {
      fetchEvent();
    }
  }, [eventId]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published': return 'success';
      case 'ongoing': return 'primary';
      case 'completed': return 'default';
      case 'draft': return 'warning';
      default: return 'default';
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button
            isIconOnly
            variant="light"
            onPress={() => router.back()}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M15 18L9 12L15 6" />
            </svg>
          </Button>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Loading Event...
          </h1>
        </div>
        <Card>
          <CardBody>
            <div className="flex justify-center items-center py-8">
              <Spinner size="lg" />
            </div>
          </CardBody>
        </Card>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button
            isIconOnly
            variant="light"
            onPress={() => router.back()}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M15 18L9 12L15 6" />
            </svg>
          </Button>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {error ? 'Error Loading Event' : 'Event Not Found'}
          </h1>
        </div>
        <Card>
          <CardBody>
            <p className="text-center text-gray-500 py-8">
              {error || 'The requested event could not be found.'}
            </p>
          </CardBody>
        </Card>
      </div>
    );
  }

  return (
    <EventProvider>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button
            isIconOnly
            variant="light"
            onPress={() => router.back()}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M15 18L9 12L15 6" />
            </svg>
          </Button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {event.title}
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Event Management Dashboard
            </p>
          </div>
          <Chip
            size="lg"
            color="success"
            variant="flat"
          >
            ACTIVE
          </Chip>
        </div>

        {/* Event Overview */}
        <Card>
          <CardHeader>
            <h2 className="text-xl font-semibold">Event Overview</h2>
          </CardHeader>
          <CardBody>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
              <div>
                <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-2">Notes</h4>
                <p className="text-gray-600 dark:text-gray-400">{event.notes || 'No notes available'}</p>
              </div>
              <div>
                <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-2">Event Schedule</h4>
                <p className="text-gray-600 dark:text-gray-400">
                  {formatDate(event.schedule)}
                </p>
              </div>
              <div>
                <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-2">Venue</h4>
                <p className="text-gray-600 dark:text-gray-400">{event.venue}</p>
              </div>
              <div>
                <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-2">Address</h4>
                <p className="text-gray-600 dark:text-gray-400">{event.address}</p>
              </div>
              <div>
                <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-2">Registration Fee</h4>
                <p className="text-gray-600 dark:text-gray-400">
                  Rp {event.registrationFee.toLocaleString()}
                  {event.international && <><br /><span className="text-sm text-blue-600">International Event</span></>}
                </p>
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Statistics */}
        <Card>
          <CardHeader>
            <h2 className="text-xl font-semibold">Event Statistics</h2>
          </CardHeader>
          <CardBody>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">8</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Registered Teams</div>
              </div>
              <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">24</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Total Players</div>
              </div>
              <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">15</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Shoes Ordered</div>
              </div>
              <div className="text-center p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">6</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Payments Received</div>
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Management Tabs */}
        <Card>
          <CardBody>
            <Tabs aria-label="Event management tabs" variant="underlined">
              <Tab key="teams" title="Teams">
                <TeamsTab />
              </Tab>
              <Tab key="shoes" title="Shoes">
                <ShoesTab />
              </Tab>
              <Tab key="registrations" title="Registrations">
                <RegistrationsTab />
              </Tab>
              <Tab key="payments" title="Payments">
                <PaymentsTab />
              </Tab>
            </Tabs>
          </CardBody>
        </Card>
      </div>
    </EventProvider>
  );
}