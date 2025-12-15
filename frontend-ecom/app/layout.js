// app/layout.js
import './globals.css';
import Header from '../components/Header';
import { Toaster } from 'react-hot-toast';

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col">
        <Header />

        {/* toast provider */}
        <Toaster
          position="top-center"
          toastOptions={{
            duration: 2000,
            style: {
              borderRadius: '12px',
              background: '#ffffff',
              color: '#0f172a',
              boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
              fontSize: '0.9rem',
            }
          }}
        />

        <main className="max-w-7xl mx-auto px-4 py-8 w-full flex-1">
          {children}
        </main>
      </body>
    </html>
  );
}
