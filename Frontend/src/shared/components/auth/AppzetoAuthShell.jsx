import { DEFAULT_BRAND_LOGO, logoFallback } from "@/shared/constants/brandLogo";

/**
 * The frame every sign-in, sign-up and onboarding screen on the platform sits
 * in.
 *
 * Shared rather than copied so they cannot drift. Each module used to bring its
 * own look to the first screen a partner ever sees — food-delivery red here, a
 * plain white form there — so signing in to one part of the district's platform
 * looked like arriving at a different product.
 *
 * Appzeto's palette: deep forest green, the gold used across the consumer
 * app, and the Dimasa weave. The weave and the ambient glow are drawn in CSS on
 * purpose — a sign-in page should not wait on a remote image to look like
 * itself. The typography classes are declared here rather than in
 * appzeto.css, which is only imported inside the consumer bundle; the fonts
 * themselves are loaded globally by index.html.
 */
export default function AppzetoAuthShell({
  children,
  /** Line under the wordmark. Defaults to the whole platform. */
  blurb = 'The administration and partner console for food, rides, stays, tours and services across the platform.',
  /** Bulleted list in the identity panel — a module names what it covers. */
  points = ['Food & Dining', 'Rides & Taxi', 'Hotels & Stays', 'Tours & Travel', 'Delivery Logistics'],
  /** Widen for forms with two columns, narrow for a single field. */
  width = '940px',
  /** The crest for this audience — each panel has its own. */
  logo = DEFAULT_BRAND_LOGO,
}) {
  return (
    <div className="dh-auth relative flex min-h-dvh w-full items-center justify-center overflow-hidden bg-white px-4 py-8 sm:py-12">
      <style>{`
        .dh-auth { font-family: 'Poppins', 'Montserrat', sans-serif; }
        .dh-auth .dh-cinzel { font-family: 'Cinzel', serif; }
        .dh-auth .dh-playfair { font-family: 'Playfair Display', serif; }
        .dh-auth .dh-montserrat { font-family: 'Montserrat', sans-serif; }

        /* Smooth overrides for forms using legacy palette */
        .dh-auth h1, .dh-auth h2, .dh-auth .text-\[\#f4efe2\] { color: #0f172a !important; }
        .dh-auth .text-\[\#9fb3a4\], .dh-auth .text-\[\#cbd8cd\] { color: #475569 !important; }
        .dh-auth .text-\[\#5d7264\] { color: #64748b !important; }
        .dh-auth .text-\[\#caa83e\] { color: #0d9488 !important; }
        .dh-auth .hover\:text-\[\#e8c558\]:hover { color: #0f766e !important; }
        .dh-auth .border-\[\#caa83e\]\/20,
        .dh-auth .border-\[\#caa83e\]\/30,
        .dh-auth .border-\[\#caa83e\]\/35 { border-color: #e2e8f0 !important; }

        .dh-auth input:-webkit-autofill,
        .dh-auth input:-webkit-autofill:hover,
        .dh-auth input:-webkit-autofill:focus {
          -webkit-text-fill-color: #0f172a !important;
          -webkit-box-shadow: 0 0 0 1000px #ffffff inset !important;
          caret-color: #0f172a;
          transition: background-color 5000s ease-in-out 0s !important;
        }
      `}</style>

      {/* Subtle modern ambient background glow on white */}
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-20 -top-24 h-[440px] w-[440px] rounded-full bg-teal-100/40 blur-[100px]" />
        <div className="absolute -bottom-32 -right-20 h-[480px] w-[480px] rounded-full bg-emerald-100/40 blur-[110px]" />
        <div className="absolute left-1/2 top-1/2 h-[550px] w-[550px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-slate-100/50 blur-[100px]" />
      </div>

      <div
        style={{ '--dh-auth-w': width }}
        className="relative z-10 w-full max-w-(--dh-auth-w) overflow-hidden rounded-[24px] border border-slate-200/90 bg-white shadow-[0_20px_50px_rgba(0,0,0,0.06)] backdrop-blur-sm"
      >
        <div className="h-1.5 w-full bg-gradient-to-r from-teal-500 via-emerald-500 to-teal-400" />

        <div className="grid grid-cols-1 md:grid-cols-[1.05fr_1fr]">
          {/* Identity panel */}
          <div className="relative hidden flex-col justify-between gap-8 border-r border-slate-200/80 bg-gradient-to-br from-teal-50/50 via-slate-50/30 to-white p-9 md:flex lg:p-11">
            <div>
              <img
                src={logo}
                onError={logoFallback}
                alt="Appzeto"
                className="h-14 w-auto max-w-[220px] object-contain drop-shadow-sm"
              />

              <h1 className="dh-montserrat mt-6 text-[26px] font-black leading-tight tracking-tight text-slate-900 lg:text-[30px]">
                Appzeto
              </h1>

              <div className="mt-2 flex items-center gap-2">
                <span className="h-0.5 w-8 rounded-full bg-teal-600" />
                <span className="dh-montserrat text-[10px] font-bold uppercase tracking-[0.25em] text-teal-700">
                  Reflect / Technology
                </span>
                <span className="h-px flex-1 bg-teal-200/60" />
              </div>

              <p className="mt-5 max-w-[32ch] text-sm leading-relaxed text-slate-600">
                {blurb}
              </p>
            </div>

            <ul className="space-y-2.5">
              {points.map((service) => (
                <li key={service} className="flex items-center gap-2.5 text-[13px] font-medium text-slate-700">
                  <span className="h-2 w-2 rounded-full bg-teal-500 shadow-sm" />
                  {service}
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-white p-7 sm:p-9 lg:p-11">
            {/* Logo on mobile view */}
            <img
              src={logo}
              onError={logoFallback}
              alt="Appzeto"
              className="mx-auto mb-6 h-12 w-auto max-w-[200px] object-contain md:hidden"
            />
            {children}
          </div>
        </div>

        <div className="h-1.5 w-full bg-gradient-to-r from-teal-500 via-emerald-500 to-teal-400" />
      </div>
    </div>
  );
}

/** The shared field frame: clean light slate border, crisp white well, teal focus. */
export const authFieldClass = (hasError) =>
  `flex items-center rounded-xl border bg-slate-50/70 transition-all focus-within:bg-white focus-within:border-teal-500 focus-within:ring-2 focus-within:ring-teal-500/10 ${
    hasError ? "border-red-400 bg-red-50/20" : "border-slate-200 hover:border-slate-300"
  }`;

export const authLabelClass =
  "dh-montserrat mb-1.5 block text-[11px] font-bold uppercase tracking-[0.14em] text-slate-600";

export const authInputClass =
  "h-12 flex-1 border-none bg-transparent px-3 text-sm text-slate-900 placeholder-slate-400 outline-none focus:outline-none focus:ring-0";

export const authButtonClass =
  "dh-montserrat flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-teal-600 to-emerald-600 text-sm font-bold uppercase tracking-[0.16em] text-white shadow-[0_8px_20px_rgba(13,148,136,0.25)] transition-all hover:from-teal-700 hover:to-emerald-700 hover:shadow-[0_10px_24px_rgba(13,148,136,0.35)] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-70";

export const DimaHasaoAuthShell = AppzetoAuthShell;

