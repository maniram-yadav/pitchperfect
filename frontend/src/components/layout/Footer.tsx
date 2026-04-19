'use client';

export default function Footer() {
  return (
    <footer className="bg-primary text-white py-8 mt-16">
      <div className="max-w-7xl mx-auto px-4 text-center">
        <p className="mb-2">&copy; 2024 PitchPerfect. All rights reserved.</p>
        <div className="flex gap-4 justify-center text-sm">
          <a href="#" className="hover:text-secondary">
            Privacy
          </a>
          <a href="#" className="hover:text-secondary">
            Terms
          </a>
          <a href="#" className="hover:text-secondary">
            Contact
          </a>
        </div>
      </div>
    </footer>
  );
}
