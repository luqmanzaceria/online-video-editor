// src/app/page.tsx
import Link from "next/link";

export default function Home() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-4">Online Video Editor</h1>
      <Link
        href="/editor"
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
      >
        Go to Editor
      </Link>
    </div>
  );
}
