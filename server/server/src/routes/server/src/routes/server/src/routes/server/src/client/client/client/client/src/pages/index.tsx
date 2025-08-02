import React from 'react';
import Head from 'next/head';
import Link from 'next/link';

const HomePage: React.FC = () => {
  return (
    <>
      <Head>
        <title>CivicTrack | Report Civic Issues</title>
        <meta name="description" content="Empowering communities to report and resolve civic issues like road damage, garbage, water leaks, and more." />
      </Head>

      <main className="flex flex-col items-center justify-center min-h-screen p-6 bg-gray-100">
        <h1 className="text-4xl font-bold mb-4 text-center text-blue-600">
          Welcome to CivicTrack
        </h1>
        <p className="text-lg text-gray-700 text-center max-w-xl mb-6">
          Report issues like potholes, water leaks, broken lights, and garbage around you. Your reports help your local authorities take action faster.
        </p>

        <div className="flex gap-4">
          <Link href="/report">
            <a className="px-6 py-3 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition">
              Report an Issue
            </a>
          </Link>
          <Link href="/map">
            <a className="px-6 py-3 bg-green-600 text-white rounded-lg shadow hover:bg-green-700 transition">
              View Nearby Issues
            </a>
          </Link>
        </div>
      </main>
    </>
  );
};

export default HomePage;

client/
├── src/
│   ├── pages/
│   │   ├── index.tsx   ← (this file)
│   │   ├── report.tsx  ← (for issue submission)
│   │   └── map.tsx     ← (to view issues on map)
