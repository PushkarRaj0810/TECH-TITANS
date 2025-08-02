import React, { useState } from 'react';
import Head from 'next/head';
import axios from 'axios';

const categories = [
  'Roads',
  'Lighting',
  'Water Supply',
  'Cleanliness',
  'Public Safety',
  'Obstructions',
];

const ReportIssuePage: React.FC = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState(categories[0]);
  const [photos, setPhotos] = useState<File[]>([]);
  const [anonymous, setAnonymous] = useState(false);
  const [status, setStatus] = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files).slice(0, 5);
      setPhotos(selectedFiles);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('description', description);
      formData.append('category', category);
      formData.append('anonymous', String(anonymous));
      photos.forEach((file, idx) => {
        formData.append('photos', file);
      });

      const response = await axios.post(`${process.env.NEXT_PUBLIC_API_BASE_URL}/issues`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setStatus('Report submitted successfully!');
      setTitle('');
      setDescription('');
      setCategory(categories[0]);
      setPhotos([]);
      setAnonymous(false);
    } catch (error) {
      console.error(error);
      setStatus('Something went wrong while submitting the issue.');
    }
  };

  return (
    <>
      <Head>
        <title>Report Issue | CivicTrack</title>
      </Head>

      <main className="max-w-3xl mx-auto py-8 px-6">
        <h1 className="text-3xl font-bold mb-6 text-blue-700">Report an Issue</h1>

        <form onSubmit={handleSubmit} className="space-y-6 bg-white shadow p-6 rounded-lg">
          <div>
            <label className="block font-semibold">Title</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full p-2 border rounded"
            />
          </div>

          <div>
            <label className="block font-semibold">Description</label>
            <textarea
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-2 border rounded h-24"
            />
          </div>

          <div>
            <label className="block font-semibold">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full p-2 border rounded"
            >
              {categories.map((cat) => (
                <option key={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-semibold">Upload Photos (max 5)</label>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileChange}
            />
            <p className="text-sm text-gray-500">Images selected: {photos.length}</p>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={anonymous}
              onChange={(e) => setAnonymous(e.target.checked)}
            />
            <label>Submit as anonymous</label>
          </div>

          <button
            type="submit"
            className="bg-blue-600 text-white px-5 py-2 rounded hover:bg-blue-700 transition"
          >
            Submit Report
          </button>

          {status && <p className="text-green-600 mt-2">{status}</p>}
        </form>
      </main>
    </>
  );
};

export default ReportIssuePage;
