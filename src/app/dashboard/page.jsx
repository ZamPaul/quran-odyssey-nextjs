// app/dashboard/page.jsx
import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';

export const metadata = {
  title: 'Dashboard — Quran Odyssey',
};

export default async function DashboardPage() {
  const { userId, getToken } = await auth();

  if (!userId) {
    redirect('/login');
  }

  // Check if student profile exists
  const token = await getToken();
  const res = await fetch(
    `${process.env.API_URL}/api/students/profile`,
    {
      headers: { Authorization: `Bearer ${token}` },
      cache: 'no-store',
    }
  );

  const data = await res.json();

  // No profile = they skipped the profile step somehow
  // Send them back to complete it
  if (!data.profile) {
    redirect('/register/profile');
  }

  return (
    <div className="min-h-screen bg-surface-off-white flex items-center justify-center">
      <div className="text-center">
        <div className="text-[40px] mb-4">🎉</div>
        <h1 className="text-[24px] font-[800] text-content-primary mb-2">
          Welcome, {data.profile.parentName}!
        </h1>
        <p className="text-content-muted mb-6">
          {data.profile.childName}&apos;s account is ready.
          Your full dashboard is coming in Phase 9.
        </p>
        <div className="inline-flex rounded-[var(--radius)] border border-line-light bg-white px-5 py-3 text-[14px] font-[700] text-content-primary">
          Booking flow coming next →
        </div>
      </div>
    </div>
  );
}