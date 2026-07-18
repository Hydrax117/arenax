/**
 * Auth layout — no Navbar/Footer, centred single-column.
 * Shared by /login, /verify, /onboarding.
 */
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-svh flex flex-col items-center justify-center px-4 py-12 bg-bg-base relative overflow-hidden">
      {/* Ambient top-left glow */}
      <div
        className="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full pointer-events-none"
        style={{
          background:
            "radial-gradient(circle, rgba(0,224,90,0.06) 0%, transparent 70%)",
        }}
        aria-hidden="true"
      />
      {/* Bottom-right purple glow */}
      <div
        className="absolute -bottom-32 -right-32 w-[400px] h-[400px] rounded-full pointer-events-none"
        style={{
          background:
            "radial-gradient(circle, rgba(123,34,212,0.05) 0%, transparent 70%)",
        }}
        aria-hidden="true"
      />

      <div className="relative z-10 w-full max-w-md">{children}</div>
    </div>
  );
}
