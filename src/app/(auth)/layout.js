// app/(auth)/layout.jsx
export default function AuthLayout({ children }) {
    return (
      <div className="min-h-screen bg-surface-white flex flex-col">
        {/* Minimal header — just the logo */}
        {/* <div className="flex items-center justify-center py-8">
          <a href="/">
            <img src="/logo2.png" alt="Quran Odyssey" className="h-10 w-auto" />
          </a>
        </div> */}
  
        {/* Centered content */}
        <div className="flex items-center justify-center px-6 pb-12 pt-[10vw]">
          {children}
        </div>
  
        {/* Minimal footer */}
        <div className="text-center pb-8 text-[13px] text-content-muted">
          © 2026 Quran Odyssey. Built by VISAITECH.
        </div>
      </div>
    );
  }